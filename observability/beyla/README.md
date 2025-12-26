# Beyla

## 概要

Beyla（旧Grafana Beyla）は、eBPFを使用したアプリケーションの自動計装ツールです。アプリケーションコードの変更やサイドカーなしで、HTTP/gRPCのメトリクスとトレースを自動収集します。

**特徴:**
- eBPFによるカーネルレベルでの計装
- アプリケーションコード変更不要
- 低オーバーヘッド
- 複数言語/フレームワーク対応

## ファイル構成

| ファイル                         | 説明                   |
| -------------------------------- | ---------------------- |
| `beyla.app.yaml`                 | ArgoCD Application定義 |
| `manifests/beyla-resources.yaml` | DaemonSet, RBAC設定    |

## 現在の設定値

### DaemonSet設定

| 設定          | 値     | 説明                      |
| ------------- | ------ | ------------------------- |
| `hostPID`     | `true` | ホストPID名前空間アクセス |
| `hostNetwork` | `true` | ホストネットワーク使用    |
| `privileged`  | `true` | 特権モード（eBPF必須）    |

### 環境変数設定

| 変数                          | 値                                     | 説明                     |
| ----------------------------- | -------------------------------------- | ------------------------ |
| `BEYLA_OPEN_PORT`             | `80,443,8080,3000,5432,6379,9090`      | 監視対象ポート           |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `http://otel-collector-collector:4318` | OTel Collector送信先     |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | `http/protobuf`                        | エクスポートプロトコル   |
| `BEYLA_METRICS_INTERVAL`      | `30s`                                  | メトリクス送信間隔       |
| `BEYLA_TRACES_SAMPLER`        | `always_on`                            | 全トレースをサンプリング |
| `BEYLA_KUBE_METADATA_ENABLE`  | `true`                                 | K8sメタデータ付与        |
| `BEYLA_PROMETHEUS_FEATURES`   | `application,network`                  | Prometheus機能           |
| `BEYLA_LOG_LEVEL`             | `INFO`                                 | ログレベル               |

### リソース設定

| 設定              | 値      |
| ----------------- | ------- |
| `requests.cpu`    | `100m`  |
| `requests.memory` | `128Mi` |
| `limits.cpu`      | `500m`  |
| `limits.memory`   | `512Mi` |

### 必要なCapabilities

- `SYS_ADMIN`: eBPFプログラムのロード
- `SYS_RESOURCE`: リソース制限の変更
- `SYS_PTRACE`: プロセストレース
- `NET_ADMIN`: ネットワーク管理

## オプション設定

### サンプリングレート調整

トレース量削減のためのサンプリング（コスト削減）：

```yaml
- name: BEYLA_TRACES_SAMPLER
  value: "ratio_based"
- name: BEYLA_TRACES_SAMPLER_RATE
  value: "0.1"  # 10%サンプリング
```

### プロセス除外

特定プロセスを監視対象外にする：

```yaml
- name: BEYLA_EXCLUDE_COMMANDS
  value: "curl,wget,kubectl"
```

### ポート追加

追加のポートを監視：

```yaml
- name: BEYLA_OPEN_PORT
  value: "80,443,8080,3000,5432,6379,9090,8000,8888"
```

### Prometheus Scrape有効化

Prometheusから直接スクレイプする場合：

```yaml
- name: BEYLA_PROMETHEUS_PORT
  value: "9090"
```

### 特定Namespaceのみ監視

監視範囲の制限：

```yaml
- name: BEYLA_KUBE_NAMESPACE
  value: "default,production"
```

### SQLクエリトレース

データベースクエリのトレース：

```yaml
- name: BEYLA_TRACE_SQL
  value: "true"
```

### ログ詳細化

デバッグ時：

```yaml
- name: BEYLA_LOG_LEVEL
  value: "DEBUG"
```

### HTTPルートパターン

RESTful APIのルート正規化：

```yaml
- name: BEYLA_ROUTES
  value: "/api/v1/users/:id,/api/v1/orders/:orderId"
```

## セキュリティ考慮事項

> [!WARNING]
> Beylaはprivilegedモードで動作し、ホストのPID/Networkにアクセスします。
> 本番環境では、Pod Security Standardsの例外設定が必要な場合があります。

## 参考リンク

- [Beyla Documentation](https://grafana.com/docs/beyla/latest/)
- [GitHub Repository](https://github.com/grafana/beyla)
