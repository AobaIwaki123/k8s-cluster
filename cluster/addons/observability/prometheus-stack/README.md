# Prometheus Stack

## 概要

kube-prometheus-stack Helm chartを使用して、Prometheusエコシステム全体をデプロイします。

**主要コンポーネント:**
- Prometheus Server: メトリクス収集・保存
- Grafana: データ可視化
- Node Exporter: ノードレベルメトリクス
- Kube State Metrics: Kubernetesオブジェクトメトリクス

## ファイル構成

| ファイル                        | 説明                                      |
| ------------------------------- | ----------------------------------------- |
| `prometheus-stack.app.yaml`     | ArgoCD Application定義（Helm values含む） |
| `prometheus-stack-ingress.yaml` | Grafana用Ingress設定                      |

## 現在の設定値

### Prometheus

| 設定                        | 値      | 説明                                           |
| --------------------------- | ------- | ---------------------------------------------- |
| `retention`                 | `30d`   | メトリクス保持期間                             |
| `storage`                   | `50Gi`  | PVCサイズ                                      |
| `requests.cpu`              | `500m`  | CPU リクエスト                                 |
| `requests.memory`           | `2Gi`   | メモリリクエスト                               |
| `limits.cpu`                | `2000m` | CPU リミット                                   |
| `limits.memory`             | `4Gi`   | メモリリミット                                 |
| `enableRemoteWriteReceiver` | `true`  | OTel Collectorからのリモートライト受信を有効化 |

### Grafana

| 設定                          | 値             | 説明                                      |
| ----------------------------- | -------------- | ----------------------------------------- |
| `adminPassword`               | `new_password` | 管理者パスワード                          |
| `persistence.enabled`         | `true`         | 永続ストレージ有効化                      |
| `persistence.size`            | `10Gi`         | PVCサイズ                                 |
| `sidecar.datasources.enabled` | `true`         | ConfigMapからのデータソース自動読み込み   |
| `sidecar.dashboards.enabled`  | `true`         | ConfigMapからのダッシュボード自動読み込み |

### その他コンポーネント

| 設定                       | 値     | 説明                      |
| -------------------------- | ------ | ------------------------- |
| `nodeExporter.enabled`     | `true` | ノードメトリクス収集      |
| `kubeStateMetrics.enabled` | `true` | K8sオブジェクトメトリクス |

## オプション設定

### Alertmanager（アラート管理）

現在は未設定。本番環境ではアラート通知が必要になる場合があります。

```yaml
alertmanager:
  enabled: true
  config:
    global:
      slack_api_url: 'https://hooks.slack.com/services/xxx'
    route:
      receiver: 'slack'
    receivers:
      - name: 'slack'
        slack_configs:
          - channel: '#alerts'
```

### 追加スクレイプ設定

特定のアプリケーションからメトリクスを収集する場合：

```yaml
prometheus:
  prometheusSpec:
    additionalScrapeConfigs:
      - job_name: 'my-app'
        static_configs:
          - targets: ['my-app.default.svc:8080']
```

### 外部ラベル

複数クラスター運用時のクラスター識別用：

```yaml
prometheus:
  prometheusSpec:
    externalLabels:
      cluster: production
      environment: prod
```

### リソース調整

大量メトリクス処理時のスケールアップ例：

```yaml
prometheus:
  prometheusSpec:
    resources:
      requests:
        cpu: 2
        memory: 8Gi
      limits:
        cpu: 4
        memory: 16Gi
    retention: 90d        # 保持期間延長
    retentionSize: 100GB  # サイズベース保持
```

### ServiceMonitor自動検出

特定のラベルを持つServiceMonitorを自動検出する場合：

```yaml
prometheus:
  prometheusSpec:
    serviceMonitorSelector:
      matchLabels:
        release: kube-prometheus-stack
```

## 参考リンク

- [kube-prometheus-stack Chart](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack)
- [Prometheus Documentation](https://prometheus.io/docs/)
