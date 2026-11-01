# AGENTS.md

このリポジトリは、Proxmox 上の k0s Kubernetes クラスターと、その上で動く基盤コンポーネントを宣言的に管理する。

## 変更時の前提

- 目的・現在のクラスタ状態・Argo CD の同期挙動を確認してから変更する。
- `kubectl get` で稼働中の `Application`、namespace、CRD、Ingress を確認する。Argo CD の `prune` が有効な Application の参照先を消すと、クラスタ上のリソースも削除され得る。
- Secret、API token、kubeconfig、生成された認証情報はコミットしない。
- Helm の外部チャートを使う定義は、チャート名・リポジトリ・バージョンをマニフェストに残す。
- 破壊的な削除は、リポジトリ内の参照だけでなく、稼働中の依存先と復旧手段を確認してから行う。

## ディレクトリの責務

```text
cluster/
├── bootstrap/                 # クラスターと Argo CD の初期構築
│   ├── k0s/
│   └── argocd/
├── addons/                    # クラスター共通の基盤サービス
│   ├── networking/cloudflare-tunnel/
│   ├── security/cert-manager/
│   ├── storage/rook-ceph/
│   ├── observability/
│   └── reflector/
└── workloads/                 # アプリケーション用の予約領域。基盤repoでは管理しない
```

- `docs/` は AI と運用者が読むための短い Markdown のみを置く。公開サイトの生成物は置かない。
- `README.md` は入口、`docs/architecture.md` は構成と判断、`docs/operations.md` は操作手順、`docs/security.md` は安全境界を扱う。
- Argo CD Application の `spec.source.path` は、リポジトリ上の実パスと一致させる。

## 現時点の判断

- GitHub Pages の管理は廃止し、HTML/CSS/JS のドキュメントサイトは維持しない。
- Harbor は現在のクラスタに確認できないため、構成とドキュメントから削除する。
- asdf は `.tool-versions` も実行時依存もなく、ツール管理の前提にしない。
- cert-manager はクラスタで稼働し、複数の Ingress が `letsencrypt-cloudflare` を参照しているため削除しない。
- `llm-gpu-service` などのアプリケーションサービスは基盤repoの管理対象外にする。ただし現在のクラスタリソースは別操作で扱う。

## 最低限の検証

```bash
git diff --check
kubectl get nodes
kubectl get applications.argoproj.io -A
kubectl get ingress -A
```

Kubernetes 定義を変更した場合は、可能なら `kubectl apply --dry-run=client` または `kubectl diff` で適用前の差分も確認する。
