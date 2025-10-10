---
layout: default
title: Nginx Ingress Controller
---

# Nginx Ingress Controller のインストール

Nginx Ingress Controllerは、KubernetesクラスターへのHTTP/HTTPSトラフィックを管理するための人気のあるIngressコントローラーです。

## 概要

Nginx Ingress Controllerは、以下の機能を提供します：

- **リバースプロキシ**: 外部からのトラフィックをクラスター内のServiceにルーティング
- **TLS終端**: HTTPS通信の処理
- **負荷分散**: 複数のPod間でのトラフィック分散
- **パスベースルーティング**: URLパスに基づいたルーティング
- **ホストベースルーティング**: ドメイン名に基づいたルーティング

## 前提条件

- Kubernetes クラスターが構築済みであること
- ArgoCD がセットアップ済みであること（推奨）
- LoadBalancer または NodePort でのサービス公開が可能であること

## セットアップ手順

### 1. Nginx Ingress Controller のインストール

#### 方法1: ArgoCD を使用（推奨）

ArgoCD Application の設定ファイルを編集します。

```bash
# manifests/nginx/apps/nginx-ingress.yaml を編集
# - expose.tls.auto.commonName: 実際のホスト名を設定
# - externalURL: 実際のURLを設定

# デプロイ
argocd app create --file ../../manifests/nginx/apps/nginx-ingress.yaml
```

#### 方法2: Helm を使用

```bash
# Namespace の作成
kubectl create namespace nginx-ingress

# Helm リポジトリの追加
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# インストール
helm install \
  --namespace nginx-ingress \
  nginx-ingress ingress-nginx/ingress-nginx
```

### 2. デプロイの確認

```bash
# Pod の状態を確認
kubectl get pods -n nginx-ingress

# Service の確認
kubectl get svc -n nginx-ingress

# Ingress Class の確認
kubectl get ingressclass
```

### 3. 外部アクセスの設定

#### LoadBalancer の場合

クラウド環境では自動的に外部IPが割り当てられます。

```bash
# 外部IPの確認
kubectl get svc -n nginx-ingress nginx-ingress-ingress-nginx-controller

# EXTERNAL-IP が表示されるまで待機
```

#### NodePort の場合

オンプレミス環境では NodePort を使用します。

```bash
# Service を NodePort に変更
kubectl patch svc nginx-ingress-ingress-nginx-controller -n nginx-ingress \
  -p '{"spec": {"type": "NodePort"}}'

# ポート番号を確認
kubectl get svc -n nginx-ingress nginx-ingress-ingress-nginx-controller
```

## Ingress リソースの作成

### 基本的な Ingress の例

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: example-ingress
  namespace: default
  annotations:
    kubernetes.io/ingress.class: nginx
spec:
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

### TLS を使用した Ingress の例

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: example-ingress-tls
  namespace: default
  annotations:
    kubernetes.io/ingress.class: nginx
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

### パスベースルーティングの例

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: path-based-ingress
  namespace: default
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
  rules:
  - host: example.com
    http:
      paths:
      - path: /api(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 8080
      - path: /web(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
```

## よく使うアノテーション

### リダイレクト設定

```yaml
annotations:
  # HTTPSにリダイレクト
  nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
  
  # 別のURLにリダイレクト
  nginx.ingress.kubernetes.io/permanent-redirect: "https://newdomain.com"
```

### レート制限

```yaml
annotations:
  # 1秒あたり10リクエストに制限
  nginx.ingress.kubernetes.io/limit-rps: "10"
  
  # 接続数の制限
  nginx.ingress.kubernetes.io/limit-connections: "10"
```

### CORS設定

```yaml
annotations:
  nginx.ingress.kubernetes.io/enable-cors: "true"
  nginx.ingress.kubernetes.io/cors-allow-origin: "*"
  nginx.ingress.kubernetes.io/cors-allow-methods: "GET, POST, PUT, DELETE, OPTIONS"
```

### タイムアウト設定

```yaml
annotations:
  # プロキシタイムアウト（秒）
  nginx.ingress.kubernetes.io/proxy-connect-timeout: "60"
  nginx.ingress.kubernetes.io/proxy-send-timeout: "60"
  nginx.ingress.kubernetes.io/proxy-read-timeout: "60"
```

### アップロードサイズ制限

```yaml
annotations:
  # 最大アップロードサイズ
  nginx.ingress.kubernetes.io/proxy-body-size: "100m"
```

## トラブルシューティング

### Ingress Controller が起動しない

```bash
# Pod の状態を確認
kubectl get pods -n nginx-ingress
kubectl describe pod <pod-name> -n nginx-ingress

# ログを確認
kubectl logs -n nginx-ingress <pod-name>
```

### Ingress が機能しない

```bash
# Ingress リソースの確認
kubectl get ingress -A
kubectl describe ingress <ingress-name> -n <namespace>

# Ingress Controller のログを確認
kubectl logs -n nginx-ingress deployment/nginx-ingress-ingress-nginx-controller

# バックエンドサービスの確認
kubectl get svc <service-name> -n <namespace>
kubectl get endpoints <service-name> -n <namespace>
```

### 502 Bad Gateway エラー

- バックエンドサービスが正常に動作しているか確認
- Podが起動しているか確認
- Service と Pod のラベルが一致しているか確認

```bash
kubectl get pods -n <namespace> -l <label-selector>
kubectl get endpoints <service-name> -n <namespace>
```

### 504 Gateway Timeout エラー

- タイムアウト設定を確認
- バックエンドアプリケーションのレスポンス時間を確認

```yaml
annotations:
  nginx.ingress.kubernetes.io/proxy-read-timeout: "300"
```

## モニタリング

### メトリクスの有効化

Nginx Ingress Controller は Prometheus メトリクスをサポートしています。

```bash
# メトリクスエンドポイントの確認
kubectl port-forward -n nginx-ingress <controller-pod> 10254:10254
curl http://localhost:10254/metrics
```

### アクセスログの確認

```bash
# アクセスログの表示
kubectl logs -n nginx-ingress <controller-pod> -f
```

## 参考リンク

- [Nginx Ingress Controller 公式ドキュメント](https://kubernetes.github.io/ingress-nginx/)
- [Nginx Ingress Controller GitHub](https://github.com/kubernetes/ingress-nginx)
- [Annotations リファレンス](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/)

