# Rook Ceph セットアップスクリプト

このディレクトリには、Rook Ceph を Kubernetes クラスターにデプロイし、Proxmox の外部 Ceph クラスターに接続するためのスクリプトが含まれています。

## 📁 スクリプト一覧

### 1. `setup-proxmox-ceph-pool.sh`
**実行環境**: Proxmox ホスト

Proxmox 上で Ceph Pool を作成し、Kubernetes 統合用の環境変数を生成します。

**機能**:
- Ceph Pool の作成（デフォルト名: `k8s-pv-pool`）
- 環境変数生成スクリプトのダウンロード
- Kubernetes 統合用の環境変数の生成

**使用方法**:
```bash
# デフォルト設定で実行
$ ./setup-proxmox-ceph-pool.sh

# カスタム Pool 名で実行
$ ./setup-proxmox-ceph-pool.sh --pool my-k8s-pool

# 環境変数で設定
$ POOL_NAME=my-pool ./setup-proxmox-ceph-pool.sh
```

**オプション**:
- `-p, --pool NAME`: Pool 名を指定（デフォルト: `k8s-pv-pool`）
- `-a, --autoscale MODE`: PG Autoscale モード: `on|off|warn`（デフォルト: `on`）
- `-h, --help`: ヘルプメッセージを表示

**環境変数**:
- `POOL_NAME`: Pool 名（デフォルト: `k8s-pv-pool`）
- `PG_AUTOSCALE`: PG Autoscale モード（デフォルト: `on`）
- `ROOK_VERSION`: Rook のバージョン（デフォルト: `release-1.16`）

### 2. `setup-rook-ceph.sh`
**実行環境**: kubectl が使用できるホスト（Kubernetes クラスターにアクセス可能）

Rook Ceph を Kubernetes クラスターにデプロイし、Proxmox の外部 Ceph クラスターに接続します。

**機能**:
1. ArgoCD で Rook Operator をデプロイ
2. Proxmox での Pool 作成の案内
3. 環境変数生成の案内
4. 外部 Ceph クラスターのインポート
5. ストレージクラスをデフォルトに設定
6. 外部クラスター接続リソースのデプロイ

**前提条件**:
- `kubectl` がインストールされていること
- `argocd` CLI がインストールされていること
- ArgoCD がクラスターにデプロイされていること
- Proxmox で生成した `env.sh` ファイルが同じディレクトリにあること

**使用方法**:
```bash
# Proxmox から env.sh を取得した後に実行
$ ./setup-rook-ceph.sh
```

### 3. `cleanup-rook-ceph.sh`
**実行環境**: kubectl が使用できるホスト

Kubernetes クラスターから Rook Ceph を削除します。

**警告**: このスクリプトは永続データを含むリソースを削除します！実行前に必ずバックアップを取得してください。

**機能**:
- Rook Ceph を使用している PVC の確認と削除
- ArgoCD Application の削除
- Namespace の削除
- ストレージクラスの削除
- CRD の削除

**使用方法**:
```bash
# 通常の削除（確認あり）
$ ./cleanup-rook-ceph.sh

# 確認なしで削除（CI/CD 環境など）
$ ./cleanup-rook-ceph.sh --force
```

**オプション**:
- `--force`: 確認なしで削除を実行（危険）
- `-h, --help`: ヘルプメッセージを表示

## 🚀 セットアップ手順

### ステップ 1: Proxmox でのセットアップ

Proxmox ホスト上で実行します：

```bash
# スクリプトを Proxmox ホストにコピー
$ scp setup-proxmox-ceph-pool.sh root@proxmox-host:/root/

# Proxmox ホストにログイン
$ ssh root@proxmox-host

# スクリプトを実行
$ cd /root
$ chmod +x setup-proxmox-ceph-pool.sh
$ ./setup-proxmox-ceph-pool.sh
```

スクリプトの出力から環境変数をコピーし、`env.sh` ファイルを作成します。

### ステップ 2: env.sh をローカルホストに転送

```bash
# Proxmox から env.sh を取得
$ scp root@proxmox-host:/root/env.sh ./
```

### ステップ 3: Kubernetes でのセットアップ

kubectl が使用できるホスト上で実行します：

```bash
# env.sh が同じディレクトリにあることを確認
$ ls env.sh

# セットアップスクリプトを実行
$ ./setup-rook-ceph.sh
```

スクリプトは対話的に実行され、各ステップの進行状況を表示します。

### ステップ 4: 動作確認

```bash
# ストレージクラスの確認
$ kubectl get storageclass

# テスト PVC の作成
$ kubectl apply -f ../../manifests/3-rook-ceph-pvc/tests/test-pvc.yaml
$ kubectl apply -f ../../manifests/3-rook-ceph-pvc/tests/test-pod.yaml

# PVC の状態確認
$ kubectl get pvc
$ kubectl get pod test-pod
```

## 🧹 クリーンアップ手順

Rook Ceph を削除する場合：

```bash
# クリーンアップスクリプトを実行
$ ./cleanup-rook-ceph.sh
```

スクリプトは以下を確認してから削除を実行します：
1. 削除の最終確認
2. Rook Ceph を使用している PVC の一覧表示と削除確認
3. すべてのリソースの削除

### Proxmox での Pool 削除（オプション）

Kubernetes からのクリーンアップ後、Proxmox 側でも Pool を削除する場合：

```bash
# Proxmox ホストで実行
$ pveceph pool destroy k8s-pv-pool
```

## 📝 注意事項

### セキュリティ
- `env.sh` ファイルには Ceph クラスターへのアクセスキーが含まれています
- このファイルは厳重に管理し、バージョン管理システムにコミットしないでください
- 使用後は削除することを推奨します

### バックアップ
- クリーンアップを実行する前に、必ず重要なデータのバックアップを取得してください
- PVC に保存されているデータは完全に削除されます

### トラブルシューティング

#### Pool が作成できない
```bash
# Ceph の状態を確認
$ pveceph status

# OSD の状態を確認
$ ceph osd status
```

#### ストレージクラスが作成されない
```bash
# rook-ceph-external namespace の Pod を確認
$ kubectl get pods -n rook-ceph-external

# ログを確認
$ kubectl logs -n rook-ceph-external -l app=rook-ceph-operator
```

#### PVC が Pending 状態のまま
```bash
# PVC の詳細を確認
$ kubectl describe pvc <pvc-name>

# StorageClass の確認
$ kubectl get storageclass ceph-rbd -o yaml

# CSI Driver の確認
$ kubectl get csidrivers
```

## 🔗 参考資料

- [Rook Ceph 公式ドキュメント](https://rook.io/docs/rook/latest/CRDs/Cluster/ceph-cluster-crd/)
- [Proxmox × k0s × CephFS で構築するKubernetesストレージ基盤](https://zenn.dev/aobaiwaki/articles/28ad58a3acaf24)
- [kubernetesからProxmoxのCephを使う](https://www.tunamaguro.dev/articles/20240318-kubernetes%E3%81%8B%E3%82%89Proxmox%E3%81%AECeph%E3%82%92%E4%BD%BF%E3%81%86/)

## 📄 ライセンス

このプロジェクトと同じライセンスが適用されます。

## 🤝 コントリビューション

バグ報告や機能要望は Issue でお願いします。
