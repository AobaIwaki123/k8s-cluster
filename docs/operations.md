# 運用手順

## 前提

必要な CLI は kubectl、k0sctl、helm、argocd、SSH クライアントです。asdf は必須にしません。
Secret や Cloudflare token は Secret 管理の仕組みから注入し、YAML やコマンド履歴に直接残しません。

## クラスターの構築・接続

~~~bash
make -C cluster/bootstrap/k0s help
make -C cluster/bootstrap/k0s apply
make -C cluster/bootstrap/k0s config
kubectl get nodes -o wide
~~~

apply と reset はクラスター全体に影響するため、対象ホストと kubeconfig を確認してから実行する。
既存クラスターの日常運用では reset を使わない。

## Argo CD の bootstrap

~~~bash
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f cluster/bootstrap/argocd/
kubectl get pods -n argocd
~~~

Argo CD の初期 install は公式マニフェストを利用する。管理者パスワードや API token を出力・保存しない。

## 基盤 Add-on の適用順

Application の依存関係を意識し、基盤から順に適用する。
すでに存在する Application は、対象と prune の影響を確認してから kubectl apply で更新する。

~~~bash
kubectl apply -f cluster/addons/networking/cloudflare-tunnel/argocd/
kubectl apply -f cluster/addons/networking/tailscale-operator/argocd/
kubectl apply -f cluster/addons/security/cert-manager/argocd/
kubectl apply -f cluster/addons/storage/rook-ceph/argocd/
kubectl apply -f cluster/addons/observability/prometheus-stack/
kubectl get applications.argoproj.io -n argocd
~~~

Tailscale Operator は operator-oauth Secret を先に tailscale namespace へ作成する。
Secret の値はこのリポジトリに保存せず、クライアント ID とクライアント Secret の2キーを用意する。

Cloudflare Tunnel も既存の cloudflare-api Secret を参照する。キー名は Application の valuesObject と一致させる。

## ストレージ

現行の正本は Rook Ceph。NFS はまだ存在しないため、導入手順と判断基準だけを
docs/storage.md に置き、未存在のサーバーを指す StorageClass や Application は追加しない。

## 状態確認

~~~bash
kubectl get nodes
kubectl get applications.argoproj.io -A
kubectl get pods -A
kubectl get pvc -A
kubectl get ingress -A
kubectl get clusterissuer
~~~

障害調査では、まず Argo CD の SYNC / HEALTH、次に対象 namespace の Pod、Event、PVC、最後にアプリケーションログを確認する。

## 構成変更と廃止

Argo CD Application の prune が有効な場合、リポジトリからマニフェストを消すだけでクラスタ上のリソースが削除され得る。
アプリケーションサービスや履歴リソースを廃止する場合は、利用元と復旧手段を確認し、Application・namespace・データの削除を別変更として扱う。

このrepoでは基盤リソースだけを正本にする。llm-gpu-service などのアプリケーションサービスは、
クラスタに残っていてもこのrepoへ IaC を追加しない。

## 観測データを公開しないための確認

- Grafana / Prometheus の Ingress は、公開対象と認証境界を確認する。
- ダッシュボードやスナップショットに内部 IP、namespace、Pod、ログ本文、Secret 名が混ざっていないか確認する。
- 外部共有する場合は、allowlist 済みの集計 API または静的 JSON だけを公開する。
