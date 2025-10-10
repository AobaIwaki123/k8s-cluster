---
layout: default
title: Cert Manager
---

# Cert Manager のインストール

cert-managerは、Kubernetes上で TLS 証明書を自動的に管理するツールです。Let's Encrypt と Cloudflare DNS を組み合わせて、自動的に正式な証明書を発行・更新します。

## 概要

このセットアップでは、以下の構成を実現します：

- **Let's Encrypt**: 無料の TLS 証明書プロバイダー
- **cert-manager**: 証明書の自動発行・更新
- **Cloudflare DNS**: DNS-01 チャレンジによる検証

## 前提条件

- Kubernetes クラスターが構築済みであること
- ArgoCD がセットアップ済みであること
- Cloudflare アカウントとドメイン
- Cloudflare API トークン

## Cloudflare API トークンの作成

### 必要な Permissions

- `Zone:DNS:Edit` - DNS レコードの編集権限

### Zone Resources の設定

- Include → Specific Zone → 対象のドメイン名を選択

## セットアップ手順

### 1. Namespace の作成

```bash
kubectl create namespace cert-manager
```

### 2. CRD のインストール

cert-manager の Custom Resource Definitions (CRD) をインストールします。

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.17.1/cert-manager.crds.yaml
```

### 3. cert-manager のデプロイ

ArgoCD を使用して cert-manager をデプロイします。

```bash
argocd app create --file ../../manifests/4-cert-manager/argocd/cert-manager.yaml
```

### 4. Cloudflare API トークンの登録

Cloudflare API トークンを Secret として登録します。

```bash
kubectl create secret generic cloudflare-api-token-secret \
  --from-literal=api-token=YOUR_CLOUDFLARE_API_TOKEN \
  --namespace=cert-manager
```

### 5. ClusterIssuer の作成

Let's Encrypt を使用して証明書を発行するための ClusterIssuer を作成します。

```bash
kubectl apply -f ../../manifests/4-cert-manager/manifests/clusterissuer-letsencrypt.yaml
```

## ClusterIssuer の設定例

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - dns01:
        cloudflare:
          email: your-cloudflare-email@example.com
          apiTokenSecretRef:
            name: cloudflare-api-token-secret
            key: api-token
```

## 証明書の発行

### Certificate リソースの作成

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: example-com-tls
  namespace: default
spec:
  secretName: example-com-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
  - example.com
  - "*.example.com"
```

### Ingress での自動発行

Ingress リソースにアノテーションを追加することで、自動的に証明書を発行できます。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: example-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - example.com
    secretName: example-com-tls
  rules:
  - host: example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: example-service
            port:
              number: 80
```

## 動作確認

### cert-manager の状態確認

```bash
# Pod の状態を確認
kubectl get pods -n cert-manager

# ClusterIssuer の状態を確認
kubectl get clusterissuer

# Certificate の状態を確認
kubectl get certificate -A
```

### 証明書の詳細確認

```bash
# Certificate リソースの詳細
kubectl describe certificate <certificate-name> -n <namespace>

# 発行された証明書の内容
kubectl get secret <secret-name> -n <namespace> -o yaml
```

## トラブルシューティング

### 証明書が発行されない

```bash
# Certificate の状態を確認
kubectl describe certificate <certificate-name> -n <namespace>

# CertificateRequest の状態を確認
kubectl get certificaterequest -n <namespace>
kubectl describe certificaterequest <request-name> -n <namespace>

# Order と Challenge の状態を確認
kubectl get order -n <namespace>
kubectl get challenge -n <namespace>
```

### DNS-01 チャレンジが失敗する

- Cloudflare API トークンの権限を確認
- ドメインが Cloudflare で管理されているか確認
- cert-manager のログを確認

```bash
kubectl logs -n cert-manager deployment/cert-manager
```

### Let's Encrypt のレート制限

Let's Encrypt には[レート制限](https://letsencrypt.org/docs/rate-limits/)があります。開発時は staging サーバーを使用することを推奨します。

```yaml
# staging サーバー用 ClusterIssuer
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
```

## 証明書の自動更新

cert-manager は証明書の有効期限の30日前から自動的に更新を試みます。特別な設定は不要です。

## 参考リンク

- [cert-manager 公式ドキュメント](https://cert-manager.io/docs/)
- [Let's Encrypt 公式サイト](https://letsencrypt.org/)
- [Cloudflare DNS-01 Challenge](https://cert-manager.io/docs/configuration/acme/dns01/cloudflare/)

