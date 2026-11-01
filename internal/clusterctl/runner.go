package clusterctl

import (
	"context"
	"io"
	"os/exec"
)

type CommandRunner interface {
	Run(ctx context.Context, dir string, command []string, stdout, stderr io.Writer) error
}

type ExecRunner struct{}

func (ExecRunner) Run(ctx context.Context, dir string, command []string, stdout, stderr io.Writer) error {
	if len(command) == 0 {
		return nil
	}
	cmd := exec.CommandContext(ctx, command[0], command[1:]...)
	cmd.Dir = dir
	cmd.Stdout = stdout
	cmd.Stderr = stderr
	return cmd.Run()
}
