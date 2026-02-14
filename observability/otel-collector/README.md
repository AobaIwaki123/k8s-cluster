# OpenTelemetry Collector

## 概要

OpenTelemetry Collectorは、テレメトリーデータ（メトリクス、トレース、ログ）を受信、処理、エクスポートするための統一パイプラインです。

**アーキテクチャ:**
```
Receivers → Processors → Exporters
```

## ファイル構成

| ファイル         | 説明                           |
| ---------------- | ------------------------------ |
| `collector.yaml` | OpenTelemetryCollector CRD定義 |

## 現在の設定値

### 基本設定

| 設定       | 値                                            | 説明                          |
| ---------- | --------------------------------------------- | ----------------------------- |
| `image`    | `otel/opentelemetry-collector-contrib:latest` | Contrib版イメージ             |
| `mode`     | `deployment`                                  | Deploymentモード（2レプリカ） |
| `replicas` | `2`                                           | レプリカ数                    |

### Receivers（データ受信）

| Receiver     | エンドポイント | 説明                      |
| ------------ | -------------- | ------------------------- |
| `otlp.grpc`  | `0.0.0.0:4317` | OTLP gRPC受信             |
| `otlp.http`  | `0.0.0.0:4318` | OTLP HTTP受信             |
| `prometheus` | -              | Kubernetes Pod スクレイプ |

### Processors（データ処理）

| Processor           | 設定                                | 説明              |
| ------------------- | ----------------------------------- | ----------------- |
| `batch`             | timeout: 10s, send_batch_size: 1024 | バッチ処理        |
| `k8sattributes`     | auth_type: serviceAccount           | K8sメタデータ付与 |
| `memory_limiter`    | limit_mib: 512                      | メモリ制限        |
| `resourcedetection` | detectors: env, system              | リソース情報検出  |

### Exporters（データ送信）

| Exporter                | 送信先          | 説明                 |
| ----------------------- | --------------- | -------------------- |
| `prometheusremotewrite` | Prometheus:9090 | メトリクス送信       |
| `otlp/tempo`            | Tempo:4317      | トレース送信（gRPC） |
| `otlphttp/loki`         | Loki:3100/otlp  | ログ送信（HTTP）     |
| `debug`                 | -               | デバッグ出力         |

### Pipelines（データフロー）

| Pipeline | Receivers        | Processors                           | Exporters                    |
| -------- | ---------------- | ------------------------------------ | ---------------------------- |
| metrics  | otlp, prometheus | memory_limiter, k8sattributes, batch | prometheusremotewrite, debug |
| traces   | otlp             | memory_limiter, k8sattributes, batch | otlp/tempo, debug            |
| logs     | otlp             | memory_limiter, k8sattributes, batch | otlphttp/loki, debug         |

### Service Ports

| ポート | プロトコル | 説明                      |
| ------ | ---------- | ------------------------- |
| 8888   | TCP        | Collector自身のメトリクス |
| 4317   | TCP        | OTLP gRPC                 |
| 4318   | TCP        | OTLP HTTP                 |

## オプション設定

### Filterプロセッサー

不要なテレメトリーを除外：

```yaml
processors:
  filter/traces:
    traces:
      span:
        - 'attributes["http.target"] == "/health"'
        - 'attributes["http.target"] == "/ready"'
```

### Transformプロセッサー

テレメトリーデータの変換：

```yaml
processors:
  transform:
    trace_statements:
      - context: span
        statements:
          - set(name, Concat([attributes["http.method"], " ", attributes["http.route"]], ""))
```

### DaemonSetモード

各ノードでの分散収集（大規模環境向け）：

```yaml
spec:
  mode: daemonset
  replicas: null  # DaemonSetでは不要
```

### Gateway + Agent構成

エージェント → ゲートウェイ → バックエンドの階層構成：

```yaml
# Agent (DaemonSet)
spec:
  mode: daemonset
  config:
    exporters:
      otlp:
        endpoint: otel-gateway-collector:4317

# Gateway (Deployment)
spec:
  mode: deployment
  replicas: 3
```

### リソース調整

大量テレメトリー処理時：

```yaml
spec:
  resources:
    requests:
      cpu: 500m
      memory: 1Gi
    limits:
      cpu: 2
      memory: 4Gi
```

### Tail Sampling（トレース）

コスト削減のためのサンプリング：

```yaml
processors:
  tail_sampling:
    decision_wait: 10s
    num_traces: 100
    policies:
      - name: errors
        type: status_code
        status_code: {status_codes: [ERROR]}
      - name: slow-traces
        type: latency
        latency: {threshold_ms: 1000}
      - name: probabilistic
        type: probabilistic
        probabilistic: {sampling_percentage: 10}
```

### メトリクス集約

高カーディナリティメトリクスの削減：

```yaml
processors:
  metricstransform:
    transforms:
      - include: http_server_duration_milliseconds
        action: update
        operations:
          - action: aggregate_labels
            aggregation_type: sum
            label_set: [service, method, status]
```

## RBAC設定

Collectorには以下の権限が必要（現在の設定）：

- `pods`, `namespaces`, `nodes`: get, list, watch
- `replicasets`, `deployments`, `daemonsets`, `statefulsets`: get, list, watch

## 参考リンク

- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/)
- [Configuration](https://opentelemetry.io/docs/collector/configuration/)
- [Contrib Distributions](https://github.com/open-telemetry/opentelemetry-collector-contrib)
