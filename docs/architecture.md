# アーキテクチャ

## 目的

Proxmox 上の k0s クラスターを、bootstrap 定義と Argo CD Application で再現・運用する。
このリポジトリはクラスター共通の基盤だけを管理し、アプリケーションサービスの正本にはしない。

## 構成

~~~text
Proxmox
└── k0s cluster
    ├── bootstrap
    │   ├── k0sctl
    │   └── Argo CD
    ├── addons
    │   ├── Cloudflare Tunnel Ingress Controller
    │   ├── Tailscale Operator
    │   ├── cert-manager + Let's Encrypt DNS challenge
    │   ├── Rook Ceph (external Ceph)
    │   └── Observability
    │       └── kube-prometheus-stack / Grafana
    └── workloads
        └── application services (このrepoでは管理しない)
~~~

## コンポーネントの正本

| 区分 | パス | 管理方法 | 判断 |
| --- | --- | --- | --- |
| クラスター | cluster/bootstrap/k0s/ | k0sctl | ノード構成と k0s の正本 |
| Argo CD | cluster/bootstrap/argocd/ | kubectl | 初期 ConfigMap と Ingress |
| 外部公開 | cluster/addons/networking/cloudflare-tunnel/ | Argo CD + Helm | Cloudflare Tunnel 経由 |
| 内部通信 | cluster/addons/networking/tailscale-operator/ | Argo CD + Helm | 既存 operator-oauth Secret を参照 |
| 証明書 | cluster/addons/security/cert-manager/ | Argo CD + Helm / ClusterIssuer | 現在利用中。削除禁止 |
| 現行ストレージ | cluster/addons/storage/rook-ceph/ | Argo CD + Helm | 外部 Ceph。現行構成として維持 |
| 将来ストレージ | docs/storage.md | 手順のみ | NFS 未導入。実リソースはまだ管理しない |
| 可観測性 | cluster/addons/observability/ | Argo CD + Helm / YAML | Prometheus と Grafana に限定 |

Harbor、Reflector、asdf、llm-gpu-service の IaC はこの基盤正本に含めない。
クラスタに残っているアプリケーションや履歴リソースの削除は、別の確認済み変更として扱う。

## Argo CD の扱い

Argo CD Application は各コンポーネントの argocd/ 配下に置く。
親 Application による自動発見を前提にせず、初回導入・パス変更・廃止時は Application 定義を明示的に確認する。

spec.source.path を変更する場合は、次の順序を守る。

1. 新パスのマニフェストを作る。
2. kubectl apply --dry-run=client または kubectl diff で確認する。
3. Application 定義を適用して Argo CD の参照先を更新する。
4. Application と対象 namespace の SYNC / HEALTH を確認する。
5. 旧パスを削除する。

## 将来のプライバシー配慮型ダッシュボード

外部へ見せる場合は、詳細なドキュメントサイトではなく、クラスターの状態を集約した単純なダッシュボードを想定する。

- 公開するのは稼働状態、概算のリソース状態、更新時刻など allowlist 済みの集計値だけ。
- ノード IP、内部 DNS、namespace 名、Pod 名、イメージ名、Ingress ホスト名、Secret、Argo CD URL は公開しない。
- Prometheus、Grafana、Argo CD をそのままインターネットへ公開しない。
- クラスター内でサニタイズしたスナップショットまたは専用 read-only API を生成し、公開側はそれだけを読む。
- 個別アプリの有無がプライバシー情報になる場合は、アプリ単位ではなく基盤全体の集計へ丸める。

ダッシュボード実装はこの再編と分離し、公開データ契約と脅威モデルを先に決めてから追加する。
