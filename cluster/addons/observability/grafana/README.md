# Grafana DataSources

## 概要

このディレクトリには、Grafana用の追加データソースとダッシュボード設定が含まれています。prometheus-stackのGrafanaサイドカーが自動的にConfigMapを読み込みます。

## ファイル構成

| ファイル                   | 説明                                     |
| -------------------------- | ---------------------------------------- |
| `datasources.yaml`         | Tempo, Lokiデータソース定義（ConfigMap） |
| `dashboard-configmap.yaml` | ダッシュボード設定                       |
| `dashboards/`              | JSONダッシュボードファイル               |

## 現在の設定値

### Tempo データソース

| 設定   | 値                  | 説明                |
| ------ | ------------------- | ------------------- |
| `type` | `tempo`             | データソースタイプ  |
| `uid`  | `tempo`             | 一意識別子          |
| `url`  | `http://tempo:3200` | Tempoエンドポイント |

**tracesToLogs（トレース→ログ連携）:**
| 設定                 | 値     | 説明                    |
| -------------------- | ------ | ----------------------- |
| `datasourceUid`      | `loki` | Lokiデータソース        |
| `spanStartTimeShift` | `-5m`  | スパン開始5分前から検索 |
| `spanEndTimeShift`   | `5m`   | スパン終了5分後まで検索 |
| `filterByTraceID`    | `true` | TraceIDでフィルタ       |
| `filterBySpanID`     | `true` | SpanIDでフィルタ        |

**tracesToMetrics（トレース→メトリクス連携）:**
| クエリ名     | 説明                       |
| ------------ | -------------------------- |
| Request rate | リクエストレート           |
| Error rate   | エラーレート               |
| Duration     | 99パーセンタイルレイテンシ |

**その他機能:**
| 設定                       | 値           | 説明             |
| -------------------------- | ------------ | ---------------- |
| `serviceMap.datasourceUid` | `prometheus` | サービスマップ用 |
| `nodeGraph.enabled`        | `true`       | ノードグラフ表示 |
| `lokiSearch.datasourceUid` | `loki`       | ログ検索連携     |

### Loki データソース

| 設定       | 値                 | 説明               |
| ---------- | ------------------ | ------------------ |
| `type`     | `loki`             | データソースタイプ |
| `uid`      | `loki`             | 一意識別子         |
| `url`      | `http://loki:3100` | Lokiエンドポイント |
| `maxLines` | `1000`             | 最大取得行数       |

**derivedFields（TraceID抽出）:**
| パターン                        | 説明         |
| ------------------------------- | ------------ |
| `trace_id[=:]\s*([0-9a-fA-F]+)` | trace_id形式 |
| `traceID[=:]\s*([0-9a-fA-F]+)`  | traceID形式  |

## オプション設定

### クエリタイムアウト延長

大量データクエリ時：

```yaml
jsonData:
  timeout: 300  # 5分
```

### 認証ヘッダー

認証が必要な場合：

```yaml
jsonData:
  httpHeaderName1: "X-Scope-OrgID"
secureJsonData:
  httpHeaderValue1: "tenant-1"
```

### 追加のTracesToMetricsクエリ

カスタムメトリクスクエリ：

```yaml
tracesToMetrics:
  queries:
    - name: 'P95 Latency'
      query: 'histogram_quantile(0.95, sum(rate(traces_spanmetrics_latency_bucket{$$__tags}[5m])) by (le))'
    - name: 'Throughput'
      query: 'sum(rate(traces_spanmetrics_calls_total{$$__tags}[5m]))'
```

### ログからの追加フィールド抽出

カスタムderivedFields：

```yaml
derivedFields:
  - datasourceUid: tempo
    matcherRegex: "span_id[=:]\\s*([0-9a-fA-F]+)"
    name: SpanID
    url: "$${__value.raw}"
    urlDisplayLabel: "View Span"
  - datasourceUid: prometheus
    matcherRegex: "request_id[=:]\\s*(\\S+)"
    name: RequestID
    url: '/explore?expr=app_requests_total{request_id="${__value.raw}"}'
```

### 追加データソース

Prometheusをdefault以外に追加する場合：

```yaml
- name: Prometheus-External
  type: prometheus
  uid: prometheus-external
  access: proxy
  url: http://external-prometheus:9090
  jsonData:
    httpMethod: POST
    timeInterval: 15s
```

## ConfigMap ラベル

Grafanaサイドカーが認識するために必要なラベル：

```yaml
labels:
  grafana_datasource: "1"  # データソース用
  grafana_dashboard: "1"   # ダッシュボード用
```

## 参考リンク

- [Grafana Data Sources](https://grafana.com/docs/grafana/latest/datasources/)
- [Tempo Data Source](https://grafana.com/docs/grafana/latest/datasources/tempo/)
- [Loki Data Source](https://grafana.com/docs/grafana/latest/datasources/loki/)
