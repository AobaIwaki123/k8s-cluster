#!/bin/bash
# ArgoCD installation script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/helpers.sh"

# 設定の読み込み
load_config
validate_config

log_info "=========================================="
log_info "ArgoCD Installation"
log_info "=========================================="

# ArgoCD namespaceの作成
log_info "ArgoCD namespaceを作成中..."
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -

log_success "ArgoCD namespaceを作成しました"

# ArgoCD のインストール
log_info "ArgoCD をインストール中..."
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

log_success "ArgoCD のインストールが完了しました"

# ArgoCD Podの起動待機
log_info "ArgoCD Podの起動を待機中..."
wait_for_deployment argocd argocd-server 300

# Insecureモードの設定（Ingress経由でのアクセス用）
log_info "ArgoCD Server を Insecure モードに設定中..."
kubectl apply -n argocd -f "${PROJECT_ROOT}/guide/1-argocd/manifests/argocd-cmd-params-cm.yml"

# ArgoCD Serverの再起動
log_info "ArgoCD Server を再起動中..."
kubectl rollout restart deployment argocd-server -n argocd
wait_for_deployment argocd argocd-server 300

log_success "ArgoCD Server の設定が完了しました"

# 初期パスワードの取得（複数回試行）
log_info "ArgoCD 初期パスワードを取得中..."
sleep 10  # Secretが作成されるまで待機

INITIAL_PASSWORD=""
for i in {1..5}; do
    INITIAL_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" 2>/dev/null | base64 -d || echo "")
    if [[ -n "${INITIAL_PASSWORD}" ]]; then
        break
    fi
    log_warning "初期パスワードの取得を再試行中... (${i}/5)"
    sleep 5
done

if [[ -z "${INITIAL_PASSWORD}" ]]; then
    log_error "ArgoCD 初期パスワードの取得に失敗しました"
    log_info "手動でパスワードを変更してください:"
    log_info "  kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath=\"{.data.password}\" | base64 -d"
    exit 1
fi

log_success "初期パスワードを取得しました"

# ArgoCD Serverへのポートフォワードを開始
log_info "ArgoCD Server へのポートフォワードを開始中..."
kubectl port-forward svc/argocd-server -n argocd 8080:443 > /dev/null 2>&1 &
PORT_FORWARD_PID=$!
sleep 5

# ArgoCD CLIでログイン
log_info "ArgoCD CLI でログイン中..."
argocd login localhost:8080 \
    --username admin \
    --password "${INITIAL_PASSWORD}" \
    --insecure

# パスワード変更
log_info "ArgoCD パスワードを変更中..."
argocd account update-password \
    --current-password "${INITIAL_PASSWORD}" \
    --new-password "${ARGOCD_ADMIN_PASSWORD}"

log_success "ArgoCD パスワードを変更しました"

# ポートフォワードを停止
kill ${PORT_FORWARD_PID} 2>/dev/null || true

# API Key用の設定を適用
log_info "ArgoCD API Key 用の設定を適用中..."
kubectl apply -n argocd -f "${PROJECT_ROOT}/guide/1-argocd/manifests/argocd-cm.yml"
kubectl rollout restart deployment argocd-server -n argocd
wait_for_deployment argocd argocd-server 300

log_success "ArgoCD のセットアップが完了しました"
log_info "Username: admin"
log_info "Password: ${ARGOCD_ADMIN_PASSWORD}"

