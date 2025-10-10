---
layout: default
title: MinIO
---

# MinIO のインストール

MinIOは、Amazon S3互換のオブジェクトストレージです。Kubernetes上でセルフホスト型のオブジェクトストレージを構築できます。

## 概要

MinIOは、以下の2つのコンポーネントで構成されます：

- **MinIO Operator**: Kubernetes上でMinIOクラスターを管理するオペレーター
- **MinIO Tenant**: 実際のストレージクラスター（Operatorによって管理される）

## アーキテクチャ

```
ユーザー → MinIO Operator → MinIO Tenant CR → StatefulSet/Pod → MinIO Tenant
                    ↓
              MinIO Console (管理UI)
```

### コンポーネントの役割

| コンポーネント | 役割 |
|--------------|------|
| ユーザー | Tenant CR を作成・適用 |
| MinIO Operator | CR を監視し、MinIOクラスタを構築 |
| MinIO Tenant CR | クラスタ構成の仕様書（YAML） |
| StatefulSet / Pod | 実際に動く MinIO サーバ群 |
| PVC | ストレージ領域（自動生成） |
| MinIO Console | 管理用のWeb UI（自動デプロイ） |

## 前提条件

- Kubernetes クラスターが構築済みであること
- ArgoCD がセットアップ済みであること（推奨）
- 永続ストレージ（[Rook Ceph](rook-ceph.html) など）が利用可能であること
- デフォルトの StorageClass が設定されていること

## セットアップ手順

### 1. MinIO Operator のインストール

#### 方法1: ArgoCD を使用（推奨）

```bash
argocd app create --file ../../manifests/minio/apps/minio-operator.yaml
```

#### 方法2: Helm を使用

```bash
# Namespace の作成
kubectl create namespace minio-operator

# Helm リポジトリの追加
helm repo add minio https://operator.min.io/
helm repo update

# インストール
helm install \
  --namespace minio-operator \
  operator minio-operator/operator
```

#### Operator の確認

```bash
# Pod の状態を確認
kubectl get pods -n minio-operator

# Operator のログを確認
kubectl logs -n minio-operator deployment/minio-operator
```

### 2. Storage Class の設定

MinIO Tenant が使用する StorageClass をデフォルトに設定します。

```bash
# 利用可能な StorageClass を確認
kubectl get storageclass

# Ceph の StorageClass をデフォルトに設定（例）
kubectl patch storageclass ceph-rbd \
  -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'

# デフォルト設定の確認
kubectl get storageclass
# NAME                PROVISIONER                     RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
# ceph-rbd (default)  rook-ceph.rbd.csi.ceph.com      Delete          Immediate           true                   5d
```

### 3. MinIO Tenant の作成

#### 方法1: ArgoCD を使用（推奨）

```bash
# Namespace の作成
kubectl create namespace minio-tenant

# Tenant のデプロイ
argocd app create --file ../../manifests/minio/apps/minio-tenant.yaml
```

#### 方法2: Helm を使用

```bash
# Namespace の作成
kubectl create namespace minio-tenant

# values.yaml を編集してから実行
helm install \
  --namespace minio-tenant \
  --values values.yaml \
  myminio minio-operator/tenant
```

#### Tenant の確認

```bash
# Pod の状態を確認
kubectl get pods -n minio-tenant

# Tenant リソースの確認
kubectl get tenant -n minio-tenant

# PVC の確認
kubectl get pvc -n minio-tenant
```

### 4. MinIO Console へのアクセス

#### Console Service の確認

```bash
kubectl get svc -n minio-tenant myminio-console
```

#### アクセス方法の選択

##### ポートフォワード（開発環境）

```bash
kubectl port-forward svc/myminio-console 9443:9443 -n minio-tenant
```

ブラウザで `https://localhost:9443` にアクセス

##### NodePort（テスト環境）

```bash
kubectl patch svc myminio-console -n minio-tenant \
  -p '{"spec": {"type": "NodePort"}}'

# ポート番号を確認
kubectl get svc myminio-console -n minio-tenant
```

##### Ingress（本番環境）

Ingress リソースを作成して、ドメイン経由でアクセス

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: minio-console
  namespace: minio-tenant
spec:
  rules:
  - host: minio-console.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: myminio-console
            port:
              number: 9443
```

#### 認証情報の取得

```bash
# Secret から認証情報を取得
kubectl get secret -n minio-tenant myminio-env-configuration -o jsonpath="{.data.config\.env}" | base64 -d

# または、直接ユーザー名とパスワードを取得
kubectl get secret -n minio-tenant myminio-env-configuration \
  -o jsonpath="{.data.CONSOLE_ACCESS_KEY}" | base64 -d
echo

kubectl get secret -n minio-tenant myminio-env-configuration \
  -o jsonpath="{.data.CONSOLE_SECRET_KEY}" | base64 -d
echo
```

## MinIO の使用

### AWS CLI (S3互換) での操作

#### AWS CLI の設定

```bash
# AWS CLI のインストール（未インストールの場合）
pip install awscli

# MinIO エンドポイントの設定
aws configure set aws_access_key_id <ACCESS_KEY>
aws configure set aws_secret_access_key <SECRET_KEY>
```

#### バケットの作成

```bash
aws --endpoint-url http://localhost:9000 s3 mb s3://my-bucket
```

#### ファイルのアップロード

```bash
aws --endpoint-url http://localhost:9000 s3 cp myfile.txt s3://my-bucket/
```

#### ファイルのダウンロード

```bash
aws --endpoint-url http://localhost:9000 s3 cp s3://my-bucket/myfile.txt ./
```

#### バケットの一覧表示

```bash
aws --endpoint-url http://localhost:9000 s3 ls
```

### MinIO Client (mc) の使用

```bash
# MinIO Client のインストール
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
sudo mv mc /usr/local/bin/

# エイリアスの設定
mc alias set myminio http://localhost:9000 <ACCESS_KEY> <SECRET_KEY>

# バケットの作成
mc mb myminio/my-bucket

# ファイルのアップロード
mc cp myfile.txt myminio/my-bucket/

# バケットの一覧表示
mc ls myminio
```

## アプリケーションからの利用

### Python (boto3) での例

```python
import boto3

# MinIO クライアントの作成
s3 = boto3.client('s3',
    endpoint_url='http://minio-endpoint:9000',
    aws_access_key_id='ACCESS_KEY',
    aws_secret_access_key='SECRET_KEY'
)

# バケットの作成
s3.create_bucket(Bucket='my-bucket')

# ファイルのアップロード
s3.upload_file('myfile.txt', 'my-bucket', 'myfile.txt')

# ファイルのダウンロード
s3.download_file('my-bucket', 'myfile.txt', 'downloaded.txt')
```

## トラブルシューティング

### Operator が起動しない

```bash
# Operator のログを確認
kubectl logs -n minio-operator deployment/minio-operator

# CRD のインストールを確認
kubectl get crd | grep minio
```

### Tenant が起動しない

```bash
# Tenant リソースの詳細を確認
kubectl describe tenant myminio -n minio-tenant

# Pod の状態を確認
kubectl get pods -n minio-tenant
kubectl describe pod <pod-name> -n minio-tenant

# PVC の状態を確認
kubectl get pvc -n minio-tenant
```

### ストレージが作成されない

- デフォルトの StorageClass が設定されているか確認
- StorageClass が正常に動作しているか確認
- PVC のイベントログを確認

```bash
kubectl describe pvc <pvc-name> -n minio-tenant
```

### Console にアクセスできない

```bash
# Service の確認
kubectl get svc -n minio-tenant

# Console Pod のログを確認
kubectl logs -n minio-tenant <console-pod-name>
```

## セキュリティ設定

### TLS の有効化

MinIO Tenant で TLS を有効にするには、証明書を用意し、Tenant CR で設定します。

```yaml
spec:
  requestAutoCert: true  # 自動証明書発行
  # または
  externalCertSecret:
    name: minio-tls-secret  # 既存の証明書 Secret
```

### アクセスポリシーの設定

MinIO Console から、バケットごとにアクセスポリシーを設定できます。

1. Console にログイン
2. Buckets → バケット名 → Access Rules
3. ポリシーを設定（Read Only、Write Only、Read/Write など）

## 参考リンク

- [MinIO 公式ドキュメント](https://min.io/docs/)
- [MinIO Operator GitHub](https://github.com/minio/operator)
- [MinIO Client (mc) ドキュメント](https://min.io/docs/minio/linux/reference/minio-mc.html)

