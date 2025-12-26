# Observability デプロイ手順

本ドキュメントは、observability 配下のコンポーネントを正しい順序でデプロイするための手順書です。

## 前提条件

- ArgoCD がデプロイ済みであること
- kubectl コマンドが利用可能であること
- クラスターへの接続が確立されていること

## デプロイ手順

### Phase 1: Namespace作成

```bash
kubectl apply -f observability/namespace.yaml
```

**確認:**
```bash
kubectl get namespace observability
```

---

### Phase 2: OpenTelemetry Operator

```bash
argocd app create --file observability/opentelemetry/otel-operator.app.yaml
```

**確認:**
```bash
argocd app get opentelemetry-operator
kubectl get pods -n opentelemetry-operator-system
```

**待機:** Operatorが起動完了するまで待つ
```bash
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=opentelemetry-operator -n opentelemetry-operator-system --timeout=300s
```

---

### Phase 3: ストレージバックエンド（Prometheus, Loki, Tempo）

#### 3-1. Prometheus Stack

```bash
argocd app create --file observability/prometheus-stack/prometheus-stack.app.yaml
```

**確認:**
```bash
argocd app get kube-prometheus-stack
kubectl get pods -n observability -l app.kubernetes.io/name=prometheus
kubectl get pods -n observability -l app.kubernetes.io/name=grafana
```

**待機:**
```bash
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=prometheus -n observability --timeout=300s
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=grafana -n observability --timeout=300s
```

#### 3-2. Loki

```bash
argocd app create --file observability/loki/loki.app.yaml
```

**確認:**
```bash
argocd app get loki
kubectl get pods -n observability -l app.kubernetes.io/name=loki
```

**待機:**
```bash
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=loki -n observability --timeout=300s
```

#### 3-3. Tempo

```bash
argocd app create --file observability/tempo/tempo.app.yaml
```

**確認:**
```bash
argocd app get tempo
kubectl get pods -n observability -l app.kubernetes.io/name=tempo
```

**待機:**
```bash
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=tempo -n observability --timeout=300s
```

---

### Phase 4: Grafana DataSources設定

```bash
kubectl apply -f observability/grafana/datasources.yaml
```

**確認:**
```bash
kubectl get configmap grafana-additional-datasources -n observability
```

**Grafana再起動（DataSourcesを反映）:**
```bash
kubectl rollout restart deployment -l app.kubernetes.io/name=grafana -n observability
kubectl rollout status deployment -l app.kubernetes.io/name=grafana -n observability
```

---

### Phase 5: Grafana Dashboard設定（オプション）

```bash
kubectl apply -f observability/grafana/dashboard-configmap.yaml
```

**確認:**
```bash
kubectl get configmap -n observability -l grafana_dashboard=1
```

---

### Phase 6: OpenTelemetry Collector

```bash
argocd app create --file observability/opentelemetry/otel-collector.app.yaml
```

**確認:**
```bash
argocd app get otel-collector
kubectl get opentelemetrycollector otel-collector -n observability
kubectl get pods -n observability -l app.kubernetes.io/component=opentelemetry-collector
```

**待機:**
```bash
kubectl wait --for=condition=ready pod -l app.kubernetes.io/component=opentelemetry-collector -n observability --timeout=300s
```

---

### Phase 7: Beyla（eBPF Auto-Instrumentation）

```bash
argocd app create --file observability/beyla/beyla.app.yaml
```

**確認:**
```bash
argocd app get beyla
kubectl get daemonset beyla -n observability
kubectl get pods -n observability -l app=beyla
```

**待機:**
```bash
kubectl rollout status daemonset beyla -n observability
```

---

### Phase 8: Promtail（ログ収集）

**目的**: Kubernetesポッドログを収集してLokiへ送信

```bash
argocd app create --file observability/promtail/promtail.app.yaml
```

**確認:**
```bash
argocd app get promtail
kubectl get daemonset promtail -n observability
kubectl get pods -n observability -l app.kubernetes.io/name=promtail
```

**待機:**
```bash
kubectl rollout status daemonset promtail -n observability
```

**ログ収集の確認:**
```bash
# Promtailのログを確認
kubectl logs -n observability -l app.kubernetes.io/name=promtail --tail=50

# Lokiでログが取得できるか確認（Grafana Explore推奨）
kubectl port-forward -n observability svc/loki 3100:3100
curl -G -s "http://localhost:3100/loki/api/v1/query" --data-urlencode 'query={namespace="observability"}' | jq
```

---

### Phase 9: Grafana Ingress設定（オプション）

```bash
kubectl apply -f observability/prometheus-stack/prometheus-stack-ingress.yaml
```

**確認:**
```bash
kubectl get ingress -n observability
```

---

## デプロイ後の確認

### 全体のステータス確認

```bash
# ArgoCDアプリケーション一覧
argocd app list | grep -E 'opentelemetry-operator|kube-prometheus-stack|loki|tempo|otel-collector|beyla'

# observability namespaceの全リソース
kubectl get all -n observability

# PVC確認
kubectl get pvc -n observability
```

### Grafanaアクセス

```bash
# Grafana URLの確認（Ingressを設定している場合）
kubectl get ingress -n observability

# Port Forwardでローカルアクセス
kubectl port-forward -n observability svc/kube-prometheus-stack-grafana 3000:80
```

ブラウザで `http://localhost:3000` にアクセス

**デフォルト認証情報:**
- Username: `admin`
- Password: `new_password` (prometheus-stack.app.yaml で設定した値)

### データソースの確認

Grafana にログイン後:
1. Configuration → Data sources
2. 以下のデータソースが設定されていることを確認:
   - Prometheus (default)
   - Loki
   - Tempo

### メトリクスの確認

```bash
# Prometheusにメトリクスが収集されているか確認
kubectl port-forward -n observability svc/kube-prometheus-stack-prometheus 9090:9090
```

ブラウザで `http://localhost:9090` にアクセスし、クエリを実行:
```promql
up
```

### ログの確認

```bash
# Lokiにログが収集されているか確認
kubectl port-forward -n observability svc/loki 3100:3100

# Lokiのメトリクスエンドポイント確認
curl http://localhost:3100/metrics
```

### トレースの確認

```bash
# Tempoにトレースが収集されているか確認
kubectl port-forward -n observability svc/tempo 3200:3200

# Tempoのステータス確認
curl http://localhost:3200/status
```

### Beylaの動作確認

```bash
# Beylaのログ確認
kubectl logs -n observability -l app=beyla --tail=50

# Beylaが収集しているメトリクスの確認
kubectl logs -n observability -l app=beyla | grep -i "found process"
```

## トラブルシューティング

### ArgoCDアプリケーションがSyncされない

```bash
# アプリケーションの詳細確認
argocd app get <app-name>

# 手動でSync
argocd app sync <app-name>
```

### Podが起動しない

```bash
# Pod状態確認
kubectl describe pod <pod-name> -n observability

# ログ確認
kubectl logs <pod-name> -n observability

# イベント確認
kubectl get events -n observability --sort-by='.lastTimestamp'
```

### PVCがPendingのまま

```bash
# PVC状態確認
kubectl describe pvc <pvc-name> -n observability

# StorageClass確認
kubectl get storageclass

# PV確認
kubectl get pv
```

### OpenTelemetry Collectorがデータを送信しない

```bash
# Collector ログ確認
kubectl logs -n observability -l app.kubernetes.io/component=opentelemetry-collector

# Collector設定確認
kubectl get opentelemetrycollector otel-collector -n observability -o yaml
```

### Beylaが対象アプリケーションを検出しない

```bash
# Beyla DaemonSetの状態確認
kubectl get daemonset beyla -n observability

# Beylaログで検出プロセス確認
kubectl logs -n observability daemonset/beyla | grep "instrumenting process"

# ホストのプロセス確認（Beylaが監視しているポート）
kubectl exec -it -n observability <beyla-pod> -- ps aux
```

## アンインストール手順

逆順でリソースを削除します。

```bash
# Phase 8: Promtail
argocd app delete promtail --yes

# Phase 7: Beyla
argocd app delete beyla --yes

# Phase 6: OpenTelemetry Collector
argocd app delete otel-collector --yes

# Phase 5: Grafana DataSources
kubectl delete -f observability/grafana/datasources.yaml
kubectl delete -f observability/grafana/dashboard-configmap.yaml

# Phase 4: ストレージバックエンド
argocd app delete tempo --yes
argocd app delete loki --yes
argocd app delete kube-prometheus-stack --yes

# Phase 3: Prometheus Ingress
kubectl delete -f observability/prometheus-stack/prometheus-stack-ingress.yaml

# Phase 2: OpenTelemetry Operator
argocd app delete opentelemetry-operator --yes

# Phase 1: Namespace（全リソースが削除されていることを確認してから）
kubectl delete -f observability/namespace.yaml
```

**注意:** PVCは自動削除されません。データを保持したい場合は削除しないでください。

```bash
# PVCも削除する場合
kubectl delete pvc --all -n observability
```

## 参考情報

- [ABSTRACT.md](./ABSTRACT.md) - アーキテクチャと構成の詳細
- [README.md](./README.md) - 簡易デプロイ手順
