# 運用手順

## 前提

必要な CLI は `kubectl`、`k0sctl`、`helm`、`argocd`、SSH クライアントです。asdf は必須にしません。Secret や Cloudflare token は Secret 管理の仕組みから注入し、YAML に直接書きません。

## クラスターの構築・接続

```bash
make -C cluster/bootstrap/k0s help
make -C cluster/bootstrap/k0s apply
make -C cluster/bootstrap/k0s config
kubectl get nodes -o wide
```

`apply` と `reset` はクラスター全体に影響するため、対象ホストと kubeconfig を確認してから実行する。既存クラスターの日常運用では `reset` を使わない。

## Argo CD の bootstrap

```bash
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f cluster/bootstrap/argocd/
kubectl get pods -n argocd
```

Argo CD の初期 install は公式マニフェストを利用する。管理者パスワードや API token をコマンド履歴・リポジトリへ残さない。

## Add-on Application の適用

Application の依存関係を意識し、基盤から順に適用する。すでに存在する Application は `kubectl apply` で更新する。

```bash
kubectl apply -f cluster/addons/security/cert-manager/argocd/
kubectl apply -f cluster/addons/networking/cloudflare-tunnel/argocd/
kubectl apply -f cluster/addons/storage/rook-ceph/argocd/
kubectl apply -f cluster/addons/reflector/
kubectl apply -f cluster/addons/observability/opentelemetry/
kubectl apply -f cluster/addons/observability/prometheus-stack/
kubectl apply -f cluster/addons/observability/loki/
kubectl apply -f cluster/addons/observability/tempo/
kubectl apply -f cluster/addons/observability/promtail/
kubectl apply -f cluster/addons/observability/beyla/
kubectl get applications.argoproj.io -n argocd
```

`cluster/addons/observability/` の ConfigMap、Service、ServiceMonitor は、対象 Application の状態と CRD の導入状態を確認してから必要なものだけ適用する。

## 状態確認

```bash
kubectl get nodes
kubectl get applications.argoproj.io -A
kubectl get pods -A
kubectl get pvc -A
kubectl get ingress -A
kubectl get clusterissuer
```

障害調査では、まず Argo CD の `SYNC` / `HEALTH`、次に対象 namespace の Pod、Event、PVC、最後にアプリケーションログを確認する。

## 構成変更と廃止

Argo CD Application の `prune` が有効な場合、リポジトリからマニフェストを消すだけでクラスタ上のリソースが削除され得る。アプリケーションサービスを廃止する場合は、利用元と復旧手段を確認し、Application と namespace の削除を別変更として扱う。

このrepoでは基盤リソースだけを正本にする。`llm-gpu-service` などのアプリケーションサービスは、クラスタに残っていてもこのrepoに IaC を追加しない。

## 観測データを公開しないための確認

- Grafana / Prometheus / Loki / Tempo の Ingress は、公開対象と認証境界を確認する。
- ダッシュボードやスナップショットに内部 IP、namespace、Pod、ログ本文、Secret 名が混ざっていないか確認する。
- 外部共有する場合は、allowlist 済みの集計 API または静的 JSON だけを公開する。
