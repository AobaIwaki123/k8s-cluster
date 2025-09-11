# ArgoCD のインストール

## ArgoCD namespaceを作成

```sh
$ kubectl create namespace argocd
```

## ArgoCD をインストール

```sh
$ kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

## Ingress で公開するための SSL リダイレクトの無効化

```sh
$ kubectl apply -n argocd -f manifests/argocd-cmd-params-cm.yml
$ kubectl rollout restart deployment argocd-server -n argocd # ArgoCD Server のローリング再起動
```

## ArgoCD の Service を NodePort に変更

```sh
$ kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort"}}'
```


## ArgoCD の初期パスワードの取得と変更

```sh
$ argocd admin initial-password -n argocd
gQz9mVAdH7UgkdyI
$ argocd login <ARGOCD_SERVER>
$ argocd account update-password
Current Password: gQz9mVAdH7UgkdyI
New Password: <NEW_PASSWORD>
Repeat New Password: <NEW_PASSWORD>
```

## Cloudflare Ingress Controllerで公開

Cloudflare Ingress Controllerのセットアップが必要です。

```sh
$ kubectl apply -f manifests/ingress.yml
```

## 外部から API を使用してアプリケーションを同期する方法

### コマンドラインからConfig Mapを編集する方法

```sh
$ kubectl edit configmap argocd-cm -n argocd
```

```diff
data:
+  accounts.admin: apiKey
# 既にloginなどが存在する場合は、カンマ区切りで以下のように追加
# accounts.admin: apiKey, login
```

### ファイルからConfig Mapを編集する方法

```sh
$ kubectl apply -f manifests/argocd-cm.yml
```

### ArgoCD Server の再起動

```sh
$ kubectl rollout restart deployment argocd-server -n argocd
```

### API Tokenの作成

```sh
$ argocd login example.com --username admin --password <your-password> --grpc-web
$ argocd account generate-token
```

### Config Map の設定例

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cm
  namespace: argocd
data:
  accounts.admin: login,apiKey
```
