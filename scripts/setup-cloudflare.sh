#!/bin/bash
# Cloudflare Tunnel Ingress Controller setup script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/helpers.sh"

# 設定の読み込み
load_config
validate_config

log_info "=========================================="
log_info "Cloudflare Tunnel Ingress Controller Setup"
log_info "=========================================="

# テンプレートファイルのパス
TEMPLATE_FILE="${PROJECT_ROOT}/guide/2-cloudflare-ingress-controller/argocd/cloudflare-tunnel-ingress-controller.yml.tpl"
OUTPUT_FILE="/tmp/cloudflare-tunnel-ingress-controller.yml"

# テンプレートから設定ファイルを生成
log_info "設定ファイルを生成中..."
envsubst < "${TEMPLATE_FILE}" > "${OUTPUT_FILE}"

log_success "設定ファイルを生成しました: ${OUTPUT_FILE}"

# ArgoCD Application として適用
log_info "Cloudflare Tunnel Ingress Controller をデプロイ中..."
kubectl apply -f "${OUTPUT_FILE}"

log_success "ArgoCD Application を作成しました"

# ArgoCD による同期を待機
log_info "ArgoCD による同期を待機中..."
sleep 10

# Cloudflare Ingress Controller Podの起動待機
log_info "Cloudflare Ingress Controller の起動を待機中..."
for i in {1..60}; do
    READY=$(kubectl get pods -n cloudflare-tunnel-ingress-controller --no-headers 2>/dev/null | grep -c "Running" || echo "0")
    if [[ ${READY} -gt 0 ]]; then
        log_success "Cloudflare Ingress Controller が起動しました"
        break
    fi
    echo -ne "\r  待機中... ${i}/60秒"
    sleep 5
done
echo ""

# IngressClassの確認
log_info "IngressClass を確認中..."
kubectl get ingressclass

log_success "Cloudflare Tunnel Ingress Controller のセットアップが完了しました"

# 一時ファイルの削除
rm -f "${OUTPUT_FILE}"

