package clusterctl

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os/exec"
	"strings"
)

type ManagedApplication struct {
	Name      string
	Namespace string
}

var baseApplications = []ManagedApplication{
	{Name: "cloudflare-tunnel-ingress-controller", Namespace: "argocd"},
	{Name: "tailscale-operator", Namespace: "argocd"},
	{Name: "cert-manager", Namespace: "argocd"},
	{Name: "rook-ceph", Namespace: "argocd"},
	{Name: "rook-ceph-external-cluster", Namespace: "argocd"},
	{Name: "kube-prometheus-stack", Namespace: "argocd"},
}

var baseManifestPaths = []string{
	"cluster/bootstrap/argocd/manifests",
	"cluster/addons/networking/cloudflare-tunnel/argocd",
	"cluster/addons/networking/tailscale-operator/argocd",
	"cluster/addons/security/cert-manager/argocd",
	"cluster/addons/security/cert-manager/manifests",
	"cluster/addons/storage/rook-ceph/argocd",
	"cluster/addons/observability/namespace.yaml",
	"cluster/addons/observability/prometheus-stack",
	"cluster/addons/observability/grafana/dashboard-configmap.yaml",
}

type DriftResult struct {
	Name   string
	Status string
	Detail string
}

type DriftReport struct {
	Results []DriftResult
}

func (r DriftReport) Clean() bool {
	for _, result := range r.Results {
		if result.Status != "ok" {
			return false
		}
	}
	return true
}

func (r DriftReport) DriftCount() int {
	count := 0
	for _, result := range r.Results {
		if result.Status == "drift" {
			count++
		}
	}
	return count
}

func (r DriftReport) ErrorCount() int {
	count := 0
	for _, result := range r.Results {
		if result.Status == "error" {
			count++
		}
	}
	return count
}

type DriftChecker struct {
	Root   string
	Runner CommandRunner
}

func (c DriftChecker) Check(ctx context.Context) DriftReport {
	report := DriftReport{}
	for _, application := range baseApplications {
		report.Results = append(report.Results, c.checkApplication(ctx, application))
	}
	for _, manifestPath := range baseManifestPaths {
		report.Results = append(report.Results, c.checkManifest(ctx, manifestPath))
	}
	return report
}

func (c DriftChecker) checkApplication(ctx context.Context, expected ManagedApplication) DriftResult {
	name := "application/" + expected.Name
	command := []string{
		"kubectl",
		"get",
		"application.argoproj.io",
		expected.Name,
		"-n",
		expected.Namespace,
		"-o",
		"json",
	}
	output, err := captureCommand(ctx, c.Root, c.Runner, command)
	if err != nil {
		return DriftResult{
			Name:   name,
			Status: "drift",
			Detail: "Application is missing or cannot be read",
		}
	}
	var live struct {
		Status struct {
			Sync struct {
				Status string
			}
			Health struct {
				Status string
			}
		}
	}
	if err := json.Unmarshal([]byte(output), &live); err != nil {
		return DriftResult{
			Name:   name,
			Status: "error",
			Detail: "kubectl returned invalid Application JSON",
		}
	}
	syncStatus := live.Status.Sync.Status
	healthStatus := live.Status.Health.Status
	if syncStatus != "Synced" || healthStatus != "Healthy" {
		return DriftResult{
			Name:   name,
			Status: "drift",
			Detail: fmt.Sprintf("SYNC=%s HEALTH=%s", emptyAsUnknown(syncStatus), emptyAsUnknown(healthStatus)),
		}
	}
	return DriftResult{
		Name:   name,
		Status: "ok",
		Detail: "SYNC=Synced HEALTH=Healthy",
	}
}

func (c DriftChecker) checkManifest(ctx context.Context, manifestPath string) DriftResult {
	command := []string{"kubectl", "diff", "-f", manifestPath}
	_, err := captureCommand(ctx, c.Root, c.Runner, command)
	if err == nil {
		return DriftResult{
			Name:   "manifest/" + manifestPath,
			Status: "ok",
			Detail: "no live diff",
		}
	}
	if exitCode := commandExitCode(err); exitCode == 1 {
		return DriftResult{
			Name:   "manifest/" + manifestPath,
			Status: "drift",
			Detail: "live object differs from repository manifest",
		}
	}
	return DriftResult{
		Name:   "manifest/" + manifestPath,
		Status: "error",
		Detail: "kubectl diff could not complete",
	}
}

func captureCommand(ctx context.Context, root string, runner CommandRunner, command []string) (string, error) {
	var stdout bytes.Buffer
	var stderr bytes.Buffer
	err := runner.Run(ctx, root, command, &stdout, &stderr)
	if err != nil {
		return stdout.String() + stderr.String(), err
	}
	return stdout.String(), nil
}

func commandExitCode(err error) int {
	var exitErr *exec.ExitError
	if errors.As(err, &exitErr) {
		return exitErr.ExitCode()
	}
	return -1
}

func emptyAsUnknown(value string) string {
	if strings.TrimSpace(value) == "" {
		return "Unknown"
	}
	return value
}

func RenderDriftReport(w io.Writer, report DriftReport) error {
	if _, err := fmt.Fprintln(w, "Drift check scope: base infrastructure only"); err != nil {
		return err
	}
	if _, err := fmt.Fprintln(w, "Application services are intentionally excluded."); err != nil {
		return err
	}
	for _, result := range report.Results {
		if _, err := fmt.Fprintf(w, "[%s] %s (%s)\n", result.Status, result.Name, result.Detail); err != nil {
			return err
		}
	}
	_, err := fmt.Fprintf(
		w,
		"Summary: checks=%d drift=%d errors=%d\n",
		len(report.Results),
		report.DriftCount(),
		report.ErrorCount(),
	)
	return err
}
