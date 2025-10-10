---
layout: default
title: ArgoCD
---

# ArgoCD のインストール

ArgoCDは、Kubernetes向けの宣言的GitOpsツールです。Gitリポジトリをアプリケーションの状態のソースとして使用し、アプリケーションのデプロイと管理を自動化します。

## 前提条件

- Kubernetesクラスターが構築済みであること
- `kubectl` コマンドが使用可能であること

## インストール手順

### 1. ArgoCD namespace を作成

```bash
kubectl create namespace argocd
```

### 2. ArgoCD をインストール

公式の stable マニフェストを使用してインストールします。

```bash
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### 3. SSL リダイレクトの無効化

Ingress経由で公開する場合、SSL リダイレクトを無効化する必要があります。

```bash
kubectl apply -n argocd -f ../../manifests/1-argocd/manifests/argocd-cmd-params-cm.yml
kubectl rollout restart deployment argocd-server -n argocd
```

### 4. Service を NodePort に変更

一時的にNodePort経由でアクセスできるようにします。

```bash
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort"}}'
```

### 5. 初期パスワードの取得と変更

初期パスワードを取得してログインし、パスワードを変更します。

```bash
# 初期パスワードの取得
argocd admin initial-password -n argocd

# ログイン（<ARGOCD_SERVER>はNodePortのアドレスとポート）
argocd login <ARGOCD_SERVER>

# パスワード変更
argocd account update-password
```

## Cloudflare Ingress Controller で公開

[Cloudflare Ingress Controller](cloudflare-ingress.html) のセットアップ後、以下のコマンドでIngress経由で公開できます。

```bash
kubectl apply -f ../../manifests/1-argocd/manifests/ingress.yml
```

## API トークンの設定（オプション）

外部から API を使用してアプリケーションを同期する場合、API トークンを設定します。

### ConfigMap の編集

#### 方法1: コマンドラインから編集

```bash
kubectl edit configmap argocd-cm -n argocd
```

以下を追加：

```yaml
data:
  accounts.admin: apiKey
  # 既にloginなどが存在する場合は、カンマ区切りで追加
  # accounts.admin: apiKey, login
```

#### 方法2: ファイルから適用

```bash
kubectl apply -f ../../manifests/1-argocd/manifests/argocd-cm.yml
```

### ArgoCD Server の再起動

```bash
kubectl rollout restart deployment argocd-server -n argocd
```

### API Token の生成

```bash
argocd login example.com --username admin --password <your-password> --grpc-web
argocd account generate-token
```

## ConfigMap 設定例

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cm
  namespace: argocd
data:
  accounts.admin: login,apiKey
```

## トラブルシューティング

### ArgoCD Server にアクセスできない

- Service の type を確認: `kubectl get svc -n argocd argocd-server`
- Pod の状態を確認: `kubectl get pods -n argocd`
- ログを確認: `kubectl logs -n argocd deployment/argocd-server`

### パスワードが取得できない

初回デプロイ時に自動生成されたSecretを確認します：

```bash
kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d
```

## 次のステップ

ArgoCDのセットアップが完了したら、他のコンポーネントをArgoCD経由でデプロイできます。

- [Cloudflare Ingress Controller](cloudflare-ingress.html)
- [Rook Ceph](rook-ceph.html)
- その他のアプリケーション

## 参考リンク

- [ArgoCD 公式ドキュメント](https://argo-cd.readthedocs.io/)
- [ArgoCD GitHub](https://github.com/argoproj/argo-cd)

