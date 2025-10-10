#!/bin/bash

# Rook Ceph クリーンアップスクリプト
# このスクリプトは Kubernetes クラスターから Rook Ceph を削除します
#
# 警告: このスクリプトは永続データを含むリソースを削除します！
#       実行前に必ずバックアップを取得してください。
#
# 前提条件:
# - kubectl がインストールされており、クラスターにアクセスできること
# - argocd CLI がインストールされていること

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

# 確認プロンプト
confirm_deletion() {
    echo ""
    log_warning "=============================================="
    log_warning "警告: Rook Ceph のクリーンアップ"
    log_warning "=============================================="
    echo ""
    log_warning "このスクリプトは以下のリソースを削除します:"
    echo "  - ArgoCD Application: rook-ceph-external-cluster"
    echo "  - ArgoCD Application: rook-ceph"
    echo "  - Namespace: rook-ceph-external"
    echo "  - Namespace: rook-ceph"
    echo "  - すべての PVC と PV (永続データが失われます)"
    echo ""
    log_warning "この操作は元に戻せません！"
    echo ""
    
    read -p "本当に削除しますか? 'yes' を入力してください: " -r
    echo
    if [[ ! $REPLY == "yes" ]]; then
        log_info "クリーンアップをキャンセルしました"
        exit 0
    fi
}

# 前提条件のチェック
check_prerequisites() {
    log_info "前提条件をチェックしています..."
    
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl がインストールされていません"
        exit 1
    fi
    
    if ! command -v argocd &> /dev/null; then
        log_warning "argocd CLI がインストールされていません。ArgoCD Application の削除をスキップします"
        SKIP_ARGOCD=true
    else
        SKIP_ARGOCD=false
    fi
    
    log_success "前提条件のチェック完了"
}

# Rook Ceph を使用している PVC の確認と削除
cleanup_pvcs() {
    log_info "Rook Ceph を使用している PVC を確認しています..."
    
    # ceph-rbd ストレージクラスを使用している PVC を取得
    PVCS=$(kubectl get pvc --all-namespaces -o json | \
           jq -r '.items[] | select(.spec.storageClassName == "ceph-rbd") | "\(.metadata.namespace)/\(.metadata.name)"' || echo "")
    
    if [ -z "$PVCS" ]; then
        log_info "Rook Ceph を使用している PVC はありません"
        return 0
    fi
    
    log_warning "以下の PVC が見つかりました:"
    echo "$PVCS"
    echo ""
    
    read -p "これらの PVC を削除しますか? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "PVC の削除をスキップしました。続行する前に手動で削除してください"
        return 0
    fi
    
    # PVC を削除
    echo "$PVCS" | while IFS='/' read -r namespace name; do
        log_info "PVC を削除しています: ${namespace}/${name}"
        kubectl delete pvc -n "$namespace" "$name" --wait=false || true
    done
    
    log_success "PVC の削除を開始しました"
}

# ArgoCD Application の削除
delete_argocd_applications() {
    if [ "$SKIP_ARGOCD" = true ]; then
        log_warning "ArgoCD CLI がないため、Application の削除をスキップします"
        return 0
    fi
    
    log_info "ArgoCD Application を削除しています..."
    
    # rook-ceph-external-cluster の削除
    if argocd app get rook-ceph-external-cluster &> /dev/null; then
        log_info "rook-ceph-external-cluster を削除しています..."
        argocd app delete rook-ceph-external-cluster --yes --cascade || true
        log_success "rook-ceph-external-cluster を削除しました"
    else
        log_info "rook-ceph-external-cluster は存在しません"
    fi
    
    # rook-ceph の削除
    if argocd app get rook-ceph &> /dev/null; then
        log_info "rook-ceph を削除しています..."
        argocd app delete rook-ceph --yes --cascade || true
        log_success "rook-ceph を削除しました"
    else
        log_info "rook-ceph は存在しません"
    fi
}

# Namespace の削除
delete_namespaces() {
    log_info "Namespace を削除しています..."
    
    # rook-ceph-external の削除
    if kubectl get namespace rook-ceph-external &> /dev/null; then
        log_info "rook-ceph-external namespace を削除しています..."
        
        # Finalizer を削除して強制削除
        kubectl get namespace rook-ceph-external -o json | \
            jq '.spec.finalizers = []' | \
            kubectl replace --raw /api/v1/namespaces/rook-ceph-external/finalize -f - || true
        
        kubectl delete namespace rook-ceph-external --timeout=60s || true
        log_success "rook-ceph-external namespace を削除しました"
    else
        log_info "rook-ceph-external namespace は存在しません"
    fi
    
    # rook-ceph の削除
    if kubectl get namespace rook-ceph &> /dev/null; then
        log_info "rook-ceph namespace を削除しています..."
        
        # Finalizer を削除して強制削除
        kubectl get namespace rook-ceph -o json | \
            jq '.spec.finalizers = []' | \
            kubectl replace --raw /api/v1/namespaces/rook-ceph/finalize -f - || true
        
        kubectl delete namespace rook-ceph --timeout=60s || true
        log_success "rook-ceph namespace を削除しました"
    else
        log_info "rook-ceph namespace は存在しません"
    fi
}

# ストレージクラスの削除
delete_storage_classes() {
    log_info "Rook Ceph ストレージクラスを削除しています..."
    
    # ceph-rbd ストレージクラスの削除
    if kubectl get storageclass ceph-rbd &> /dev/null; then
        kubectl delete storageclass ceph-rbd || true
        log_success "ceph-rbd ストレージクラスを削除しました"
    else
        log_info "ceph-rbd ストレージクラスは存在しません"
    fi
    
    # cephfs ストレージクラスの削除（存在する場合）
    if kubectl get storageclass cephfs &> /dev/null; then
        kubectl delete storageclass cephfs || true
        log_success "cephfs ストレージクラスを削除しました"
    fi
}

# CRD の削除
delete_crds() {
    log_info "Rook Ceph CRD を削除しています..."
    
    # Rook 関連の CRD を取得して削除
    CRDS=$(kubectl get crd -o name | grep -E 'ceph.rook.io|objectbucket.io' || echo "")
    
    if [ -z "$CRDS" ]; then
        log_info "Rook Ceph CRD は存在しません"
        return 0
    fi
    
    echo "$CRDS" | while read -r crd; do
        log_info "CRD を削除しています: ${crd}"
        kubectl delete "$crd" --timeout=30s || true
    done
    
    log_success "CRD の削除が完了しました"
}

# クリーンアップ完了メッセージ
show_completion_message() {
    echo ""
    log_success "=============================================="
    log_success "Rook Ceph のクリーンアップが完了しました"
    log_success "=============================================="
    echo ""
    log_info "次のステップ:"
    echo "  1. Proxmox 側で Ceph Pool を削除する場合:"
    echo "     $ pveceph pool destroy k8s-pv-pool"
    echo ""
    echo "  2. 一時ファイルを削除:"
    echo "     $ rm -f env.sh import-external-cluster.sh create-external-cluster-resources.py"
    echo ""
    log_warning "注意: PV のデータは Proxmox Ceph に残っている可能性があります"
}

# メイン処理
main() {
    echo ""
    log_info "=============================================="
    log_info "Rook Ceph クリーンアップスクリプト"
    log_info "=============================================="
    echo ""
    
    confirm_deletion
    check_prerequisites
    cleanup_pvcs
    
    # PVC の削除を待つ
    log_info "PVC の削除を待っています（最大5分）..."
    sleep 10
    
    delete_argocd_applications
    
    # ArgoCD が削除するのを待つ
    log_info "ArgoCD がリソースを削除するのを待っています（30秒）..."
    sleep 30
    
    delete_namespaces
    delete_storage_classes
    delete_crds
    
    show_completion_message
}

# ヘルプメッセージ
show_help() {
    cat << EOF
使用方法: $0 [OPTIONS]

Kubernetes クラスターから Rook Ceph を削除します。

警告: このスクリプトは永続データを含むリソースを削除します！

オプション:
  -h, --help           このヘルプメッセージを表示
  --force              確認なしで削除を実行（危険）

例:
  # 通常の削除（確認あり）
  $ $0

  # 確認なしで削除（CI/CD 環境など）
  $ $0 --force

EOF
}

# コマンドライン引数の処理
FORCE=false
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        --force)
            FORCE=true
            shift
            ;;
        *)
            log_error "不明なオプション: $1"
            show_help
            exit 1
            ;;
    esac
done

# Force モードの場合は確認をスキップ
if [ "$FORCE" = true ]; then
    log_warning "Force モードで実行します（確認なし）"
    check_prerequisites
    cleanup_pvcs
    sleep 10
    delete_argocd_applications
    sleep 30
    delete_namespaces
    delete_storage_classes
    delete_crds
    show_completion_message
else
    main
fi
