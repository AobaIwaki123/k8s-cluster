# ArgoCD

> **📚 詳細なドキュメントは [GitHub Pages](https://aobaiwaki123.github.io/k8s-cluster/components/argocd.html) を参照してください。**

## クイックリファレンス

### 前提条件
- k0s クラスターが稼働していること

### インストール

```bash
# ArgoCD namespace を作成
kubectl create namespace argocd

# ArgoCD をインストール
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# SSL リダイレクトの無効化
kubectl apply -n argocd -f manifests/argocd-cmd-params-cm.yml
kubectl rollout restart deployment argocd-server -n argocd

# Service を NodePort に変更
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort"}}'

# Ingress で公開
kubectl apply -f manifests/ingress.yml
```

### 初期パスワードの取得と変更

```bash
# 初期パスワードの取得
argocd admin initial-password -n argocd

# ログインとパスワード変更
argocd login <ARGOCD_SERVER>
argocd account update-password
```

### 関連ファイル
- ArgoCD Applications: `argocd/`（他のコンポーネント用）
- ArgoCD 自体の設定: `manifests/`

## 参考リンク
- [ArgoCD 公式ドキュメント](https://argo-cd.readthedocs.io/)
- [詳細ドキュメント](https://aobaiwaki123.github.io/k8s-cluster/components/argocd.html)
