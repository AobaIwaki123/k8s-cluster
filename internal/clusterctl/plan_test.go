package clusterctl

import (
	"strings"
	"testing"
)

func TestNewPlanAllPreservesBootstrapBeforeAddons(t *testing.T) {
	plan, err := NewPlan(PlanTargetAll)
	if err != nil {
		t.Fatalf("NewPlan() error = %v", err)
	}
	if len(plan.Steps) == 0 {
		t.Fatal("NewPlan() returned no steps")
	}
	if plan.Steps[0].Command[0] != "k0sctl" {
		t.Fatalf("first command = %q, want k0sctl", plan.Steps[0].Command[0])
	}
	if plan.Steps[len(plan.Steps)-1].Name != "Verify Argo CD Applications" {
		t.Fatalf("last step = %q, want Argo CD verification", plan.Steps[len(plan.Steps)-1].Name)
	}
}

func TestAddonsPlanDoesNotContainSecretValues(t *testing.T) {
	plan := NewAddonsPlan()
	for _, step := range plan.Steps {
		command := strings.Join(step.Command, " ")
		if strings.Contains(command, "client_secret") || strings.Contains(command, "clientSecret") {
			t.Fatalf("step %q appears to access a secret value: %s", step.Name, command)
		}
	}
}

func TestNewPlanRejectsUnknownTarget(t *testing.T) {
	if _, err := NewPlan(PlanTarget("unknown")); err == nil {
		t.Fatal("NewPlan() error = nil, want error")
	}
}
