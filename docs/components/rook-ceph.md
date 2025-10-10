---
layout: default
title: Rook Ceph
---

# Rook Ceph を用いた永続ストレージの構築

Rook Cephは、Kubernetes上でCephストレージクラスターを管理するためのオペレーターです。Proxmox上の既存のCephクラスターを利用する構成を説明します。

## 概要

このセットアップでは、Proxmoxで構築済みのCephクラスターを、Kubernetes（k0s）から外部ストレージとして利用します。

## 前提条件

- Proxmox Ceph クラスターが構築済みであること
- ArgoCD がセットアップ済みであること
- Proxmox ホストへのアクセス権限

## セットアップ手順

### 1. Rook Ceph Operator のデプロイ

ArgoCD を使用して Rook Ceph Operator をデプロイします。

```bash
argocd app create --file ../../manifests/3-rook-ceph-pvc/argocd/rook-ceph.yaml
```

### 2. Proxmox で Pool を作成

KubernetesのPersistent Volumeを保存するためのプールを作成します。

#### 方法1: Proxmox GUI で作成

1. PVE Node → Ceph → Pool → Create
2. Pool name: `k8s-pv-pool`

#### 方法2: Proxmox CLI で作成

```bash
pveceph pool create k8s-pv-pool --pg_autoscale_mode on
```

### 3. 外部クラスター接続用の認証情報を取得

以下のコマンドを **Proxmox ホスト上**で実行します。

```bash
# スクリプトのダウンロード
wget https://raw.githubusercontent.com/rook/rook/release-1.16/deploy/examples/create-external-cluster-resources.py

# 認証情報の生成
python3 create-external-cluster-resources.py \
  --namespace rook-ceph-external \
  --rbd-data-pool-name k8s-pv-pool \
  --format bash \
  --skip-monitoring-endpoint \
  --v2-port-enable

# 出力された環境変数をコピーして保存
```

### 4. Kubernetes に認証情報をインポート

次に、**kubectl が使用できるホスト上**で以下を実行します。

```bash
# 前の手順で取得した環境変数を env.sh に保存
vim env.sh  # 環境変数を貼り付け

# 環境変数を読み込み
source ./env.sh

# インポートスクリプトのダウンロード
wget https://raw.githubusercontent.com/rook/rook/release-1.16/deploy/examples/import-external-cluster.sh

# Kubernetes にインポート
bash import-external-cluster.sh
```

### 5. Storage Class をデフォルトに設定

```bash
kubectl patch storageclass ceph-rbd \
  -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

### 6. 外部 Ceph クラスター接続リソースのデプロイ

```bash
argocd app create --file ../../manifests/3-rook-ceph-pvc/argocd/rook-ceph-external-cluster.yaml
```

## 動作確認

### テスト用 PVC と Pod の作成

```bash
# テスト用 PVC を作成
kubectl apply -f ../../manifests/3-rook-ceph-pvc/tests/test-pvc.yaml

# PVC の状態を確認
kubectl get pvc

# テスト用 Pod を作成
kubectl apply -f ../../manifests/3-rook-ceph-pvc/tests/test-pod.yaml

# Pod の状態を確認
kubectl get pod test-pod

# ストレージのマウント確認
kubectl exec test-pod -- df -h
```

### Storage Class の確認

```bash
kubectl get storageclass
```

`ceph-rbd` が default として表示されていれば成功です。

## トラブルシューティング

### PVC が Pending 状態のまま

```bash
# PVC の詳細を確認
kubectl describe pvc <pvc-name>

# Rook Ceph Operator のログを確認
kubectl logs -n rook-ceph deployment/rook-ceph-operator

# CSI provisioner のログを確認
kubectl logs -n rook-ceph deployment/csi-rbdplugin-provisioner
```

### Ceph クラスターへの接続エラー

- Proxmox Ceph クラスターが正常に動作しているか確認
- ネットワーク接続を確認（Kubernetes ノードから Ceph モニターへ到達可能か）
- 認証情報が正しくインポートされているか確認

```bash
# Secret の確認
kubectl get secrets -n rook-ceph-external
```

## 注意事項

> **重要**: この構成では Proxmox の Ceph クラスターを外部ストレージとして利用しています。将来的には Rook で Ceph クラスター全体を管理する構成への移行を検討することを推奨します。

## 参考リンク

- [Rook 公式ドキュメント](https://rook.io/docs/rook/latest/)
- [Proxmox × k0s × CephFS で構築するKubernetesストレージ基盤](https://zenn.dev/aobaiwaki/articles/28ad58a3acaf24)
- [kubernetesからProxmoxのCephを使う](https://www.tunamaguro.dev/articles/20240318-kubernetes%E3%81%8B%E3%82%89Proxmox%E3%81%AECeph%E3%82%92%E4%BD%BF%E3%81%86/)

