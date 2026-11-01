package clusterctl

import (
	"bytes"
	"context"
	"io"
	"os"
	"path/filepath"
	"testing"
)

type fakeRunner struct {
	calls [][]string
}

func (f *fakeRunner) Run(_ context.Context, _ string, command []string, _, _ io.Writer) error {
	f.calls = append(f.calls, append([]string(nil), command...))
	return nil
}

func testRoot(t *testing.T) string {
	t.Helper()
	root := t.TempDir()
	marker := filepath.Join(root, "cluster", "bootstrap", "k0s", "k0sctl.yml")
	if err := os.MkdirAll(filepath.Dir(marker), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(marker, []byte("test"), 0o644); err != nil {
		t.Fatal(err)
	}
	return root
}

func TestRunBootstrapDefaultsToDryRun(t *testing.T) {
	root := testRoot(t)
	runner := &fakeRunner{}
	var out, errOut bytes.Buffer
	app := &App{
		Out:        &out,
		Err:        &errOut,
		Runner:     runner,
		LookPath:   func(string) (string, error) { return "", nil },
		WorkingDir: root,
	}
	if got := app.Run(context.Background(), []string{"bootstrap"}); got != exitOK {
		t.Fatalf("Run() = %d, want %d; stderr=%s", got, exitOK, errOut.String())
	}
	if len(runner.calls) != 0 {
		t.Fatalf("dry run executed %d commands", len(runner.calls))
	}
}

func TestRunBootstrapRequiresConfirmation(t *testing.T) {
	root := testRoot(t)
	runner := &fakeRunner{}
	var out, errOut bytes.Buffer
	app := &App{
		Out:        &out,
		Err:        &errOut,
		Runner:     runner,
		LookPath:   func(string) (string, error) { return "", nil },
		WorkingDir: root,
	}
	if got := app.Run(context.Background(), []string{"bootstrap", "--execute"}); got != exitUsage {
		t.Fatalf("Run() = %d, want %d", got, exitUsage)
	}
	if len(runner.calls) != 0 {
		t.Fatalf("unconfirmed execution ran %d commands", len(runner.calls))
	}
}

func TestRunBootstrapExecutesAfterConfirmation(t *testing.T) {
	root := testRoot(t)
	runner := &fakeRunner{}
	var out, errOut bytes.Buffer
	app := &App{
		Out:        &out,
		Err:        &errOut,
		Runner:     runner,
		LookPath:   func(string) (string, error) { return "", nil },
		WorkingDir: root,
	}
	if got := app.Run(context.Background(), []string{"bootstrap", "--execute", "--yes"}); got != exitOK {
		t.Fatalf("Run() = %d, want %d; stderr=%s", got, exitOK, errOut.String())
	}
	if len(runner.calls) != len(NewBootstrapPlan().Steps) {
		t.Fatalf("executed %d commands, want %d", len(runner.calls), len(NewBootstrapPlan().Steps))
	}
}
