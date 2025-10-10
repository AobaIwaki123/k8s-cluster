---
layout: default
title: Harbor
---

# Harbor のインストール

Harborは、エンタープライズグレードのプライベートコンテナレジストリです。脆弱性スキャン、イメージ署名、アクセス制御などの機能を提供します。

## 特徴

- **プライベートレジストリ**: Docker イメージの安全な保管
- **脆弱性スキャン**: イメージのセキュリティチェック
- **イメージ署名**: コンテンツトラストによる署名検証
- **アクセス制御**: RBAC によるきめ細かい権限管理
- **レプリケーション**: 複数のレジストリ間でイメージを同期

## 前提条件

- Kubernetes クラスターが構築済みであること
- ArgoCD がセットアップ済みであること
- [cert-manager](cert-manager.html) がセットアップ済みであること
- 永続ストレージ（[Rook Ceph](rook-ceph.html) など）が利用可能であること
- [Cloudflare Ingress Controller](cloudflare-ingress.html) または Ingress Controller がセットアップ済みであること

## セットアップ手順

### 1. TLS 証明書の準備

Harbor は HTTPS での通信が必須です。cert-manager を使用して証明書を発行します。

証明書の発行には最大5分程度かかります。

```bash
kubectl apply -f ../../manifests/5-harbor/manifests/certificate.yaml
```

証明書の発行状態を確認：

```bash
# Certificate の状態を確認
kubectl get certificate -n harbor

# 詳細を確認
kubectl describe certificate -n harbor
```

### 2. Harbor のインストール

ArgoCD を使用して Harbor をデプロイします。

```bash
argocd app create --file ../../manifests/5-harbor/argocd/harbor.yaml
```

デプロイには数分かかります。

```bash
# Pod の状態を確認
kubectl get pods -n harbor

# すべての Pod が Running になるまで待機
kubectl wait --for=condition=ready pod -l app=harbor -n harbor --timeout=600s
```

### 3. 初期パスワードの取得

Harbor の管理者（admin）の初期パスワードを取得します。

```bash
kubectl get secret -n harbor harbor-core -o jsonpath="{.data.HARBOR_ADMIN_PASSWORD}" | base64 -d
echo  # 改行を追加
```

デフォルトのパスワード: `Harbor12345`

### 4. Harbor へのアクセス

設定した URL（例: `https://harbor.example.com`）にアクセスし、以下の認証情報でログインします。

- **ユーザー名**: `admin`
- **パスワード**: 前の手順で取得したパスワード

## Harbor の設定

### プロジェクトの作成

1. Harbor にログイン
2. "Projects" → "NEW PROJECT" をクリック
3. プロジェクト名を入力（例: `my-project`）
4. アクセスレベルを選択（Public または Private）

### ユーザーの作成

1. "Administration" → "Users" → "NEW USER"
2. ユーザー情報を入力
3. プロジェクトにユーザーを追加
   - Projects → プロジェクト名 → Members → "USER" → ユーザーを追加

## Docker CLI での使用

### Harbor へのログイン

```bash
docker login harbor.example.com
Username: admin
Password: [パスワードを入力]
```

### イメージのプッシュ

```bash
# イメージにタグを付ける
docker tag my-image:latest harbor.example.com/my-project/my-image:latest

# イメージをプッシュ
docker push harbor.example.com/my-project/my-image:latest
```

### イメージのプル

```bash
docker pull harbor.example.com/my-project/my-image:latest
```

## Kubernetes での使用

### ImagePullSecret の作成

プライベートリポジトリからイメージをプルするための Secret を作成します。

```bash
kubectl create secret docker-registry harbor-registry \
  --docker-server=harbor.example.com \
  --docker-username=admin \
  --docker-password=<パスワード> \
  --docker-email=<メールアドレス> \
  -n <namespace>
```

### Pod での使用

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
  - name: my-container
    image: harbor.example.com/my-project/my-image:latest
  imagePullSecrets:
  - name: harbor-registry
```

## トラブルシューティング

### Harbor にアクセスできない

```bash
# Service の確認
kubectl get svc -n harbor

# Ingress の確認
kubectl get ingress -n harbor

# Pod の状態を確認
kubectl get pods -n harbor
```

### Pod が起動しない

```bash
# Pod の詳細を確認
kubectl describe pod <pod-name> -n harbor

# ログを確認
kubectl logs <pod-name> -n harbor

# PVC の状態を確認（ストレージの問題の可能性）
kubectl get pvc -n harbor
```

### TLS 証明書のエラー

```bash
# Certificate の状態を確認
kubectl describe certificate -n harbor

# Secret が作成されているか確認
kubectl get secret -n harbor | grep tls
```

### イメージのプッシュ/プルに失敗

- Harbor のログを確認
- Docker の認証情報を確認
- ネットワーク接続を確認
- Harbor のディスク容量を確認

```bash
# Harbor core のログを確認
kubectl logs -n harbor deployment/harbor-core
```

## セキュリティ設定

### パスワードの変更

1. Harbor にログイン
2. 右上のユーザーアイコン → "Change Password"
3. 現在のパスワードと新しいパスワードを入力

### 脆弱性スキャンの有効化

1. "Administration" → "Interrogation Services"
2. スキャナーの設定を確認
3. プロジェクト設定で自動スキャンを有効化

### コンテンツトラストの有効化

プロジェクト設定で "Enable content trust" を有効にすることで、署名されたイメージのみをプル可能にします。

## 参考リンク

- [Harbor 公式ドキュメント](https://goharbor.io/docs/)
- [Harbor GitHub](https://github.com/goharbor/harbor)
- [Harbor Helm Chart](https://github.com/goharbor/harbor-helm)

