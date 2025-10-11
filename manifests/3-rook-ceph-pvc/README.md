# Rook Ceph (外部クラスター接続)

> **📚 詳細なドキュメントは [GitHub Pages](https://aobaiwaki123.github.io/k8s-cluster/components/rook-ceph.html) を参照してください。**

## クイックリファレンス

### 前提条件
- ArgoCD がインストールされていること
- Proxmox 上で Ceph クラスターが稼働していること

### インストール

```bash
# 1. Rook Operator のデプロイ
argocd app create --file ../1-argocd/argocd/rook-ceph.yaml

# 2. Proxmox で Pool を作成
# Proxmox GUI: PVE Node > Ceph > Pool > Create: k8s-pv-pool
# または CLI: pveceph pool create k8s-pv-pool --pg_autoscale_mode-on

# 3. 外部クラスター接続用の環境変数を取得（Proxmox ホスト上）
wget https://raw.githubusercontent.com/rook/rook/release-1.16/deploy/examples/create-external-cluster-resources.py
python3 create-external-cluster-resources.py --namespace rook-ceph-external --rbd-data-pool-name k8s-pv-pool --format bash --skip-monitoring-endpoint --v2-port-enable

# 4. 環境変数をインポート（kubectl が使用できるホスト上）
source ./env.sh
wget https://raw.githubusercontent.com/rook/rook/release-1.16/deploy/examples/import-external-cluster.sh
. import-external-cluster.sh

# 5. 外部クラスターリソースのデプロイ
argocd app create --file ../1-argocd/argocd/rook-ceph-external.yaml

# 6. デフォルトストレージクラスに設定
kubectl patch storageclass ceph-rbd -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

### 動作確認

```bash
# PVC のテスト
kubectl apply -f tests/test-pvc.yaml
kubectl apply -f tests/test-pod.yaml
```

### 関連ファイル
- ArgoCD Applications: 
  - `../1-argocd/argocd/rook-ceph.yaml`
  - `../1-argocd/argocd/rook-ceph-external.yaml`
- テストマニフェスト: `tests/`

## 参考リンク
- [Rook 公式ドキュメント](https://rook.io/docs/rook/latest/)
- [Proxmox × k0s × CephFS で構築するKubernetesストレージ基盤](https://zenn.dev/aobaiwaki/articles/28ad58a3acaf24)
- [詳細ドキュメント](https://aobaiwaki123.github.io/k8s-cluster/components/rook-ceph.html)
