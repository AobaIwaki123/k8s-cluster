package clusterctl

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLocalChecksAcceptExpectedRepositoryAndTools(t *testing.T) {
	root := t.TempDir()
	for _, relativePath := range requiredPaths {
		fullPath := filepath.Join(root, relativePath)
		if filepath.Ext(fullPath) == "" {
			if err := os.MkdirAll(fullPath, 0o755); err != nil {
				t.Fatalf("MkdirAll(%q): %v", fullPath, err)
			}
			continue
		}
		if err := os.MkdirAll(filepath.Dir(fullPath), 0o755); err != nil {
			t.Fatalf("MkdirAll(%q): %v", filepath.Dir(fullPath), err)
		}
		if err := os.WriteFile(fullPath, []byte("test"), 0o644); err != nil {
			t.Fatalf("WriteFile(%q): %v", fullPath, err)
		}
	}
	lookPath := func(command string) (string, error) {
		return "/usr/local/bin/" + command, nil
	}
	checks := LocalChecks(root, lookPath)
	if HasRequiredFailures(checks) {
		t.Fatalf("LocalChecks() has failures: %+v", checks)
	}
}

func TestDiscoverRootWalksUp(t *testing.T) {
	root := t.TempDir()
	marker := filepath.Join(root, "cluster", "bootstrap", "k0s", "k0sctl.yml")
	if err := os.MkdirAll(filepath.Dir(marker), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(marker, []byte("test"), 0o644); err != nil {
		t.Fatal(err)
	}
	nested := filepath.Join(root, "docs", "nested")
	if err := os.MkdirAll(nested, 0o755); err != nil {
		t.Fatal(err)
	}
	got, err := DiscoverRoot(nested)
	if err != nil {
		t.Fatalf("DiscoverRoot() error = %v", err)
	}
	if got != root {
		t.Fatalf("DiscoverRoot() = %q, want %q", got, root)
	}
}
