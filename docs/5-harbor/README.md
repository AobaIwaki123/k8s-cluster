# Harbor のインストール

## 1. 証明書の準備

証明書の発行には最大5分程度かかります。

```sh
$ kubectl apply -f manifests/certificate.yaml
```

## 2. Harbor のインストール

```sh
$ argocd app create --file argocd/harbor.yaml
```

## 3. 動作確認

初期パスワードを取得して Harbor にログインします。

```sh
$ kubectl get secret -n harbor harbor-core -o jsonpath="{.data.HARBOR_ADMIN_PASSWORD}" | base64 -d
Harbor12345
```
