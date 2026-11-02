# AGENTS.md

このリポジトリは、Proxmox 上の k0s Kubernetes クラスターと、その上で動く基盤コンポーネントを宣言的に管理する。

## 変更時の前提

- 目的・現在のクラスタ状態・Argo CD の同期挙動を確認してから変更する。
- kubectl get で稼働中の Application、namespace、CRD、Ingress を確認する。Argo CD の prune が有効な Application の参照先を消すと、クラスタ上のリソースも削除され得る。
- Secret、API token、kubeconfig、生成された認証情報はコミットしない。
- Helm の外部チャートを使う定義は、チャート名・リポジトリ・バージョンをマニフェストに残す。
- 破壊的な削除は、リポジトリ内の参照だけでなく、稼働中の依存先と復旧手段を確認してから行う。

## ディレクトリの責務

~~~text
cluster/
├── bootstrap/                 # クラスターと Argo CD の初期構築
│   ├── k0s/
│   └── argocd/
├── addons/                    # クラスター共通の基盤サービス
│   ├── networking/cloudflare-tunnel/
│   ├── networking/tailscale-operator/
│   ├── security/cert-manager/
│   ├── storage/rook-ceph/
│   └── observability/
└── workloads/                 # アプリケーション用の予約領域。基盤repoでは管理しない
~~~

- docs/ は AI と運用者が読むための短い Markdown のみを置く。公開サイトの生成物は置かない。
- README.md は入口、docs/architecture.md は構成と判断、docs/operations.md は操作手順、docs/security.md は安全境界を扱う。
- docs/storage.md は現行の Rook Ceph と、未導入の NFS を比較・導入するための手順を扱う。
- .agents/skills/cluster-bootstrap/SKILL.md と cmd/clusterctl/ は、クラスター構築を自動化するための入口。Secret の作成やアプリサービスの操作は扱わない。
- Argo CD Application の spec.source.path は、リポジトリ上の実パスと一致させる。

## 現時点の判断

- GitHub Pages の管理は廃止し、HTML/CSS/JS のドキュメントサイトは維持しない。
- Harbor は現在のクラスタに確認できないため、構成とドキュメントから削除する。
- asdf は .tool-versions も実行時依存もなく、ツール管理の前提にしない。
- cert-manager はクラスタで稼働し、複数の Ingress が letsencrypt-cloudflare を参照しているため削除しない。
- Tailscale Operator はクラスタで稼働しているが、現在は手動導入のため、既存の operator-oauth Secret を前提に宣言化する。
- 現在の可観測性の正本は kube-prometheus-stack と Grafana。Loki、Tempo、Promtail、OpenTelemetry、Beyla の IaC は現行状態と一致しないため持たない。
- Reflector は稼働リソースを確認できず、基盤の正本から削除する。既存クラスタの後片付けは別変更にする。
- Rook Ceph は現行ストレージとして残す。NFS はまだ存在しないため IaC を追加せず、導入時の判断と手順だけ docs/storage.md に記録する。
- llm-gpu-service などのアプリケーションサービスは基盤repoの管理対象外にする。ただし現在のクラスタリソースは別操作で扱う。
- **クラウドネイティブ標準と Argo CD エコシステムの優先**:
  - デプロイ戦略、イメージ更新、トラフィック切り替えにおいて、独自のスクリプト（CI での `sed` によるタグ置換と Git への自動コミット `[skip ci]`）など手前味噌な自前実装を行わず、Argo CD エコシステム標準機能（Argo Rollouts による Blue/Green、Argo CD Image Updater による自動イメージ追跡）を活用する。
  - CI はコンテナイメージのビルドとレジストリプッシュに専念させ、Git への自動デプロイコミット乱発（Git Churn）を防止する。

## 最低限の検証

~~~bash
git diff --check
go test ./...
go vet ./...
kubectl get nodes
kubectl get applications.argoproj.io -A
kubectl get ingress -A
~~~

Kubernetes 定義を変更した場合は、可能なら kubectl apply --dry-run=client または kubectl diff で適用前の差分も確認する。
