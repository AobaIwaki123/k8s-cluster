---
layout: default
title: クラスター構築
---

# k0s Kubernetes クラスター構築

k0sを使用してKubernetesクラスターを構築します。

## k0sとは

k0sは、軽量でセキュアなKubernetesディストリビューションです。

- **シングルバイナリ**: 依存関係が少なく、インストールが簡単
- **軽量**: 必要最小限のリソースで動作
- **セキュア**: デフォルトでセキュアな設定
- **柔軟性**: 様々な環境に対応可能

## クラスター構成

現在の構成例:
- **コントローラーノード**: 1台 (192.168.11.221)
- **ワーカーノード**: 4台 (192.168.11.214, 192.168.11.220, 192.168.11.231, 192.168.11.234)

## 前提条件

- k0sctlがインストールされていること ([前準備](prerequisites.html)参照)
- 各ノードへSSH接続が可能であること
- 各ノードで必要なポートが開放されていること
  - 6443 (Kubernetes API Server)
  - 8080 (k0s API)
  - 9443 (k0s Controller Join API)
  - 2380 (etcd peer)
  - その他CNI関連のポート

## クラスターのセットアップ

### 1. k0sctl設定ファイルの作成

プロジェクトには既に `k0s/k0sctl.yml` が含まれていますが、新規に作成する場合は以下のコマンドを使用します。

```bash
cd k0s
k0sctl init > k0sctl.yml
```

設定ファイルを環境に合わせて編集します。主な設定項目：

- ホスト情報（IPアドレス、SSHユーザー、SSHキー）
- コントローラーとワーカーの役割
- ネットワーク設定（CNIプラグイン）
- ストレージ設定

### 2. クラスターの構築

Makefileを使用する場合（推奨）：

```bash
cd k0s
make apply
```

直接k0sctlを使用する場合：

```bash
cd k0s
k0sctl apply --config k0sctl.yml
```

### 3. kubeconfigの取得

Makefileを使用する場合：

```bash
make config
```

直接k0sctlを使用する場合：

```bash
k0sctl kubeconfig --config k0sctl.yml > ~/.kube/config
```

### 4. クラスターの確認

```bash
# ノードの状態確認
kubectl get nodes

# Podの状態確認
kubectl get pods -A

# クラスター情報の確認
kubectl cluster-info
```

## Makefileコマンド一覧

プロジェクトには便利なMakefileが含まれています。

```bash
# クラスターのセットアップ
make apply

# kubeconfigの取得・設定
make config

# クラスターのリセット（全削除）
make reset

# 利用可能なコマンドを確認
make help
```

## トラブルシューティング

### SSH接続エラー

```bash
# SSH接続の確認
ssh <ユーザー名>@<ノードのIPアドレス>

# SSH鍵の設定確認
ssh-add -l

# SSH設定ファイルの確認
cat ~/k8s-cluster/ssh_config
```

### クラスター構築に失敗する場合

1. **時刻同期の確認**: 各ノードの時刻が同期されているか確認
2. **ファイアウォール設定**: 必要なポートが開放されているか確認
3. **k0sctlバージョン**: 最新版を使用しているか確認
4. **リソース**: 各ノードに十分なリソース（CPU、メモリ、ディスク）があるか確認

### kubeconfigが正しく設定されない場合

```bash
# 現在のコンテキストを確認
kubectl config current-context

# kubeconfigの再取得
cd k0s
make config

# kubeconfigファイルの確認
cat ~/.kube/config
```

### ノードがReadyにならない場合

```bash
# ノードの詳細情報を確認
kubectl describe node <ノード名>

# Podの状態を確認
kubectl get pods -A

# ノードのログを確認（ノードにSSH接続して）
sudo k0s status
sudo journalctl -u k0s* -f
```

## 次のステップ

クラスターの構築が完了したら、各コンポーネントをセットアップします。

1. [ArgoCD](../components/argocd.html) - GitOps ツールのセットアップ
2. [Cloudflare Ingress Controller](../components/cloudflare-ingress.html) - Ingressのセットアップ
3. その他のコンポーネント

## 参考リンク

- [k0s公式ドキュメント](https://docs.k0sproject.io/)
- [k0sctl公式ドキュメント](https://github.com/k0sproject/k0sctl)
- [Kubernetes公式ドキュメント](https://kubernetes.io/ja/docs/)

