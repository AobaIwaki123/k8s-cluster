# Reflectorを用いてNamespace作成時に、Secretを複製する

# 0. 前準備: Docker credentialの準備

GCRへのアクセスに必要なcredentialを取得し、`gcr-pull-secret.yaml`を生成します。

## 0-1. gcr-pull-secret.yamlの生成

`secret/key.json`にArtifact Registry読み取り権限を持つサービスアカウントキーが配置されている前提です。
```sh
make generate-secret
```

内部では`kubectl create secret`でYAMLを生成し、Reflector用のアノテーションを付与しています。

生成された`gcr-pull-secret.yaml`にはcredential情報が含まれるため、**Gitにコミットしないよう注意してください**。また、`secret/key.json`も同様にGit管理対象から除外してください。
```
gcr-pull-secret.yaml
secret/key.json
```

# 1. Reflectorの導入

## 1-1. Install with Helm
```sh
helm repo add emberstack https://emberstack.github.io/helm-charts
helm repo update
helm upgrade --install reflector emberstack/reflector \
  --namespace kube-system
```

## 1-2. ArgoCDで管理する

HelmでインストールしたReflectorをArgoCDのApplicationとして管理します。
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: reflector
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://emberstack.github.io/helm-charts
    chart: reflector
    targetRevision: "*"
  destination:
    server: https://kubernetes.default.svc
    namespace: kube-system
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```
```sh
kubectl apply -f reflector-app.yaml
```

# 2. Secretにアノテーションを追加する

- アノテーションとは: Kubernetesリソースに付与するメタデータです。ラベルと異なりリソースの選択には使われず、ツールや外部システムへの指示を記述するために使います。ここではReflectorに対して「このSecretを他のNamespaceに複製してよい」という指示を付与しています。

`gcr-pull-secret.yaml`を適用します。アノテーションは`make generate-secret`の時点で付与済みです。
```sh
kubectl apply -f gcr-pull-secret.yaml
```

# 3. Namespace作成時に、Secretが複製されることを確認する
```sh
kubectl create namespace test
```

## 3-1. Secretが複製されていることを確認する
```sh
kubectl get secret gcr-pull-secret -n test
```

## 3-2. 複製されたSecretの内容が一致していることを確認する

ソースと複製先のSecretをそれぞれデコードしてdiffを取ります。
```sh
kubectl get secret gcr-pull-secret -n default -o jsonpath='{.data.\.dockerconfigjson}' | base64 -d > /tmp/source.json
kubectl get secret gcr-pull-secret -n test    -o jsonpath='{.data.\.dockerconfigjson}' | base64 -d > /tmp/replicated.json
diff /tmp/source.json /tmp/replicated.json
```

差分が何も表示されなければ、内容が一致しています。

## 3-3. テスト用Namespaceの削除
```sh
kubectl delete namespace test
```