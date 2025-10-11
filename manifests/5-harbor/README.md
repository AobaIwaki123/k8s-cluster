# Harbor

> **📚 詳細なドキュメントは [GitHub Pages](https://aobaiwaki123.github.io/k8s-cluster/components/harbor.html) を参照してください。**

## クイックリファレンス

### 前提条件
- ArgoCD がインストールされていること
- cert-manager がインストールされていること
- Cloudflare Tunnel Ingress Controller がインストールされていること

### インストール

```bash
# 1. 証明書の作成（最大5分程度かかります）
kubectl apply -f manifests/certificate.yaml

# 2. ArgoCD Application の作成
argocd app create --file ../1-argocd/argocd/harbor.yaml
```

### 動作確認

```bash
# 初期パスワードの取得
kubectl get secret -n harbor harbor-core -o jsonpath="{.data.HARBOR_ADMIN_PASSWORD}" | base64 -d
# デフォルト: Harbor12345
```

### 関連ファイル
- ArgoCD Application: `../1-argocd/argocd/harbor.yaml`
- マニフェスト: `manifests/certificate.yaml`

## 参考リンク
- [Harbor 公式ドキュメント](https://goharbor.io/docs/)
- [詳細ドキュメント](https://aobaiwaki123.github.io/k8s-cluster/components/harbor.html)
