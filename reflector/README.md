# Reflectorを用いてNamespace作成時に、Secretを複製する

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

- アノテーション: ===あとで埋める===

`gcr-pull-secret.yaml`
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: gcr-pull-secret
  namespace: default  # ソースnamespace
  annotations:
    reflector.v1.k8s.emberstack.com/reflection-allowed: "true"
    reflector.v1.k8s.emberstack.com/reflection-auto-enabled: "true"
    # 特定namespaceのみ許可する場合（省略すると全namespace）
    # reflector.v1.k8s.emberstack.com/reflection-allowed-namespaces: "ns1,ns2"
type: kubernetes.io/dockerconfigjson
data:
  .dockerconfigjson: <base64-encoded-credentials>
```

# 3. Namespace作成時に、Secretが複製されることを確認する