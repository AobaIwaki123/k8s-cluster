package main

import (
	"context"
	"os"

	"github.com/AobaIwaki123/k8s-cluster/internal/clusterctl"
)

func main() {
	app := clusterctl.NewApp(os.Stdout, os.Stderr)
	os.Exit(app.Run(context.Background(), os.Args[1:]))
}
