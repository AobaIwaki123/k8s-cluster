package clusterctl

import (
	"context"
	"errors"
	"fmt"
	"io"
	"strings"
	"testing"
)

type driftScriptedRunner struct {
	missingApplication string
}

func (r driftScriptedRunner) Run(_ context.Context, _ string, command []string, stdout, _ io.Writer) error {
	if len(command) >= 4 && command[1] == "get" && command[2] == "application.argoproj.io" {
		if command[3] == r.missingApplication {
			return errors.New("not found")
		}
		_, _ = fmt.Fprint(stdout, "{\"status\":{\"sync\":{\"status\":\"Synced\"},\"health\":{\"status\":\"Healthy\"}}}")
		return nil
	}
	if len(command) >= 2 && command[1] == "diff" {
		return nil
	}
	return errors.New("unexpected command")
}

func TestDriftCheckerReportsMissingBaseApplication(t *testing.T) {
	report := (DriftChecker{
		Root:   "/repo",
		Runner: driftScriptedRunner{missingApplication: "tailscale-operator"},
	}).Check(context.Background())

	if report.Clean() {
		t.Fatal("Check() is clean, want drift")
	}
	found := false
	for _, result := range report.Results {
		if result.Name == "application/tailscale-operator" && result.Status == "drift" {
			found = true
		}
		if strings.Contains(result.Name, "llm-gpu-service") {
			t.Fatalf("application service entered drift scope: %s", result.Name)
		}
	}
	if !found {
		t.Fatal("missing Tailscale application was not reported")
	}
}

func TestDriftCheckerReportsHealthyBase(t *testing.T) {
	report := (DriftChecker{
		Root:   "/repo",
		Runner: driftScriptedRunner{},
	}).Check(context.Background())

	if !report.Clean() {
		t.Fatalf("Check() has findings: %+v", report.Results)
	}
	want := len(baseApplications) + len(baseManifestPaths)
	if len(report.Results) != want {
		t.Fatalf("result count = %d, want %d", len(report.Results), want)
	}
}
