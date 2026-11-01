# セキュリティ基準

自宅クラスターでも、外部公開面と復旧用の認証情報を最小化する。ここでは実装時に毎回確認する短い基準だけを残す。

## Secret と証明書

- Cloudflare token、Tailscale OAuth、Docker credential、kubeconfig、Argo CD token、証明書秘密鍵を Git に保存しない。
- cloudflare-api と operator-oauth は Secret の名前・キーだけを参照し、Secret 本体は別経路で作成する。
- cluster/addons/security/cert-manager/ の ClusterIssuer は Secret の名前と key だけを参照する。
- cert-manager は複数の Ingress が letsencrypt-cloudflare を参照しているため、未使用とみなして削除しない。
- 過去にリポジトリやログへ露出した可能性がある token / webhook は、値を再掲せずローテーションを別作業として扱う。

## Workload の既定値

自前アプリには、イメージと実行要件を確認したうえで次を適用する。

~~~yaml
spec:
  template:
    spec:
      automountServiceAccountToken: false
      securityContext:
        seccompProfile:
          type: RuntimeDefault
        runAsNonRoot: true
      containers:
        - name: app
          securityContext:
            allowPrivilegeEscalation: false
~~~

Rook、Tailscale、Cloudflare、Argo CD などホスト・API・ネットワークへ権限が必要な基盤は、
必要な権限を機能要件として記録し、一般アプリの既定値をそのまま適用しない。

## ネットワーク境界

- 外部公開は Cloudflare Tunnel Ingress に限定する。
- Prometheus、Grafana、Argo CD、内部 API を無認証で直接公開しない。
- Tailscale は内部通信の経路として扱い、公開ダッシュボードの入口にはしない。
- NetworkPolicy を追加する場合は、DNS と必要な外向き通信を allowlist に含め、Cloudflare と Tailscale の通信を壊さないことを確認する。
- Ingress のアノテーションやホスト名は、公開情報として扱ってよいか確認する。
- 現行の Grafana Ingress は既存構成として残るが、専用の公開 dashboard とはみなさない。認証と allowlist を別途確認する。

## NFS を導入する場合

- NFS サーバーの管理ネットワークと export の許可元を kubelet ノードに限定する。
- NFS は Rook Ceph の代替候補であり、単一サーバー障害、バックアップ、復旧、データ分離を確認するまで default StorageClass にしない。
- export の root squash、UID/GID、共有パス、NFSv4.1 の利用可否を事前に確認する。
- NFS CSI driver の StorageClass は、用途ごとに reclaimPolicy と mountOptions を明示する。

## プライバシー配慮型ダッシュボード

公開データは「基盤が正常か」を示す集計値に限定する。次の情報は公開しない。

- 個人宅の IP、ホスト名、内部 DNS、VPN / Tunnel 識別子
- namespace、Pod、Deployment、イメージ、Repository の名前
- ログ本文、トレース属性、Secret 名、認証状態、Argo CD の操作 URL
- 稼働している個別アプリから推測できる生活・業務情報

公開前に生成物を grep / schema 検証し、allowlist にないフィールドを拒否する。詳細な Grafana 画面の共有ではなく、サニタイズ済みのスナップショットを使う。
