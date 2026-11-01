package clusterctl

import (
	"fmt"
	"io"
	"strings"
)

type PlanTarget string

const (
	PlanTargetBootstrap PlanTarget = "bootstrap"
	PlanTargetAddons    PlanTarget = "addons"
	PlanTargetAll       PlanTarget = "all"
)

type Step struct {
	Name    string
	Command []string
	Note    string
}

type Plan struct {
	Name  string
	Steps []Step
}

func NewBootstrapPlan() Plan {
	return Plan{
		Name: "cluster bootstrap",
		Steps: []Step{
			{
				Name:    "Provision or reconcile k0s",
				Command: []string{"k0sctl", "apply", "--config", "cluster/bootstrap/k0s/k0sctl.yml"},
				Note:    "This changes the cluster. Review the k0sctl inventory before execution.",
			},
			{
				Name:    "Apply Argo CD bootstrap manifests",
				Command: []string{"kubectl", "apply", "-f", "cluster/bootstrap/argocd/"},
				Note:    "A working kubeconfig is required after k0sctl completes.",
			},
			{
				Name:    "Verify nodes",
				Command: []string{"kubectl", "get", "nodes"},
			},
		},
	}
}

func NewAddonsPlan() Plan {
	return Plan{
		Name: "cluster base add-ons",
		Steps: []Step{
			{
				Name:    "Verify Cloudflare Secret exists",
				Command: []string{"kubectl", "get", "secret", "cloudflare-api", "-n", "cloudflare-tunnel-ingress-controller", "-o", "name"},
				Note:    "Only Secret metadata is queried. Secret values are never read.",
			},
			{
				Name:    "Verify Tailscale OAuth Secret exists",
				Command: []string{"kubectl", "get", "secret", "operator-oauth", "-n", "tailscale", "-o", "name"},
				Note:    "Only Secret metadata is queried. Secret values are never read.",
			},
			{
				Name:    "Apply Cloudflare Tunnel Application",
				Command: []string{"kubectl", "apply", "-f", "cluster/addons/networking/cloudflare-tunnel/argocd/"},
			},
			{
				Name:    "Apply Tailscale Operator Application",
				Command: []string{"kubectl", "apply", "-f", "cluster/addons/networking/tailscale-operator/argocd/"},
			},
			{
				Name:    "Apply cert-manager Application",
				Command: []string{"kubectl", "apply", "-f", "cluster/addons/security/cert-manager/argocd/"},
			},
			{
				Name:    "Wait for cert-manager",
				Command: []string{"kubectl", "wait", "--for=condition=Available", "deployment/cert-manager", "-n", "cert-manager", "--timeout=10m"},
			},
			{
				Name:    "Apply the cert-manager ClusterIssuer",
				Command: []string{"kubectl", "apply", "-f", "cluster/addons/security/cert-manager/manifests/clusterissuer-letsencrypt.yaml"},
				Note:    "The Cloudflare credential Secret is managed outside this repository.",
			},
			{
				Name:    "Apply Rook Ceph Applications",
				Command: []string{"kubectl", "apply", "-f", "cluster/addons/storage/rook-ceph/argocd/"},
			},
			{
				Name:    "Apply kube-prometheus-stack Application",
				Command: []string{"kubectl", "apply", "-f", "cluster/addons/observability/prometheus-stack/"},
			},
			{
				Name:    "Apply the Grafana cluster dashboard",
				Command: []string{"kubectl", "apply", "-f", "cluster/addons/observability/grafana/dashboard-configmap.yaml"},
			},
			{
				Name:    "Verify Argo CD Applications",
				Command: []string{"kubectl", "get", "applications.argoproj.io", "-n", "argocd"},
			},
		},
	}
}

func NewPlan(target PlanTarget) (Plan, error) {
	switch target {
	case PlanTargetBootstrap:
		return NewBootstrapPlan(), nil
	case PlanTargetAddons:
		return NewAddonsPlan(), nil
	case PlanTargetAll:
		bootstrap := NewBootstrapPlan()
		addons := NewAddonsPlan()
		return Plan{
			Name:  "cluster bootstrap and base add-ons",
			Steps: append(bootstrap.Steps, addons.Steps...),
		}, nil
	default:
		return Plan{}, fmt.Errorf("unknown plan target %q: use bootstrap, addons, or all", target)
	}
}

func (p Plan) Render(w io.Writer) error {
	if _, err := fmt.Fprintf(w, "Plan: %s\n", p.Name); err != nil {
		return err
	}
	for i, step := range p.Steps {
		if _, err := fmt.Fprintf(w, "\n%d. %s\n", i+1, step.Name); err != nil {
			return err
		}
		if step.Note != "" {
			if _, err := fmt.Fprintf(w, "   note: %s\n", step.Note); err != nil {
				return err
			}
		}
		if len(step.Command) > 0 {
			if _, err := fmt.Fprintf(w, "   $ %s\n", strings.Join(step.Command, " ")); err != nil {
				return err
			}
		}
	}
	return nil
}
