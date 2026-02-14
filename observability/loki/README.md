# Loki

## 概要

Grafana Lokiは、ログ集約システムです。Prometheusにインスパイアされた設計で、ログ内容ではなくラベルでインデックスを作成するため、軽量で効率的です。

**特徴:**
- ラベルベースのログインデックス
- Prometheusと同様のラベルモデル
- LogQL クエリ言語
- Grafanaとのシームレスな統合

## ファイル構成

| ファイル        | 説明                                      |
| --------------- | ----------------------------------------- |
| `loki.app.yaml` | ArgoCD Application定義（Helm values含む） |

## 現在の設定値

### デプロイメントモード

| 設定             | 値             | 説明                                               |
| ---------------- | -------------- | -------------------------------------------------- |
| `deploymentMode` | `SingleBinary` | 全コンポーネントを1つのPodで実行（小規模環境向け） |

### Loki設定

| 設定                              | 値           | 説明                                    |
| --------------------------------- | ------------ | --------------------------------------- |
| `auth_enabled`                    | `false`      | マルチテナント認証を無効化              |
| `commonConfig.replication_factor` | `1`          | レプリケーション数（SingleBinaryでは1） |
| `storage.type`                    | `filesystem` | ローカルファイルシステムストレージ      |

### スキーマ設定

| 設定                        | 値     | 説明                   |
| --------------------------- | ------ | ---------------------- |
| `schemaConfig.store`        | `tsdb` | 新しいTSDBストア形式   |
| `schemaConfig.schema`       | `v13`  | 最新スキーマバージョン |
| `schemaConfig.index.period` | `24h`  | インデックス期間       |

### 制限設定

| 設定                               | 値      | 説明                   |
| ---------------------------------- | ------- | ---------------------- |
| `limits_config.retention_period`   | `168h`  | ログ保持期間（7日）    |
| `limits_config.max_query_length`   | `721h`  | 最大クエリ期間（30日） |
| `limits_config.reject_old_samples` | `false` | 古いサンプルも受け入れ |

### リソース設定

| 設定                            | 値      | 説明             |
| ------------------------------- | ------- | ---------------- |
| `singleBinary.replicas`         | `1`     | レプリカ数       |
| `singleBinary.persistence.size` | `10Gi`  | PVCサイズ        |
| `requests.cpu`                  | `100m`  | CPU リクエスト   |
| `requests.memory`               | `256Mi` | メモリリクエスト |

### 無効化されたコンポーネント

分散モードのコンポーネントは全て無効化:
- `backend`, `read`, `write`, `ingester`, `distributor`
- `querier`, `queryFrontend`, `queryScheduler`, `compactor`
- `indexGateway`, `bloomCompactor`, `bloomGateway`
- `chunksCache`, `resultsCache`, `gateway`

## オプション設定

### 保持期間の延長

ログを長期間保持する場合：

```yaml
loki:
  limits_config:
    retention_period: 720h  # 30日間
```

### 分散モードへの移行

大規模環境（1日10GB以上のログ）では分散モードを検討：

```yaml
deploymentMode: SimpleScalable

backend:
  replicas: 2
read:
  replicas: 2
write:
  replicas: 3

singleBinary:
  replicas: 0
```

### キャッシュの有効化

クエリパフォーマンス向上：

```yaml
chunksCache:
  enabled: true
  replicas: 1
resultsCache:
  enabled: true
  replicas: 1
```

### Ingestion Rate制限

ログ流入量が多い場合の制限調整：

```yaml
loki:
  limits_config:
    ingestion_rate_mb: 10      # MB/s
    ingestion_burst_size_mb: 20
    per_stream_rate_limit: 5MB
    per_stream_rate_limit_burst: 15MB
```

### オブジェクトストレージへの移行

S3/GCS/MinIOなどへの移行（大規模・本番環境向け）：

```yaml
loki:
  storage:
    type: s3
    s3:
      endpoint: s3.amazonaws.com
      bucketnames: loki-chunks
      region: ap-northeast-1
      access_key_id: ${S3_ACCESS_KEY}
      secret_access_key: ${S3_SECRET_KEY}
```

### ストラクチャードメタデータ

ログにメタデータを追加する場合：

```yaml
loki:
  limits_config:
    allow_structured_metadata: true
```

## 参考リンク

- [Loki Helm Chart](https://github.com/grafana/loki/tree/main/production/helm/loki)
- [Loki Documentation](https://grafana.com/docs/loki/latest/)
