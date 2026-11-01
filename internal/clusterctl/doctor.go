package clusterctl

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

type Check struct {
	Name     string
	Detail   string
	Passed   bool
	Required bool
}

type LookPathFunc func(file string) (string, error)

var requiredCommands = []string{"kubectl", "k0sctl", "helm"}
var recommendedCommands = []string{"argocd"}

var requiredPaths = []string{
	"AGENTS.md",
	"README.md",
	"cluster/bootstrap/k0s/k0sctl.yml",
	"cluster/bootstrap/argocd",
	"cluster/addons/networking/cloudflare-tunnel/argocd",
	"cluster/addons/networking/tailscale-operator/argocd",
	"cluster/addons/security/cert-manager/argocd",
	"cluster/addons/storage/rook-ceph/argocd",
	"cluster/addons/observability/prometheus-stack",
	"docs/operations.md",
	"docs/storage.md",
}

func LocalChecks(root string, lookPath LookPathFunc) []Check {
	checks := make([]Check, 0, len(requiredPaths)+len(requiredCommands)+len(recommendedCommands))
	for _, relativePath := range requiredPaths {
		fullPath := filepath.Join(root, relativePath)
		_, err := os.Stat(fullPath)
		checks = append(checks, Check{
			Name:     "path " + relativePath,
			Detail:   relativePath,
			Passed:   err == nil,
			Required: true,
		})
	}
	for _, command := range requiredCommands {
		path, err := lookPath(command)
		checks = append(checks, Check{
			Name:     "command " + command,
			Detail:   path,
			Passed:   err == nil,
			Required: true,
		})
	}
	for _, command := range recommendedCommands {
		path, err := lookPath(command)
		checks = append(checks, Check{
			Name:     "recommended command " + command,
			Detail:   path,
			Passed:   err == nil,
			Required: false,
		})
	}
	return checks
}

func ClusterChecks(ctx context.Context, root string, runner CommandRunner) []Check {
	commands := []struct {
		name string
		args []string
	}{
		{
			name: "cluster API",
			args: []string{"kubectl", "get", "nodes", "--no-headers"},
		},
		{
			name: "Argo CD namespace",
			args: []string{"kubectl", "get", "namespace", "argocd", "-o", "name"},
		},
		{
			name: "Cloudflare Secret metadata",
			args: []string{"kubectl", "get", "secret", "cloudflare-api", "-n", "cloudflare-tunnel-ingress-controller", "-o", "name"},
		},
		{
			name: "Tailscale OAuth Secret metadata",
			args: []string{"kubectl", "get", "secret", "operator-oauth", "-n", "tailscale", "-o", "name"},
		},
	}
	checks := make([]Check, 0, len(commands))
	for _, item := range commands {
		err := runner.Run(ctx, root, item.args, io.Discard, io.Discard)
		checks = append(checks, Check{
			Name:     item.name,
			Detail:   "read-only kubectl check",
			Passed:   err == nil,
			Required: true,
		})
	}
	return checks
}

func HasRequiredFailures(checks []Check) bool {
	for _, check := range checks {
		if check.Required && !check.Passed {
			return true
		}
	}
	return false
}

func RenderChecks(w io.Writer, checks []Check) error {
	for _, check := range checks {
		status := "ok"
		if !check.Passed {
			if check.Required {
				status = "fail"
			} else {
				status = "warn"
			}
		}
		detail := check.Detail
		if detail == "" {
			detail = "no detail"
		}
		if _, err := fmt.Fprintf(w, "[%s] %s (%s)\n", status, check.Name, detail); err != nil {
			return err
		}
	}
	return nil
}
