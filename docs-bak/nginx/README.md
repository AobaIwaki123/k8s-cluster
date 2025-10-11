# Nginx Ingress Controller のインストール

## 1. Nginx Ingress Controller のインストール

```sh
$ kubectl create ns nginx-ingress
```

### 1-1. Helm を使用したインストール

```sh
$ helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
$ helm repo update
```

```sh
$ helm install \
  --namespace nginx-ingress \
  nginx-ingress ingress-nginx/ingress-nginx
```

### 1-2. ArgoCD を使用したインストール

- `expose.tls.auto.commonName` には実際のホスト名を指定します
- `externalURL` も同様に設定します

```sh
$ argocd app create --file apps/nginx-ingress.yaml
```

