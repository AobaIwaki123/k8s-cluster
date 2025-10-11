# cert-manager のインストール

## NameSpace を作成

```sh
$ kubectl create ns cert-manager
```

## CRD を追加

```sh
$ kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.17.1/cert-manager.crds.yaml -n cert-manager
```

## ArgoCD アプリケーションを起動

```sh
$ argocd app create --file ./argocd/cert-manager.yaml
```

## Cloudflare の API トークンを作成

### Permissions:

- Zone:DNS:Edit

### Zone Resources:

Include → Specific Zone →（対象のドメイン名を選択）

## Cloudflare の API トークンを Secret に登録

```sh
$ kubectl create secret generic cloudflare-api-token-secret \
  --from-literal=api-token=YOUR_CLOUDFLARE_API_TOKEN \
  --namespace=cert-manager
```

## ClusterIssuer を作成

```sh
$ kubectl apply -f ./manifests/clusterissuer-letsencrypt.yaml
```
