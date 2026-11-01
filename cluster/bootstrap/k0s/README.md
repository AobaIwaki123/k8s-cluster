# k0s Kubernetes Cluster

k0sを使用したKubernetesクラスターの構築・管理を行うためのドキュメントです。

## k0sとは

k0sは、軽量でセキュアなKubernetesディストリビューションです。  
- シングルバイナリ
- 依存関係が少ない
- 高いセキュリティ
- 簡単なセットアップ

## クラスター構成

現在の構成:
- **コントローラーノード**: 1台 (192.168.11.221)
- **ワーカーノード**: 4台 (192.168.11.214, 192.168.11.220, 192.168.11.231, 192.168.11.234)

## 前提条件

- k0sctlがインストールされていること
- 各ノードへSSH接続が可能であること
- 各ノードで必要なポートが開放されていること (6443, 8080, 9443等)

## 使用方法

### クラスターのセットアップ

```sh
# クラスターを構築
$ make apply

# kubeconfigを取得・設定
$ make config

# クラスターの状態確認
$ kubectl get nodes
```

### クラスターの削除

```sh
# クラスターをリセット
$ make reset
```

### その他の操作

```sh
# 利用可能なMakeコマンドを確認
$ make help

# 直接k0sctlを使用する場合
$ k0sctl apply --config k0sctl.yml
$ k0sctl kubeconfig > ~/.kube/config
$ k0sctl reset --config k0sctl.yml
```

## トラブルシューティング

### SSH接続エラー

```sh
# SSH接続の確認
$ ssh aoba@192.168.11.221

# SSH鍵の設定確認
$ ssh-add -l
```

### クラスター構築に失敗する場合

1. 各ノードの時刻同期を確認
2. ファイアウォール設定を確認
3. k0sctlのバージョンを確認

### kubeconfigが正しく設定されない場合

```sh
# kubeconfigの確認
$ kubectl config current-context

# kubeconfigの再取得
$ make config
```

## 参考リンク

- [k0s公式ドキュメント](https://docs.k0sproject.io/)
- [k0sctl公式ドキュメント](https://github.com/k0sproject/k0sctl)

