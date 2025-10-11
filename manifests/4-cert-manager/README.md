# cert-manager

> **📚 詳細なドキュメントは [GitHub Pages](https://aobaiwaki123.github.io/k8s-cluster/components/cert-manager.html) を参照してください。**

## クイックリファレンス

### 前提条件
- ArgoCD がインストールされていること
- Cloudflare API トークン（Zone:DNS:Edit 権限）

### インストール

```bash
# 1. Namespace を作成
kubectl create ns cert-manager

# 2. CRD を追加
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.17.1/cert-manager.crds.yaml -n cert-manager

# 3. ArgoCD Application の作成
argocd app create --file ../1-argocd/argocd/cert-manager.yaml

# 4. Cloudflare API トークンを Secret に登録
kubectl create secret generic cloudflare-api-token-secret \
  --from-literal=api-token=YOUR_CLOUDFLARE_API_TOKEN \
  --namespace=cert-manager

# 5. ClusterIssuer を作成
kubectl apply -f manifests/clusterissuer-letsencrypt.yaml
```

### 関連ファイル
- ArgoCD Application: `../1-argocd/argocd/cert-manager.yaml`
- マニフェスト: `manifests/clusterissuer-letsencrypt.yaml`

## 参考リンク
- [cert-manager 公式ドキュメント](https://cert-manager.io/docs/)
- [詳細ドキュメント](https://aobaiwaki123.github.io/k8s-cluster/components/cert-manager.html)
