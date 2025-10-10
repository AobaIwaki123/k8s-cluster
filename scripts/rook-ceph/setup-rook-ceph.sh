#!/bin/bash

# Rook Ceph セットアップスクリプト
# このスクリプトは Kubernetes クラスター上で Rook Ceph をデプロイします
#
# 前提条件:
# - kubectl がインストールされており、クラスターにアクセスできること
# - argocd CLI がインストールされていること
# - ArgoCD がクラスターにデプロイされていること

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

# スクリプトのディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANIFESTS_DIR="${SCRIPT_DIR}/../../manifests/3-rook-ceph-pvc"

# 前提条件のチェック
check_prerequisites() {
    log_info "前提条件をチェックしています..."
    
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl がインストールされていません"
        exit 1
    fi
    
    if ! command -v argocd &> /dev/null; then
        log_error "argocd CLI がインストールされていません"
        exit 1
    fi
    
    if ! kubectl get namespace argocd &> /dev/null; then
        log_error "ArgoCD がクラスターにデプロイされていません"
        exit 1
    fi
    
    log_success "すべての前提条件が満たされています"
}

# ステップ1: ArgoCD で Rook Operator をデプロイ
deploy_rook_operator() {
    log_info "ステップ1: ArgoCD で Rook Operator をデプロイしています..."
    
    if argocd app get rook-ceph &> /dev/null; then
        log_warning "Rook Ceph Application は既に存在します。スキップします"
    else
        argocd app create --file "${MANIFESTS_DIR}/argocd/rook-ceph.yaml"
        log_success "Rook Ceph Application を作成しました"
    fi
    
    # Application が同期されるのを待つ
    log_info "Rook Ceph の同期を待っています..."
    argocd app wait rook-ceph --timeout 600
    
    # rook-ceph namespace の Pod が Ready になるのを待つ
    log_info "Rook Ceph Operator の起動を待っています..."
    kubectl wait --for=condition=Ready pod -l app=rook-ceph-operator -n rook-ceph --timeout=300s
    
    log_success "Rook Operator のデプロイが完了しました"
}

# ステップ2: Proxmox での Pool 作成の案内
show_proxmox_instructions() {
    log_info "ステップ2: Proxmox で Ceph Pool を作成してください"
    echo ""
    echo "次のいずれかの方法で Pool を作成してください:"
    echo ""
    echo "【方法1】Proxmox GUI で作成:"
    echo "  1. PVE Node > Ceph > Pool > Create を選択"
    echo "  2. Pool 名: k8s-pv-pool"
    echo ""
    echo "【方法2】Proxmox CLI で作成:"
    echo "  $ pveceph pool create k8s-pv-pool --pg_autoscale_mode on"
    echo ""
    read -p "Pool の作成が完了したら Enter キーを押してください..."
    log_success "Pool 作成の確認完了"
}

# ステップ3: Proxmox での環境変数取得の案内
show_env_generation_instructions() {
    log_info "ステップ3: Proxmox で環境変数を生成してください"
    echo ""
    echo "Proxmox ホスト上で以下のコマンドを実行してください:"
    echo ""
    echo "  $ wget https://raw.githubusercontent.com/rook/rook/release-1.16/deploy/examples/create-external-cluster-resources.py"
    echo "  $ python3 create-external-cluster-resources.py \\"
    echo "      --namespace rook-ceph-external \\"
    echo "      --rbd-data-pool-name k8s-pv-pool \\"
    echo "      --format bash \\"
    echo "      --skip-monitoring-endpoint \\"
    echo "      --v2-port-enable"
    echo ""
    echo "出力された環境変数を env.sh ファイルに保存してください"
    echo ""
    read -p "環境変数の生成と保存が完了したら Enter キーを押してください..."
    
    # env.sh ファイルの存在確認
    if [ ! -f "env.sh" ]; then
        log_error "env.sh ファイルが見つかりません。現在のディレクトリに env.sh を作成してください"
        exit 1
    fi
    
    log_success "環境変数ファイルの確認完了"
}

# ステップ4: 外部 Ceph クラスターのインポート
import_external_cluster() {
    log_info "ステップ4: 外部 Ceph クラスターをインポートしています..."
    
    # 環境変数を読み込み
    # shellcheck disable=SC1091
    source ./env.sh
    
    # インポートスクリプトをダウンロード
    if [ ! -f "import-external-cluster.sh" ]; then
        wget https://raw.githubusercontent.com/rook/rook/release-1.16/deploy/examples/import-external-cluster.sh
        chmod +x import-external-cluster.sh
    fi
    
    # インポート実行
    ./import-external-cluster.sh
    
    log_success "外部 Ceph クラスターのインポートが完了しました"
}

# ステップ5: ストレージクラスをデフォルトに設定
set_default_storage_class() {
    log_info "ステップ5: Ceph ストレージクラスをデフォルトに設定しています..."
    
    # ceph-rbd ストレージクラスが存在するまで待つ
    log_info "ceph-rbd ストレージクラスの作成を待っています..."
    timeout=300
    elapsed=0
    while ! kubectl get storageclass ceph-rbd &> /dev/null; do
        if [ $elapsed -ge $timeout ]; then
            log_error "タイムアウト: ceph-rbd ストレージクラスが作成されませんでした"
            exit 1
        fi
        sleep 5
        elapsed=$((elapsed + 5))
    done
    
    kubectl patch storageclass ceph-rbd \
        -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
    
    log_success "デフォルトストレージクラスの設定が完了しました"
}

# ステップ6: 外部クラスター接続リソースのデプロイ
deploy_external_cluster_resources() {
    log_info "ステップ6: 外部クラスター接続リソースをデプロイしています..."
    
    if argocd app get rook-ceph-external-cluster &> /dev/null; then
        log_warning "Rook Ceph External Cluster Application は既に存在します。スキップします"
    else
        argocd app create --file "${MANIFESTS_DIR}/argocd/rook-ceph-external-cluster.yaml"
        log_success "Rook Ceph External Cluster Application を作成しました"
    fi
    
    # Application が同期されるのを待つ
    log_info "Rook Ceph External Cluster の同期を待っています..."
    argocd app wait rook-ceph-external-cluster --timeout 600
    
    log_success "外部クラスター接続リソースのデプロイが完了しました"
}

# セットアップ完了メッセージ
show_completion_message() {
    echo ""
    log_success "=============================================="
    log_success "Rook Ceph のセットアップが完了しました！"
    log_success "=============================================="
    echo ""
    log_info "ストレージクラスの確認:"
    kubectl get storageclass
    echo ""
    log_info "テスト PVC を作成する場合は以下を実行してください:"
    echo "  $ kubectl apply -f ${MANIFESTS_DIR}/tests/test-pvc.yaml"
    echo "  $ kubectl apply -f ${MANIFESTS_DIR}/tests/test-pod.yaml"
}

# メイン処理
main() {
    echo ""
    log_info "=============================================="
    log_info "Rook Ceph セットアップスクリプト"
    log_info "=============================================="
    echo ""
    
    check_prerequisites
    deploy_rook_operator
    show_proxmox_instructions
    show_env_generation_instructions
    import_external_cluster
    set_default_storage_class
    deploy_external_cluster_resources
    show_completion_message
}

# スクリプトの実行
main "$@"
