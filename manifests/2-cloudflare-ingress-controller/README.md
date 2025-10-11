# Cloudflare Tunnel Ingress Controller

> **📚 詳細なドキュメントは [GitHub Pages](https://aobaiwaki123.github.io/k8s-cluster/components/cloudflare-ingress.html) を参照してください。**

## クイックリファレンス

### 前提条件
- ArgoCD がインストールされていること
- Cloudflare アカウントと API トークン
- Cloudflare ダッシュボードでトンネルが作成済みであること

### API トークンの権限
- Zone:Zone:Read
- Zone:DNS:Edit
- Account:Cloudflare Tunnel:Edit

### インストール

```bash
# ArgoCD Application の作成前に、以下の値を設定してください
# - cloudflare.apiToken
# - cloudflare.accountId
# - cloudflare.tunnelName

# ArgoCD Application の作成
argocd app create --file ../1-argocd/argocd/cloudflare-ingress.yaml
```

### 関連ファイル
- ArgoCD Application: `../1-argocd/argocd/cloudflare-ingress.yaml`

## 参考リンク
- [Cloudflare Tunnel Ingress Controller](https://github.com/STRRL/cloudflare-tunnel-ingress-controller)
- [自宅 kubernetes で cloudflare-tunnel-ingress-controller を使ってお手軽外部公開](https://zenn.dev/yh/articles/11823e77bd4379)
- [詳細ドキュメント](https://aobaiwaki123.github.io/k8s-cluster/components/cloudflare-ingress.html)
