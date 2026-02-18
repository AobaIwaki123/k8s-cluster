# Reflectorを用いてNamespace作成時に、Secretを複製する

# 0. 前準備: Docker credentialの準備

GCRへのアクセスに必要なcredentialを取得し、`gcr-pull-secret.yaml`を生成します。

## 0-1. gcr-pull-secret.yamlの生成

`secret/key.json`にArtifact Registry読み取り権限を持つサービスアカウントキーが配置されている前提です。
```sh
make generate-secret
```

内部では`kubectl create secret`を使いYAMLを生成しています。
```makefile
GCR_KEY      ?= secret/key.json
GCR_SERVER   ?= gcr.io
GCR_EMAIL    ?= unused@example.com
SECRET_NAME  = gcr-pull-secret
SECRET_NS    = default
SECRET_OUTPUT = gcr-pull-secret.yaml

.PHONY: generate-secret
generate-secret:
	@if [ ! -f "$(GCR_KEY)" ]; then \
		echo "Error: $(GCR_KEY) not found"; \
		exit 1; \
	fi
	@kubectl create secret docker-registry $(SECRET_NAME) \
		--docker-server=$(GCR_SERVER) \
		--docker-username=_json_key \
		--docker-password="$$(cat $(GCR_KEY))" \
		--docker-email=$(GCR_EMAIL) \
		--namespace=$(SECRET_NS) \
		--dry-run=client -o yaml \
		> $(SECRET_OUTPUT)
	@echo "Generated $(SECRET_OUTPUT)"
```

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

## 1-2. Install with ArgoCD

===あとで埋める===

# 2. Secretにアノテーションを追加する

- アノテーションとは: ===あとで埋める===

`gcr-pull-secret.yaml`
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: gcr-pull-secret
  namespace: default
  annotations:
    reflector.v1.k8s.emberstack.com/reflection-allowed: "true"
    reflector.v1.k8s.emberstack.com/reflection-auto-enabled: "true"
type: kubernetes.io/dockerconfigjson
data:
  .dockerconfigjson: __DOCKER_CONFIG_BASE64__
```
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