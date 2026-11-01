package clusterctl

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

const (
	exitOK      = 0
	exitUsage   = 2
	exitFailure = 1
)

type App struct {
	Out        io.Writer
	Err        io.Writer
	Runner     CommandRunner
	LookPath   LookPathFunc
	WorkingDir string
}

func NewApp(out, errOut io.Writer) *App {
	workingDir, err := os.Getwd()
	if err != nil {
		workingDir = "."
	}
	return &App{
		Out:        out,
		Err:        errOut,
		Runner:     ExecRunner{},
		LookPath:   exec.LookPath,
		WorkingDir: workingDir,
	}
}

func (a *App) Run(ctx context.Context, args []string) int {
	if len(args) == 0 {
		a.printUsage()
		return exitUsage
	}
	switch args[0] {
	case "doctor":
		return a.runDoctor(ctx, args[1:])
	case "drift":
		return a.runDrift(ctx, args[1:])
	case "plan":
		return a.runPlan(args[1:])
	case "bootstrap":
		return a.runExecution(ctx, PlanTargetBootstrap, args[1:])
	case "addons":
		return a.runExecution(ctx, PlanTargetAddons, args[1:])
	case "help", "-h", "--help":
		a.printUsage()
		return exitOK
	default:
		fmt.Fprintf(a.Err, "unknown command %q\n", args[0])
		a.printUsage()
		return exitUsage
	}
}

func (a *App) runDoctor(ctx context.Context, args []string) int {
	fs := flag.NewFlagSet("doctor", flag.ContinueOnError)
	fs.SetOutput(a.Err)
	rootFlag := fs.String("root", a.WorkingDir, "repository root or a directory below it")
	clusterFlag := fs.Bool("cluster", false, "run read-only kubectl checks")
	if err := fs.Parse(args); err != nil {
		return exitUsage
	}
	root, err := DiscoverRoot(*rootFlag)
	if err != nil {
		fmt.Fprintf(a.Err, "doctor: %v\n", err)
		return exitFailure
	}
	checks := LocalChecks(root, a.LookPath)
	if *clusterFlag {
		checks = append(checks, ClusterChecks(ctx, root, a.Runner)...)
	}
	if err := RenderChecks(a.Out, checks); err != nil {
		fmt.Fprintf(a.Err, "doctor: render checks: %v\n", err)
		return exitFailure
	}
	if HasRequiredFailures(checks) {
		return exitFailure
	}
	return exitOK
}

func (a *App) runDrift(ctx context.Context, args []string) int {
	fs := flag.NewFlagSet("drift", flag.ContinueOnError)
	fs.SetOutput(a.Err)
	rootFlag := fs.String("root", a.WorkingDir, "repository root or a directory below it")
	if err := fs.Parse(args); err != nil {
		return exitUsage
	}
	if fs.NArg() != 0 {
		fmt.Fprintln(a.Err, "drift: positional arguments are not supported")
		return exitUsage
	}
	root, err := DiscoverRoot(*rootFlag)
	if err != nil {
		fmt.Fprintf(a.Err, "drift: %v\n", err)
		return exitFailure
	}
	report := (DriftChecker{
		Root:   root,
		Runner: a.Runner,
	}).Check(ctx)
	if err := RenderDriftReport(a.Out, report); err != nil {
		fmt.Fprintf(a.Err, "drift: render report: %v\n", err)
		return exitFailure
	}
	if !report.Clean() {
		return exitFailure
	}
	return exitOK
}

func (a *App) runPlan(args []string) int {
	fs := flag.NewFlagSet("plan", flag.ContinueOnError)
	fs.SetOutput(a.Err)
	targetFlag := fs.String("target", string(PlanTargetAll), "plan target: bootstrap, addons, or all")
	if err := fs.Parse(args); err != nil {
		return exitUsage
	}
	if fs.NArg() != 0 {
		fmt.Fprintln(a.Err, "plan: positional arguments are not supported; use --target")
		return exitUsage
	}
	plan, err := NewPlan(PlanTarget(*targetFlag))
	if err != nil {
		fmt.Fprintf(a.Err, "plan: %v\n", err)
		return exitUsage
	}
	if err := plan.Render(a.Out); err != nil {
		fmt.Fprintf(a.Err, "plan: render plan: %v\n", err)
		return exitFailure
	}
	fmt.Fprintln(a.Out, "\nNo commands were executed. Review the plan before using an execute command.")
	return exitOK
}

func (a *App) runExecution(ctx context.Context, target PlanTarget, args []string) int {
	fs := flag.NewFlagSet(string(target), flag.ContinueOnError)
	fs.SetOutput(a.Err)
	rootFlag := fs.String("root", a.WorkingDir, "repository root or a directory below it")
	executeFlag := fs.Bool("execute", false, "allow mutating and read-only commands to run")
	yesFlag := fs.Bool("yes", false, "confirm the reviewed plan")
	if err := fs.Parse(args); err != nil {
		return exitUsage
	}
	if fs.NArg() != 0 {
		fmt.Fprintf(a.Err, "%s: positional arguments are not supported\n", target)
		return exitUsage
	}
	plan, err := NewPlan(target)
	if err != nil {
		fmt.Fprintf(a.Err, "%s: %v\n", target, err)
		return exitUsage
	}
	if !*executeFlag {
		_ = plan.Render(a.Out)
		fmt.Fprintf(a.Out, "\nDry run only. Re-run %s with --execute --yes after reviewing the plan.\n", target)
		return exitOK
	}
	if !*yesFlag {
		fmt.Fprintf(a.Err, "%s: --execute requires --yes after reviewing the plan\n", target)
		return exitUsage
	}
	root, err := DiscoverRoot(*rootFlag)
	if err != nil {
		fmt.Fprintf(a.Err, "%s: %v\n", target, err)
		return exitFailure
	}
	for index, step := range plan.Steps {
		fmt.Fprintf(a.Out, "\n[%d/%d] %s\n", index+1, len(plan.Steps), step.Name)
		if step.Note != "" {
			fmt.Fprintf(a.Out, "note: %s\n", step.Note)
		}
		fmt.Fprintf(a.Out, "$ %s\n", strings.Join(step.Command, " "))
		if err := a.Runner.Run(ctx, root, step.Command, a.Out, a.Err); err != nil {
			fmt.Fprintf(a.Err, "%s: step %q failed: %v\n", target, step.Name, err)
			return exitFailure
		}
	}
	return exitOK
}

func DiscoverRoot(start string) (string, error) {
	if start == "" {
		start = "."
	}
	current, err := filepath.Abs(start)
	if err != nil {
		return "", fmt.Errorf("resolve root: %w", err)
	}
	if info, statErr := os.Stat(current); statErr == nil && !info.IsDir() {
		current = filepath.Dir(current)
	}
	for {
		marker := filepath.Join(current, "cluster", "bootstrap", "k0s", "k0sctl.yml")
		if _, statErr := os.Stat(marker); statErr == nil {
			return current, nil
		}
		parent := filepath.Dir(current)
		if parent == current {
			break
		}
		current = parent
	}
	return "", errors.New("repository root not found; pass --root from inside k8s-cluster")
}

func (a *App) printUsage() {
	fmt.Fprintln(a.Out, "clusterctl - safe bootstrap helper for this k0s cluster")
	fmt.Fprintln(a.Out, "")
	fmt.Fprintln(a.Out, "Usage:")
	fmt.Fprintln(a.Out, "  clusterctl doctor [--cluster] [--root PATH]")
	fmt.Fprintln(a.Out, "  clusterctl drift [--root PATH]")
	fmt.Fprintln(a.Out, "  clusterctl plan [--target bootstrap|addons|all]")
	fmt.Fprintln(a.Out, "  clusterctl bootstrap [--execute --yes] [--root PATH]")
	fmt.Fprintln(a.Out, "  clusterctl addons [--execute --yes] [--root PATH]")
	fmt.Fprintln(a.Out, "")
	fmt.Fprintln(a.Out, "Commands are read-only unless --execute --yes is provided.")
}
