# Promtail

## 概要

Promtailは、Lokiにログを送信するためのエージェントです。Kubernetes環境ではDaemonSetとして各ノードで実行し、Podログを収集します。

**特徴:**
- Kubernetesネイティブ統合
- ラベル自動付与
- パイプライン処理（パース、フィルタ、変換）
- TraceID抽出（Tempo連携）

## ファイル構成

| ファイル            | 説明                                      |
| ------------------- | ----------------------------------------- |
| `promtail.app.yaml` | ArgoCD Application定義（Helm values含む） |

## 現在の設定値

### クライアント設定

| 設定                 | 値                                  | 説明             |
| -------------------- | ----------------------------------- | ---------------- |
| `clients.url`        | `http://loki:3100/loki/api/v1/push` | Loki送信先       |
| `positions.filename` | `/tmp/positions.yaml`               | 読み込み位置記録 |

### ラベル設定（relabel_configs）

| ラベル      | 取得元                                               | 説明       |
| ----------- | ---------------------------------------------------- | ---------- |
| `pod`       | `__meta_kubernetes_pod_name`                         | Pod名      |
| `namespace` | `__meta_kubernetes_namespace`                        | Namespace  |
| `container` | `__meta_kubernetes_pod_container_name`               | コンテナ名 |
| `app`       | `__meta_kubernetes_pod_label_app`                    | appラベル  |
| `service`   | `__meta_kubernetes_pod_label_app_kubernetes_io_name` | サービス名 |
| `node`      | `__meta_kubernetes_pod_node_name`                    | ノード名   |

### パイプライン処理

| ステージ    | 説明                                   |
| ----------- | -------------------------------------- |
| `docker`    | Dockerログフォーマットパース           |
| `regex`     | TraceID抽出（`trace_id` or `traceID`） |
| `labels`    | 抽出したTraceIDをラベル化              |
| `timestamp` | RFC3339Nanoタイムスタンプ抽出          |

### リソース設定

| 設定              | 値      |
| ----------------- | ------- |
| `requests.cpu`    | `100m`  |
| `requests.memory` | `128Mi` |
| `limits.cpu`      | `200m`  |
| `limits.memory`   | `256Mi` |

### ボリュームマウント

| パス                         | 説明               |
| ---------------------------- | ------------------ |
| `/var/log/pods`              | Podログ            |
| `/var/lib/docker/containers` | Dockerコンテナログ |

## オプション設定

### マルチラインログ対応

スタックトレースなど複数行ログの結合：

```yaml
config:
  scrape_configs:
    - job_name: kubernetes-pods
      pipeline_stages:
        - multiline:
            firstline: '^\d{4}-\d{2}-\d{2}'
            max_wait_time: 3s
            max_lines: 128
```

### ログフィルタリング

ヘルスチェックログなど不要ログの除外：

```yaml
pipeline_stages:
  - drop:
      expression: '.*healthz.*'
  - drop:
      expression: '.*readiness.*'
  - drop:
      source: namespace
      value: kube-system
```

### JSONログパース

構造化ログの処理：

```yaml
pipeline_stages:
  - json:
      expressions:
        level: level
        message: msg
        trace_id: trace_id
  - labels:
      level:
```

### 追加ラベル

カスタムラベルの追加：

```yaml
pipeline_stages:
  - static_labels:
      cluster: production
      environment: prod
```

### 特定Namespaceのみ収集

収集範囲の制限：

```yaml
relabel_configs:
  - source_labels: [__meta_kubernetes_namespace]
    action: keep
    regex: default|production|staging
```

### Namespace除外

システムログの除外：

```yaml
relabel_configs:
  - source_labels: [__meta_kubernetes_namespace]
    action: drop
    regex: kube-system|kube-public|argocd
```

### サイドカーログ収集

追加のログソース：

```yaml
extraVolumes:
  - name: application-logs
    hostPath:
      path: /var/log/myapp

extraVolumeMounts:
  - name: application-logs
    mountPath: /var/log/myapp
    readOnly: true
```

### メトリクス変換

ログからメトリクスを生成：

```yaml
pipeline_stages:
  - metrics:
      log_lines_total:
        type: Counter
        description: "Total log lines"
        source: log
        config:
          match_all: true
          action: inc
```

## 参考リンク

- [Promtail Helm Chart](https://github.com/grafana/helm-charts/tree/main/charts/promtail)
- [Promtail Documentation](https://grafana.com/docs/loki/latest/clients/promtail/)
