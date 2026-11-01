# セキュリティ基準

自宅クラスターでも、外部公開面と復旧用の認証情報を最小化する。ここでは実装時に毎回確認する短い基準だけを残す。

## Secret と証明書

- Cloudflare token、Docker credential、kubeconfig、Argo CD token、証明書秘密鍵を Git に保存しない。
- `cluster/addons/security/cert-manager/` の `ClusterIssuer` は Secret の名前と key だけを参照し、Secret 本体は別経路で作成する。
- cert-manager は複数の Ingress が `letsencrypt-cloudflare` を参照しているため、未使用とみなして削除しない。
- Secret を複製する Reflector の権限範囲と対象 Secret を定期的に見直す。

## Workload の既定値

自前アプリには、イメージと実行要件を確認したうえで次を適用する。

```yaml
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
```

Rook、Beyla、Argo CD などホスト・API・eBPF への権限が必要な基盤は、必要な権限を機能要件として記録し、一般アプリの既定値をそのまま適用しない。

## ネットワーク境界

- 外部公開は Cloudflare Tunnel Ingress に限定する。
- Prometheus、Grafana、Argo CD、内部 API を無認証で直接公開しない。
- NetworkPolicy を追加する場合は、DNS と必要な外向き通信を allowlist に含め、Cloudflare からの着信を壊さないことを確認する。
- Ingress のアノテーションやホスト名は、公開情報として扱ってよいか確認する。

## プライバシー配慮型ダッシュボード

公開データは「基盤が正常か」を示す集計値に限定する。次の情報は公開しない。

- 個人宅の IP、ホスト名、内部 DNS、VPN / Tunnel 識別子
- namespace、Pod、Deployment、イメージ、Repository の名前
- ログ本文、トレース属性、Secret 名、認証状態、Argo CD の操作 URL
- 稼働している個別アプリから推測できる生活・業務情報

公開前に生成物を grep / schema 検証し、allowlist にないフィールドを拒否する。詳細な Grafana 画面の共有ではなく、サニタイズ済みのスナップショットを使う。
