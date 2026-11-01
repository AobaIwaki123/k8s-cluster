# アーキテクチャ

## 目的

Proxmox 上の複数ノードで動く k0s クラスターを、Argo CD と Helm の宣言的な定義で再現・運用する。リポジトリの主目的は、クラスターの bootstrap と共通基盤の復旧元を明確にすることです。

## 構成

```text
Proxmox
└── k0s cluster
    ├── bootstrap
    │   ├── k0sctl
    │   └── Argo CD
    ├── addons
    │   ├── Cloudflare Tunnel Ingress Controller
    │   ├── cert-manager + Let's Encrypt DNS challenge
    │   ├── Rook Ceph (external Ceph)
    │   ├── Reflector
    │   └── Observability
    │       ├── kube-prometheus-stack / Grafana
    │       ├── Loki / Promtail
    │       ├── Tempo
    │       └── OpenTelemetry / Beyla
    └── workloads
        └── application services (このrepoでは管理しない)
```

## コンポーネントの正本

| 区分 | パス | 管理方法 | 判断 |
| --- | --- | --- | --- |
| クラスター | `cluster/bootstrap/k0s/` | k0sctl | ノード構成と k0s の正本 |
| Argo CD | `cluster/bootstrap/argocd/` | kubectl | 初期 ConfigMap と Ingress |
| 外部公開 | `cluster/addons/networking/cloudflare-tunnel/` | Argo CD + Helm | Cloudflare Tunnel 経由 |
| 証明書 | `cluster/addons/security/cert-manager/` | Argo CD + Helm / ClusterIssuer | 現在利用中。削除禁止 |
| ストレージ | `cluster/addons/storage/rook-ceph/` | Argo CD + Helm | Proxmox 外部 Ceph |
| 可観測性 | `cluster/addons/observability/` | Argo CD + Helm / YAML | Grafana を中心に統合 |
| Secret 複製 | `cluster/addons/reflector/` | Argo CD + Helm | Secret の内容は別管理 |

Harbor は現行構成に含めない。asdf もリポジトリの前提にしない。CLI は利用者の環境で直接管理し、必要なバージョンは各マニフェストや k0sctl 設定で確認する。

アプリケーションサービス（例: `llm-gpu-service`）はこの基盤repoの正本にしない。クラスタに残っていても、基盤repoとの不一致は許容する。

## Argo CD の扱い

Argo CD Application は各コンポーネントの `argocd/` 配下に置く。Application 自体を親 Application から自動発見する構成ではないため、初回導入・パス変更・廃止時は Application 定義を明示的に適用する。

`spec.source.path` を変更する場合は、次の順序を守る。

1. 新パスのマニフェストを作る。
2. `kubectl apply --dry-run=client` または `kubectl diff` で確認する。
3. Application 定義を適用して Argo CD の参照先を更新する。
4. `kubectl get application -n argocd` と対象 namespace を確認する。
5. 旧パスを削除する。

## 将来のプライバシー配慮型ダッシュボード

公開用の見せ方は、詳細なドキュメントサイトではなく、クラスターの状態を集約した単純なダッシュボードを想定する。ダッシュボードは次の境界を必須とする。

- 公開するのは、稼働状態、概算のリソース状態、更新時刻などの allowlist 済み集計値だけ。
- ノード IP、内部 DNS、namespace 名、Pod 名、イメージ名、ログ、Ingress ホスト名、Secret、Argo CD URL は公開しない。
- Prometheus、Grafana、Argo CD をそのままインターネットへ公開しない。
- クラスター内でサニタイズしたスナップショットまたは専用 read-only API を生成し、公開側はそれだけを読む。
- 個別アプリの有無がプライバシー情報になる場合は、アプリ単位ではなく基盤全体の集計へ丸める。

ダッシュボード実装はこのリポジトリ再編とは分離し、公開データ契約と脅威モデルを先に決めてから追加する。
