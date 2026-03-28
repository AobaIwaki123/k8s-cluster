#!/bin/bash
# Helper functions for cluster bootstrap scripts

set -e

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# プロジェクトルートディレクトリ
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CONFIG_FILE="${PROJECT_ROOT}/config/cluster.yml"

# ログ出力関数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 設定ファイルの存在確認
check_config_exists() {
    if [[ ! -f "${CONFIG_FILE}" ]]; then
        log_error "設定ファイルが見つかりません: ${CONFIG_FILE}"
        log_info "以下のコマンドでサンプルから作成してください:"
        log_info "  cp config/cluster.yml.example config/cluster.yml"
        log_info "  vim config/cluster.yml  # 実際の値を設定"
        exit 1
    fi
}

# yqコマンドの存在確認
check_yq_installed() {
    if ! command -v yq &> /dev/null; then
        log_error "yq コマンドが見つかりません"
        log_info "yq をインストールしてください:"
        log_info "  macOS: brew install yq"
        log_info "  Linux: https://github.com/mikefarah/yq#install"
        exit 1
    fi
}

# 設定値の読み込み
load_config() {
    check_config_exists
    check_yq_installed
    
    # 設定値を環境変数としてエクスポート
    export K0S_CONFIG_FILE=$(yq eval '.k0s.config_file' "${CONFIG_FILE}")
    export ARGOCD_ADMIN_PASSWORD=$(yq eval '.argocd.admin_password' "${CONFIG_FILE}")
    export ARGOCD_DOMAIN=$(yq eval '.argocd.domain' "${CONFIG_FILE}")
    export CLOUDFLARE_API_TOKEN=$(yq eval '.cloudflare.api_token' "${CONFIG_FILE}")
    export CLOUDFLARE_ACCOUNT_ID=$(yq eval '.cloudflare.account_id' "${CONFIG_FILE}")
    export CLOUDFLARE_TUNNEL_NAME=$(yq eval '.cloudflare.tunnel_name' "${CONFIG_FILE}")
    
    log_success "設定ファイルを読み込みました: ${CONFIG_FILE}"
}

# 設定値の検証
validate_config() {
    local errors=0
    
    if [[ "${ARGOCD_ADMIN_PASSWORD}" == "your-new-password" ]] || [[ -z "${ARGOCD_ADMIN_PASSWORD}" ]]; then
        log_error "ArgoCD パスワードが設定されていません"
        errors=$((errors + 1))
    fi
    
    if [[ "${ARGOCD_DOMAIN}" == "argocd.example.com" ]] || [[ -z "${ARGOCD_DOMAIN}" ]]; then
        log_error "ArgoCD ドメインが設定されていません"
        errors=$((errors + 1))
    fi
    
    if [[ "${CLOUDFLARE_API_TOKEN}" == "your-cloudflare-api-token" ]] || [[ -z "${CLOUDFLARE_API_TOKEN}" ]]; then
        log_error "Cloudflare API トークンが設定されていません"
        errors=$((errors + 1))
    fi
    
    if [[ "${CLOUDFLARE_ACCOUNT_ID}" == "your-cloudflare-account-id" ]] || [[ -z "${CLOUDFLARE_ACCOUNT_ID}" ]]; then
        log_error "Cloudflare アカウントIDが設定されていません"
        errors=$((errors + 1))
    fi
    
    if [[ ! -f "${PROJECT_ROOT}/${K0S_CONFIG_FILE}" ]]; then
        log_error "k0s設定ファイルが見つかりません: ${K0S_CONFIG_FILE}"
        errors=$((errors + 1))
    fi
    
    if [[ ${errors} -gt 0 ]]; then
        log_error "設定ファイルに ${errors} 個のエラーがあります"
        log_info "config/cluster.yml を確認して修正してください"
        exit 1
    fi
    
    log_success "設定の検証に成功しました"
}

# Podの起動待機
wait_for_pods() {
    local namespace=$1
    local label=$2
    local timeout=${3:-300}  # デフォルト5分
    
    log_info "Podの起動を待機中: namespace=${namespace}, label=${label}"
    
    local elapsed=0
    while [[ ${elapsed} -lt ${timeout} ]]; do
        local ready_count=$(kubectl get pods -n "${namespace}" -l "${label}" -o jsonpath='{.items[*].status.containerStatuses[*].ready}' 2>/dev/null | grep -o "true" | wc -l || echo "0")
        local total_count=$(kubectl get pods -n "${namespace}" -l "${label}" --no-headers 2>/dev/null | wc -l || echo "0")
        
        if [[ ${total_count} -gt 0 ]] && [[ ${ready_count} -eq ${total_count} ]]; then
            log_success "すべてのPodが起動しました (${ready_count}/${total_count})"
            return 0
        fi
        
        echo -ne "\r  待機中... ${elapsed}/${timeout}秒 (Ready: ${ready_count}/${total_count})"
        sleep 5
        elapsed=$((elapsed + 5))
    done
    
    echo ""
    log_error "タイムアウト: Podが起動しませんでした"
    return 1
}

# Deploymentの起動待機
wait_for_deployment() {
    local namespace=$1
    local deployment=$2
    local timeout=${3:-300}
    
    log_info "Deploymentの起動を待機中: ${namespace}/${deployment}"
    
    if kubectl wait --for=condition=available --timeout="${timeout}s" \
        deployment/"${deployment}" -n "${namespace}" &>/dev/null; then
        log_success "Deploymentが起動しました: ${deployment}"
        return 0
    else
        log_error "Deploymentの起動に失敗しました: ${deployment}"
        return 1
    fi
}

# コマンドの存在確認
check_command() {
    local cmd=$1
    if ! command -v "${cmd}" &> /dev/null; then
        log_error "${cmd} コマンドが見つかりません"
        return 1
    fi
    return 0
}

# 必要なコマンドの確認
check_prerequisites() {
    local missing=0
    
    log_info "前提条件を確認中..."
    
    for cmd in k0sctl kubectl argocd yq envsubst; do
        if ! check_command "${cmd}"; then
            missing=$((missing + 1))
        fi
    done
    
    if [[ ${missing} -gt 0 ]]; then
        log_error "${missing} 個の必須コマンドが見つかりません"
        log_info "必要なツールをインストールしてください"
        exit 1
    fi
    
    log_success "すべての前提条件が満たされています"
}

# スクリプトから直接実行された場合
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    case "${1:-}" in
        check-config)
            load_config
            validate_config
            log_success "設定ファイルは正常です"
            ;;
        *)
            log_error "Usage: $0 check-config"
            exit 1
            ;;
    esac
fi

