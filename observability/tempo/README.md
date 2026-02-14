# Tempo

## 概要

Grafana Tempoは、分散トレーシングバックエンドです。トレースIDのみでインデックスを作成し、オブジェクトストレージにトレースを保存することで、コスト効率の高い大規模トレース保存を実現します。

**特徴:**
- トレースIDベースのインデックス（低コスト）
- OTLP/Jaeger/Zipkinプロトコル対応
- Grafanaとのネイティブ統合
- TraceQLクエリ言語

## ファイル構成

| ファイル         | 説明                                      |
| ---------------- | ----------------------------------------- |
| `tempo.app.yaml` | ArgoCD Application定義（Helm values含む） |

## 現在の設定値

### Tempo設定

| 設定                       | 値      | 説明                                      |
| -------------------------- | ------- | ----------------------------------------- |
| `searchEnabled`            | `true`  | トレース検索機能を有効化                  |
| `metricsGenerator.enabled` | `true`  | トレースからメトリクス生成（RED metrics） |
| `storage.trace.backend`    | `local` | ローカルストレージ使用                    |

### プロトコル受信設定

**Jaeger:**
| プロトコル  | エンドポイント  | 説明               |
| ----------- | --------------- | ------------------ |
| gRPC        | `0.0.0.0:14250` | Jaeger gRPC        |
| thrift_http | `0.0.0.0:14268` | Jaeger Thrift HTTP |

**OTLP:**
| プロトコル | エンドポイント | 説明      |
| ---------- | -------------- | --------- |
| gRPC       | `0.0.0.0:4317` | OTLP gRPC |
| HTTP       | `0.0.0.0:4318` | OTLP HTTP |

### リソース設定

| 設定                     | 値      | 説明                         |
| ------------------------ | ------- | ---------------------------- |
| `persistence.enabled`    | `true`  | 永続ストレージ有効化         |
| `persistence.size`       | `10Gi`  | PVCサイズ                    |
| `requests.cpu`           | `100m`  | CPU リクエスト               |
| `requests.memory`        | `256Mi` | メモリリクエスト             |
| `serviceMonitor.enabled` | `true`  | Prometheusモニタリング有効化 |

## オプション設定

### トレース保持期間

デフォルトは無制限。保持期間を設定する場合：

```yaml
tempo:
  retention: 168h  # 7日間
```

### オブジェクトストレージへの移行

S3/GCS/Azure Blobへの移行（本番環境推奨）：

```yaml
tempo:
  storage:
    trace:
      backend: s3
      s3:
        bucket: tempo-traces
        endpoint: s3.amazonaws.com
        region: ap-northeast-1
        access_key: ${AWS_ACCESS_KEY}
        secret_key: ${AWS_SECRET_KEY}
```

### サンプリングレート調整

トレース量が多い場合のサンプリング設定：

```yaml
tempo:
  overrides:
    defaults:
      ingestion:
        rate_strategy: local
        rate_limit_bytes: 15000000  # 15MB/s
        burst_size_bytes: 20000000  # 20MB
```

### リソーススケールアップ

大規模トレース処理時：

```yaml
resources:
  requests:
    cpu: 500m
    memory: 1Gi
  limits:
    cpu: 2
    memory: 4Gi
```

### メトリクスジェネレーター詳細設定

Service Graph生成やSpan Metrics生成の詳細設定：

```yaml
tempo:
  metricsGenerator:
    enabled: true
    remoteWriteUrl: http://prometheus:9090/api/v1/write
    processor:
      service_graphs:
        dimensions:
          - service.namespace
          - service.name
      span_metrics:
        dimensions:
          - service.name
          - span.name
```

### マルチテナント設定

複数チームでの利用時：

```yaml
tempo:
  multitenancyEnabled: true
```

### クエリタイムアウト

長時間クエリの許可：

```yaml
tempo:
  server:
    http_server_read_timeout: 5m
    http_server_write_timeout: 5m
  querier:
    search:
      query_timeout: 5m
```

## 参考リンク

- [Tempo Helm Chart](https://github.com/grafana/helm-charts/tree/main/charts/tempo)
- [Tempo Documentation](https://grafana.com/docs/tempo/latest/)
