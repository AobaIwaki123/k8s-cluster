# OpenTelemetry Operator

## 概要

OpenTelemetry Operatorは、Kubernetes上でOpenTelemetry CollectorやAuto-Instrumentationを管理するためのOperatorです。

**主要機能:**
- OpenTelemetryCollector CRDの管理
- 自動再起動・設定リロード
- Auto-Instrumentation Injection（Java, Node.js, Python等）

## ファイル構成

| ファイル                  | 説明                                           |
| ------------------------- | ---------------------------------------------- |
| `otel-operator.app.yaml`  | OpenTelemetry Operator デプロイ                |
| `otel-collector.app.yaml` | OTel Collector CRDリソースのArgoCD Application |

## 現在の設定値

### Operator設定

| 設定                                | 値                                 | 説明                        |
| ----------------------------------- | ---------------------------------- | --------------------------- |
| `manager.collectorImage.repository` | `otel/opentelemetry-collector-k8s` | デフォルトCollectorイメージ |

### デプロイ先

| 設定          | 値                              |
| ------------- | ------------------------------- |
| Namespace     | `opentelemetry-operator-system` |
| Chart Version | `0.100.0`                       |

## オプション設定

### Collectorイメージのカスタマイズ

Contrib版（追加機能含む）を使用する場合：

```yaml
manager:
  collectorImage:
    repository: otel/opentelemetry-collector-contrib
    tag: latest
```

### Operatorリソース制限

Operator自体のリソース調整：

```yaml
manager:
  resources:
    requests:
      cpu: 100m
      memory: 64Mi
    limits:
      cpu: 500m
      memory: 256Mi
```

### Admission Webhooks

CRDバリデーションのWebhook設定：

```yaml
admissionWebhooks:
  create: true
  certManager:
    enabled: true  # cert-manager使用時
```

### Auto-Instrumentation設定

アプリケーションの自動計装を有効化する場合、Instrumentation CRDを作成：

```yaml
# instrumentation.yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: auto-instrumentation
spec:
  exporter:
    endpoint: http://otel-collector-collector:4317
  propagators:
    - tracecontext
    - baggage
  java:
    image: ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-java:latest
  nodejs:
    image: ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-nodejs:latest
  python:
    image: ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-python:latest
```

Podへの自動Injection（annotation追加）：

```yaml
metadata:
  annotations:
    instrumentation.opentelemetry.io/inject-java: "true"
```

### ターゲットアロケーター

大規模スクレイプターゲットの分散管理：

```yaml
manager:
  targetAllocatorImage:
    repository: ghcr.io/open-telemetry/opentelemetry-operator/target-allocator
```

## 参考リンク

- [OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator)
- [Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-operator)
