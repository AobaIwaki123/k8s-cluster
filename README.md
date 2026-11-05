# k8s-cluster

Proxmox 上の k0s Kubernetes クラスターと、Argo CD で管理する共通基盤の正本です。
自宅環境を再現・運用するための Kubernetes 定義を置き、公開用のドキュメントサイトは管理しません。

## まず読む

- [AGENTS.md](AGENTS.md) — AI が変更するときの前提と安全境界
- [docs/architecture.md](docs/architecture.md) — 現在の構成とディレクトリの責務
- [docs/operations.md](docs/operations.md) — bootstrap、Argo CD、確認手順
- [docs/security.md](docs/security.md) — Secret と公開境界の基準
- [docs/storage.md](docs/storage.md) — Rook Ceph と将来の NFS の判断

## 現行コンポーネント

| 区分 | パス | 状態 |
| --- | --- | --- |
| k0s クラスター | [cluster/bootstrap/k0s/](cluster/bootstrap/k0s/) | 現行構成 |
| Argo CD | [cluster/bootstrap/argocd/](cluster/bootstrap/argocd/) | 現行構成 |
| Cloudflare Tunnel | [cluster/addons/networking/cloudflare-tunnel/](cluster/addons/networking/cloudflare-tunnel/) | 現行構成 |
| Tailscale Operator | [cluster/addons/networking/tailscale-operator/](cluster/addons/networking/tailscale-operator/) | 現行構成。既存 Secret を参照 |
| cert-manager | [cluster/addons/security/cert-manager/](cluster/addons/security/cert-manager/) | 稼働中。削除しない |
| Rook Ceph | [cluster/addons/storage/rook-ceph/](cluster/addons/storage/rook-ceph/) | 現行構成 |
| Observability | [cluster/addons/observability/](cluster/addons/observability/) | Prometheus / Grafana |

Harbor、Reflector、asdf は現行の基盤正本に含めません。NFS はまだ導入していないため、
Rook Ceph の代替候補としての手順だけを記録します。アプリケーションサービスは基盤repoの正本に含めません。

## 最短手順

~~~bash
# read-only checks and deterministic plan
go run ./cmd/clusterctl doctor
go run ./cmd/clusterctl drift
go run ./cmd/clusterctl plan --target all

# review the plan, prerequisites, and current kubeconfig before execution
go run ./cmd/clusterctl bootstrap --execute --yes
go run ./cmd/clusterctl addons --execute --yes
~~~

詳細な適用順序と注意点は [docs/operations.md](docs/operations.md) を参照してください。
クラスター全体へ影響する apply / reset、および Argo CD の prune を伴う変更は、
対象と復旧手段を確認してから実行します。

## 将来の表示

外部へ見せる場合は、内部情報を隠した単純な状態ダッシュボードを別途設計します。
Prometheus や Grafana の画面をそのまま公開せず、allowlist 済みの集計値だけを出す方針です。
境界は [docs/architecture.md](docs/architecture.md) に記載しています。
