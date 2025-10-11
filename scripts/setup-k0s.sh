#!/bin/bash
# k0s cluster setup script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/helpers.sh"

# 設定の読み込み
load_config
validate_config

log_info "=========================================="
log_info "k0s Cluster Setup"
log_info "=========================================="
log_info "設定ファイル: ${K0S_CONFIG_FILE}"

# k0sクラスターの構築
log_info "k0sクラスターを構築中..."
cd "${PROJECT_ROOT}"
k0sctl apply --config "${K0S_CONFIG_FILE}"

log_success "k0sクラスターの構築が完了しました"

# kubeconfigの取得
log_info "kubeconfigを取得中..."
mkdir -p ~/.kube
k0sctl kubeconfig --config "${K0S_CONFIG_FILE}" > ~/.kube/config
chmod 600 ~/.kube/config

log_success "kubeconfigを ~/.kube/config に保存しました"

# クラスター状態の確認
log_info "クラスター状態を確認中..."
sleep 5
kubectl get nodes -o wide

log_success "k0sクラスターのセットアップが完了しました"

