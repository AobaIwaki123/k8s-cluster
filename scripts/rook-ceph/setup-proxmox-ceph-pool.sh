#!/bin/bash

# Proxmox Ceph Pool 作成スクリプト
# このスクリプトは Proxmox ホスト上で実行します
#
# 前提条件:
# - Proxmox VE がインストールされていること
# - Ceph がセットアップされていること
# - pveceph コマンドが使用可能であること

set -euo pipefail

# カラー出力の設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ関数
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

# デフォルト設定
POOL_NAME="${POOL_NAME:-k8s-pv-pool}"
PG_NUM="${PG_NUM:-32}"
PG_AUTOSCALE="${PG_AUTOSCALE:-on}"

# 前提条件のチェック
check_prerequisites() {
    log_info "前提条件をチェックしています..."
    
    if ! command -v pveceph &> /dev/null; then
        log_error "pveceph コマンドが見つかりません。このスクリプトは Proxmox ホスト上で実行してください"
        exit 1
    fi
    
    # Ceph の状態を確認
    if ! pveceph status &> /dev/null; then
        log_error "Ceph クラスターにアクセスできません"
        exit 1
    fi
    
    log_success "すべての前提条件が満たされています"
}

# Ceph Pool の作成
create_ceph_pool() {
    log_info "Ceph Pool '${POOL_NAME}' を作成しています..."
    
    # Pool が既に存在するかチェック
    if pveceph pool ls | grep -q "^${POOL_NAME}"; then
        log_warning "Pool '${POOL_NAME}' は既に存在します"
        return 0
    fi
    
    # Pool を作成
    pveceph pool create "${POOL_NAME}" \
        --pg_autoscale_mode "${PG_AUTOSCALE}" \
        --add_storages 0
    
    log_success "Pool '${POOL_NAME}' を作成しました"
}

# Pool 情報の表示
show_pool_info() {
    log_info "Pool 情報:"
    echo ""
    pveceph pool ls | grep -E "(NAME|${POOL_NAME})" || true
    echo ""
}

# 環境変数生成スクリプトのダウンロードと実行
generate_env_variables() {
    log_info "環境変数生成スクリプトをダウンロードしています..."
    
    SCRIPT_NAME="create-external-cluster-resources.py"
    ROOK_VERSION="${ROOK_VERSION:-release-1.16}"
    
    if [ -f "${SCRIPT_NAME}" ]; then
        log_warning "${SCRIPT_NAME} は既に存在します。既存のファイルを使用します"
    else
        wget "https://raw.githubusercontent.com/rook/rook/${ROOK_VERSION}/deploy/examples/${SCRIPT_NAME}"
        log_success "${SCRIPT_NAME} をダウンロードしました"
    fi
    
    log_info "環境変数を生成しています..."
    echo ""
    echo "========== 以下の環境変数を env.sh にコピーしてください =========="
    echo ""
    
    python3 "${SCRIPT_NAME}" \
        --namespace rook-ceph-external \
        --rbd-data-pool-name "${POOL_NAME}" \
        --format bash \
        --skip-monitoring-endpoint \
        --v2-port-enable
    
    echo ""
    echo "=================================================================="
    echo ""
    log_success "環境変数の生成が完了しました"
    echo ""
    log_info "次のステップ:"
    echo "  1. 上記の環境変数を env.sh ファイルにコピーしてください"
    echo "  2. env.sh ファイルを kubectl が使用できるホストに転送してください"
    echo "  3. kubectl が使用できるホストで setup-rook-ceph.sh を実行してください"
}

# メイン処理
main() {
    echo ""
    log_info "=============================================="
    log_info "Proxmox Ceph Pool 作成スクリプト"
    log_info "=============================================="
    echo ""
    log_info "Pool 名: ${POOL_NAME}"
    log_info "PG Autoscale: ${PG_AUTOSCALE}"
    echo ""
    
    check_prerequisites
    create_ceph_pool
    show_pool_info
    
    # 環境変数生成を実行するか確認
    read -p "環境変数を生成しますか? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        generate_env_variables
    else
        log_info "環境変数の生成をスキップしました"
        echo ""
        log_info "後で生成する場合は以下を実行してください:"
        echo "  $ wget https://raw.githubusercontent.com/rook/rook/release-1.16/deploy/examples/create-external-cluster-resources.py"
        echo "  $ python3 create-external-cluster-resources.py \\"
        echo "      --namespace rook-ceph-external \\"
        echo "      --rbd-data-pool-name ${POOL_NAME} \\"
        echo "      --format bash \\"
        echo "      --skip-monitoring-endpoint \\"
        echo "      --v2-port-enable"
    fi
    
    echo ""
    log_success "=============================================="
    log_success "Proxmox での作業が完了しました"
    log_success "=============================================="
}

# ヘルプメッセージ
show_help() {
    cat << EOF
使用方法: $0 [OPTIONS]

Proxmox Ceph Pool を作成し、Kubernetes 統合用の環境変数を生成します。

オプション:
  -h, --help           このヘルプメッセージを表示
  -p, --pool NAME      Pool 名を指定 (デフォルト: k8s-pv-pool)
  -a, --autoscale MODE PG Autoscale モード: on|off|warn (デフォルト: on)

環境変数:
  POOL_NAME            Pool 名 (デフォルト: k8s-pv-pool)
  PG_AUTOSCALE         PG Autoscale モード (デフォルト: on)
  ROOK_VERSION         Rook のバージョン (デフォルト: release-1.16)

例:
  # デフォルト設定で実行
  $ $0

  # カスタム Pool 名で実行
  $ $0 --pool my-k8s-pool

  # 環境変数で設定
  $ POOL_NAME=my-pool $0

EOF
}

# コマンドライン引数の処理
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -p|--pool)
            POOL_NAME="$2"
            shift 2
            ;;
        -a|--autoscale)
            PG_AUTOSCALE="$2"
            shift 2
            ;;
        *)
            log_error "不明なオプション: $1"
            show_help
            exit 1
            ;;
    esac
done

# スクリプトの実行
main "$@"
