#!/bin/bash
# Main bootstrap script for k8s cluster setup
# This script automates the complete setup process:
# 1. k0s cluster installation
# 2. ArgoCD installation
# 3. Cloudflare Tunnel Ingress Controller setup
# 4. ArgoCD Ingress publication

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/helpers.sh"

# エラーハンドリング
trap 'log_error "エラーが発生しました。セットアップを中断します。"; exit 1' ERR

log_info "=========================================="
log_info "K8s Cluster Bootstrap"
log_info "=========================================="
log_info ""

# 前提条件の確認
check_prerequisites

# 設定ファイルの読み込みと検証
load_config
validate_config

log_info ""
log_info "以下の設定でクラスターをセットアップします:"
log_info "  k0s設定: ${K0S_CONFIG_FILE}"
log_info "  ArgoCD Domain: ${ARGOCD_DOMAIN}"
log_info "  Cloudflare Tunnel: ${CLOUDFLARE_TUNNEL_NAME}"
log_info ""

# 確認プロンプト（環境変数で無効化可能）
if [[ "${BOOTSTRAP_SKIP_CONFIRM}" != "true" ]]; then
    read -p "続行しますか? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "セットアップをキャンセルしました"
        exit 0
    fi
fi

log_info ""
log_info "=========================================="
log_info "Bootstrap Start"
log_info "=========================================="
log_info ""

# Step 1: k0s cluster setup
log_info "[1/4] k0s cluster setup..."
"${SCRIPT_DIR}/setup-k0s.sh"
log_success "[1/4] k0s cluster setup completed"
log_info ""

# Step 2: ArgoCD installation
log_info "[2/4] ArgoCD installation..."
"${SCRIPT_DIR}/setup-argocd.sh"
log_success "[2/4] ArgoCD installation completed"
log_info ""

# Step 3: Cloudflare Tunnel Ingress Controller setup
log_info "[3/4] Cloudflare Tunnel Ingress Controller setup..."
"${SCRIPT_DIR}/setup-cloudflare.sh"
log_success "[3/4] Cloudflare Tunnel Ingress Controller setup completed"
log_info ""

# Step 4: ArgoCD Ingress publication
log_info "[4/4] ArgoCD Ingress publication..."
"${SCRIPT_DIR}/setup-argocd-ingress.sh"
log_success "[4/4] ArgoCD Ingress publication completed"
log_info ""

log_info "=========================================="
log_success "All steps completed successfully!"
log_info "=========================================="

