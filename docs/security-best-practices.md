# Kubernetes セキュリティベストプラクティス

NSA Hardening Framework (kubescape) に基づく個人クラスター向けセキュリティガイド。

---

## C-0055: Linux Hardening (seccomp)

### 対応方法

全Podの `securityContext` に以下を追加する。

```yaml
spec:
  template:
    spec:
      securityContext:
        seccompProfile:
          type: RuntimeDefault
```

### 意味と影響度

**影響度: 高 / 対処コスト: 低**

コンテナが呼び出せるLinuxシステムコール（syscall）をカーネルレベルで制限する。`ptrace`, `mount`, `reboot` など攻撃に利用されやすい危険なsyscallをブロックする。

C-0013/C-0016（プロセス層）、C-0017（ファイル層）をすり抜けた攻撃を**カーネルレベルで止める最後の砦**。

### 備考

- Kubernetes 1.27以降はノードレベルでデフォルト有効になっているが、Pod側に明示しないとkubescapeなどのスキャンツールに検出される
- 明示することでクラスター移行時もノード設定に依存せず保証される
- 独自プロファイルは不要、`RuntimeDefault` で十分
- AppArmor は Kubernetes 1.30以降で正式サポート。併用する場合は `appArmorProfile.type: RuntimeDefault` を追加

---

## C-0016: Allow Privilege Escalation（権限昇格の禁止）

### 対応方法

全コンテナの `securityContext` に以下を追加する。

```yaml
spec:
  template:
    spec:
      containers:
        - name: app
          securityContext:
            allowPrivilegeEscalation: false
```

### 意味と影響度

**影響度: 高 / 対処コスト: 低**

コンテナ内のプロセスが `setuid` などのLinuxの仕組みを使って**実行中にroot権限へ昇格することを禁止**する。

コンテナに侵入した攻撃者がSUIDバイナリや脆弱な実行ファイルを悪用してroot権限を取得し、コンテナエスケープの足がかりにするシナリオを防ぐ。

### 備考

- C-0013（Non-root）と混同しやすいが別の設定。C-0013は「起動時からnon-rootで動く」、C-0016は「実行中のroot昇格を禁止」。両方セットで意味がある
- **自前アプリ・Grafana等のアプリ系**: 動作への影響なし。全て `false` に設定してよい
- **インフラ系 (rook-ceph, beyla, kube-router等)**: カーネル・システム操作が必要なため許容する
- **公式Helmチャート**: rootが必要な理由を確認した上で可能であれば `false` に設定する
- rootが必要に見えるケースでも回避できる場合がある（下記参照）

#### rootが必要に見えるケースと回避方法

| ケース | 回避方法 |
|---|---|
| ポート 80/443 をバインドしたい | `NET_BIND_SERVICE` capabilityを付与、または1024以上のポートを使う |
| initContainerでchmod/chownを実行している | `securityContext.fsGroup` でグループを指定する |
| PVCマウント時にパーミッションエラーが出る | `securityContext.fsGroup` でGIDを指定する |
| 起動時にaptでパッケージインストールしている | Dockerfileでビルド時に済ませる（アンチパターンの解消） |

```yaml
# fsGroupでの回避例
spec:
  template:
    spec:
      securityContext:
        fsGroup: 1000
```

---

## C-0013: Non-root Containers（non-rootユーザーでの実行）

### 対応方法

全コンテナの `securityContext` に以下を追加する。

```yaml
spec:
  template:
    spec:
      containers:
        - name: app
          securityContext:
            runAsNonRoot: true
            runAsUser: 1000   # コンテナイメージに合わせて調整
```

### 意味と影響度

**影響度: 高 / 対処コスト: 低〜中**

コンテナを**起動時からnon-rootユーザーで実行する**。コンテナがrootで動いている場合、侵入された際のコンテナ内での影響範囲が広くなる。

### 備考

- C-0016（権限昇格禁止）とセットで設定するのが基本
- **自前アプリ**: 基本的に設定可能。イメージのデフォルトユーザーを確認して `runAsUser` を指定する
- **インフラ系 (rook-ceph, beyla等)**: システム操作が必要なため許容する
- 公式Helmチャートは `values.yaml` で `securityContext` を上書きできるものもある
- `runAsNonRoot: true` のみ指定した場合、イメージがroot(UID=0)で動こうとするとKubernetesが起動を拒否するため、必ず `runAsUser` も合わせて確認する

---

## C-0017: Immutable Container Filesystem（イミュータブルなファイルシステム）

### 対応方法

コンテナの `securityContext` に以下を追加し、書き込みが必要なパスには `emptyDir` をマウントする。

```yaml
spec:
  template:
    spec:
      containers:
        - name: app
          securityContext:
            readOnlyRootFilesystem: true
          volumeMounts:
            - name: tmp
              mountPath: /tmp
            - name: var-run
              mountPath: /var/run
      volumes:
        - name: tmp
          emptyDir: {}
        - name: var-run
          emptyDir: {}
```

### 意味と影響度

**影響度: 中 / 対処コスト: 高**

コンテナのルートファイルシステムを読み取り専用にし、侵入後にマルウェアやバックドアをファイルシステムに書き込むことを防ぐ。

### 備考

- **個人運用では「できればやる」程度の優先度**。エンタープライズ運用では必須に近い
- C-0016/C-0013を先に対処してから取り組むのが現実的
- 単純に `true` にするとアプリがクラッシュすることが多い。起動ログを確認しながら必要なパスに `emptyDir` を足していく作業が必要
- ログはファイルに書き込まず **stdout に出力する設計**にするとマウント数を減らせる

#### よく書き込みが発生するパスと対処

| パス | 用途 | 対処 |
|---|---|---|
| `/tmp` | 一時ファイル | `emptyDir` をマウント |
| `/var/run` | PIDファイル・ソケット | `emptyDir` をマウント |
| `/app/logs` | ログファイル | stdoutに出力するよう修正 |
| `/app/cache` | キャッシュ | `emptyDir` をマウント |
| `/etc` | 起動時に書き込まれる設定 | ConfigMap/Secretで上書きマウント |

---

## C-0034: Automatic Mapping of Service Account（SAトークンの自動マウント無効化）

### 対応方法

K8s APIを使用しないWorkloadには `automountServiceAccountToken: false` を設定する。

```yaml
# Deployment側
spec:
  template:
    spec:
      automountServiceAccountToken: false

# またはServiceAccount側で一括制御
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-app
automountServiceAccountToken: false
```

### 意味と影響度

**影響度: 中 / 対処コスト: 低**

KubernetesはデフォルトでPod起動時にServiceAccountのトークンを `/var/run/secrets/kubernetes.io/serviceaccount/token` に自動マウントする。コンテナに侵入した攻撃者がこのトークンを使いK8s APIを呼び出し、クラスター内を横断できるリスクがある。

### 備考

- **自前アプリNS (penlight, journee, portfolio等) には明示的な権限付与は一切なし**。default SAのトークンを奪っても K8s APIでできることはほぼないため、現時点での実害リスクは低い
- DNS・Pod間通信はServiceAccountトークンと無関係のため、`false` にしても通信には影響しない
- K8s APIを使うコンポーネント（ArgoCD, tailscale-operator等）は `true` のままにする

#### クラスター内の高権限SA（参考）

侵害された場合に実害が大きいSAは以下。いずれも設計上必要な権限なので権限の変更は行わず、コンポーネント自体のセキュリティ強化で対処する。

| SA | 権限 | リスク |
|---|---|---|
| `argocd/argocd-application-controller` | `* on *`（全権限） | クラスター全リソースの操作が可能 |
| `argocd/argocd-server` | secrets get/list + 全リソースdelete/patch | 全NSのSecret読み取り可能 |
| `rook-ceph/rook-ceph-system` | secrets get/list + deployments操作 | Secret読み取り＋Workload操作 |
| `kube-system/reflector` | `* on secrets/configmaps` | 全NSのSecret/ConfigMap読み書き可能 |

---

## C-0030 / C-0054: NetworkPolicy（NS間通信の分離）

### 対応方法

インターネット公開アプリのNSにデフォルト拒否ポリシーを設定し、必要な通信のみ許可する。

```yaml
# Step1: デフォルト全拒否
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: journee  # 公開アプリのNSに適用
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
---
# Step2: 必要な通信を個別に許可
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-from-cloudflare-tunnel
  namespace: journee
spec:
  podSelector:
    matchLabels:
      app: journee
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: cloudflare-tunnel-ingress-controller
---
# Step3: 外部APIへのEgressを許可（必要な場合）
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-external-egress
  namespace: journee
spec:
  podSelector:
    matchLabels:
      app: journee
  policyTypes:
    - Egress
  egress:
    - ports:
        - port: 443  # HTTPS
        - port: 53   # DNS (必須)
          protocol: UDP
```

### 意味と影響度

**影響度: 中〜高 / 対処コスト: 中**

KubernetesのNSは**論理的な分離に過ぎず、ネットワークレベルの分離ではない**。NetworkPolicyを設定しない限り、全PodはNS横断で自由に通信できる。

公開アプリのPodが侵害された場合、攻撃者はそのPodから**クラスター内の全サービスに到達できる**。

```
journee Pod に侵入（Cloudflare経由で公開）
    ↓ NetworkPolicyがない場合
observability NS の Prometheus へ到達 → 認証なし、メトリクス全取得可能
smart-home NS の Grafana へ到達    → ログイン画面にブルートフォース可能
rook-ceph NS の管理API へ到達      → ストレージ管理APIに到達可能
```

### C-0030とC-0054の違い

| | C-0030 | C-0054 |
|---|---|---|
| 対象 | Pod単位のIngress/Egress制御 | NS間の通信分離 |
| 実装 | 同じNetworkPolicyで両方対処できる |

### 備考

- **当初「インターネット非公開のためOK」と判断したが、Cloudflare経由で公開しているアプリがあるため再評価。公開アプリNSへの適用を推奨する**
- 「ネットワークに到達できるだけでは脅威度は低い」は正しい認識だが、**認証なしで動いている内部サービス（Prometheus等）が存在する場合は実害がある**
- NetworkPolicyはkube-routerなどCNIがサポートしている場合のみ有効（このクラスターはkube-routerを使用しており対応済み）
- 設定コストは高い。全通信要件（外部API呼び出し先・DNS・DB接続先等）を洗い出す必要がある
- DNSのEgress（UDP/53）を忘れると名前解決ができなくなるため必ず許可する

---

## C-0059: CVE-2021-25742 nginx-ingress snippet annotation vulnerability

### 対応方法

nginx-ingress controllerのHelmチャートでsnippetアノテーションを無効化する。

```yaml
# nginx-ingress の values.yaml
controller:
  allowSnippetAnnotations: false
```

### 意味と影響度

**影響度: 低（個人クラスター） / 対処コスト: 低**

nginx-ingressの `snippet` アノテーションを悪用してnginxの設定を自由に書き換えられる脆弱性。Ingressに以下のようなアノテーションを書くことで内部サービスへのプロキシを設置できる。

```yaml
# 攻撃例
annotations:
  nginx.ingress.kubernetes.io/server-snippet: |
    location /steal {
      proxy_pass http://internal-service.other-ns.svc;
    }
```

### 備考

- **マルチテナント環境（複数チームが同じクラスターを使う）で特に危険**。個人クラスターでは自分以外がIngressを作成しないため、脅威シナリオ自体が成立しない
- **個人クラスターでは対処不要**

---

## まとめ: 推奨設定テンプレート

自前アプリに適用する最小セキュリティ設定のテンプレート。

```yaml
spec:
  template:
    spec:
      automountServiceAccountToken: false   # C-0034
      securityContext:
        seccompProfile:
          type: RuntimeDefault              # C-0055
        runAsNonRoot: true                  # C-0013
        runAsUser: 1000
      containers:
        - name: app
          securityContext:
            allowPrivilegeEscalation: false # C-0016
            # readOnlyRootFilesystem: true  # C-0017 (余裕があれば)
```

### 優先度サマリー

| Control | タイトル | 個人運用での優先度 | 対処コスト |
|---|---|---|---|
| C-0055 | Linux Hardening | **必須** | 低（1行） |
| C-0016 | 権限昇格の禁止 | **必須**（アプリ系） | 低 |
| C-0013 | Non-root実行 | **必須**（アプリ系） | 低〜中 |
| C-0034 | SAトークン自動マウント | 対処不要（権限なし確認済み） | — |
| C-0017 | Immutable FS | できればやる | 高 |
| C-0012 | credentials in config | 誤検出 | — |
| C-0030 / C-0054 | NetworkPolicy（NS間通信分離） | **推奨**（公開アプリNSに適用） | 中 |
| C-0059 | CVE-2021-25742 nginx-ingress | 対処不要（単一管理者のため） | — |
