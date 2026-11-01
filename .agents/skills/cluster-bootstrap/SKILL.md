---
name: cluster-bootstrap
description: Safely inspect, validate, and bootstrap this repository's k0s cluster and shared infrastructure add-ons. Use for cluster construction, recovery, or base-state reconciliation; do not use for application service deployment.
---

# Cluster bootstrap

Use this skill from the k8s-cluster repository. Read AGENTS.md, docs/architecture.md,
docs/operations.md, docs/security.md, and docs/storage.md before changing the cluster.

## Scope

- Manage k0s bootstrap, Argo CD bootstrap, and shared add-ons only.
- Keep application services, their namespaces, and their PVC migration outside this workflow.
- Never create, print, decode, or commit Secret values. Check only Secret metadata and required key names.
- Do not reset or delete a cluster from this skill. Treat reset, prune, and resource removal as separately reviewed operations.
- NFS is not installed yet. Follow docs/storage.md, but do not create NFS resources until an external NFS server and recovery plan exist.

## Default workflow

1. Run the read-only local check.

~~~bash
go run ./cmd/clusterctl doctor
~~~

2. When kubeconfig is available, run the read-only cluster check. It checks nodes,
Argo CD, and the existence of Cloudflare and Tailscale Secret metadata without reading values.

~~~bash
go run ./cmd/clusterctl doctor --cluster
~~~

3. Review the deterministic plan before execution.

~~~bash
go run ./cmd/clusterctl plan --target all
~~~

4. Run the base-only drift check before and after reconciliation.

~~~bash
go run ./cmd/clusterctl drift
~~~

The drift command checks only the infrastructure Applications and manifests listed
by the CLI. Application services such as llm-gpu-service are intentionally excluded.
It never reads Secret values and returns a non-zero status when a base resource is
missing, unhealthy, out of sync, or different from the repository manifest.

5. For a new or recovered cluster, inspect k0sctl inventory and kubeconfig setup,
then execute only the reviewed phase.

~~~bash
go run ./cmd/clusterctl bootstrap --execute --yes
go run ./cmd/clusterctl addons --execute --yes
~~~

The execute flag and confirmation flag are both required. Without them the command
prints a dry-run plan. The CLI applies infrastructure Applications in dependency order,
waits for cert-manager before applying its ClusterIssuer, and applies the sanitized
Grafana base dashboard. It does not create Secrets or auto-merge a PR.

## Change discipline

Changes to manifests, documentation, or this skill are submitted through a PR.
After each coherent phase, push the branch and update the PR with the verification
result and any remaining uncertainty. Do not claim that a repository change has
changed the live cluster until Argo CD sync and the relevant namespace have been checked.
