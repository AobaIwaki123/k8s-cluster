#!/bin/bash
# ArgoCD Ingress publication script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/helpers.sh"

# 設定の読み込み
load_config
validate_config

log_info "=========================================="
log_info "ArgoCD Ingress Publication"
log_info "=========================================="
log_info "Domain: ${ARGOCD_DOMAIN}"

# テンプレートファイルのパス
TEMPLATE_FILE="${PROJECT_ROOT}/guide/1-argocd/manifests/ingress.yml.tpl"
OUTPUT_FILE="/tmp/argocd-ingress.yml"

# テンプレートからIngressファイルを生成
log_info "Ingress 設定ファイルを生成中..."
envsubst < "${TEMPLATE_FILE}" > "${OUTPUT_FILE}"

log_success "Ingress 設定ファイルを生成しました: ${OUTPUT_FILE}"

# Ingressの適用
log_info "ArgoCD Ingress を適用中..."
kubectl apply -f "${OUTPUT_FILE}"

log_success "ArgoCD Ingress を作成しました"

# Ingressの状態確認
log_info "Ingress の状態を確認中..."
sleep 5
kubectl get ingress -n argocd

log_success "=========================================="
log_success "Bootstrap completed successfully!"
log_success "=========================================="
log_info ""
log_info "ArgoCD URL: https://${ARGOCD_DOMAIN}"
log_info "Username: admin"
log_info "Password: ${ARGOCD_ADMIN_PASSWORD}"
log_info ""
log_info "DNS設定を確認してください:"
log_info "  ${ARGOCD_DOMAIN} が Cloudflare Tunnel 経由でアクセス可能になっています"

# 一時ファイルの削除
rm -f "${OUTPUT_FILE}"

