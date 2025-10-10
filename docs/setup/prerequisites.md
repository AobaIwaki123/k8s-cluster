---
layout: default
title: 前準備
---

# 前準備

Kubernetesクラスターを構築する前に、必要なツールをインストールします。

## asdfのインストール

asdfは複数のバージョン管理ツールを統合的に管理できるツールです。

### 1. asdfをダウンロード・インストール

```bash
wget https://github.com/asdf-vm/asdf/releases/download/v0.16.6/asdf-v0.16.6-linux-amd64.tar.gz
tar -xzvf asdf-v0.16.6-linux-amd64.tar.gz 
sudo install asdf /usr/bin
```

### 2. パスを通す

以下を`.bashrc`や`.zshrc`に追記してください。

```bash
export PATH=$PATH:$HOME/.asdf/shims
```

設定を反映させるために、シェルを再起動するか以下のコマンドを実行します。

```bash
source ~/.bashrc  # または source ~/.zshrc
```

## 必要なツールのインストール

### プラグインの追加とインストール

以下のツールをasdfを使ってインストールします。

```bash
# k0sctl (Kubernetes クラスター管理ツール)
asdf plugin add k0sctl
asdf install k0sctl 0.23.0
asdf global k0sctl 0.23.0

# k9s (Kubernetes CLI UI)
asdf plugin add k9s
asdf install k9s 0.40.10
asdf global k9s 0.40.10

# helm (Kubernetes パッケージマネージャー)
asdf plugin add helm
asdf install helm 3.17.2
asdf global helm 3.17.2

# kubectl (Kubernetes CLI)
asdf plugin add kubectl
asdf install kubectl 1.32.3
asdf global kubectl 1.32.3

# argocd (GitOps ツール)
asdf plugin add argocd
asdf install argocd 2.14.7
asdf global argocd 2.14.7
```

### インストールの確認

各ツールが正しくインストールされているか確認します。

```bash
k0sctl version
k9s version
helm version
kubectl version --client
argocd version --client
```

## SSH設定の確認

各ノードにSSH接続できることを確認します。

```bash
# SSH鍵の確認
ssh-add -l

# ノードへの接続テスト
ssh <ユーザー名>@<ノードのIPアドレス>
```

## 注意事項

### asdfプラグインについて

asdfプラグインの使用の責任はユーザーにあり、サービス開発者はasdf-core以外についてSecurity Policyを保証しないと以下のように明記されています。使用する際は自己責任でお願いします。

> This security policy only applies to asdf core, which is the code contained in this repository. All plugins are the responsibility of their creators and are not covered under this security policy.
> 
> https://github.com/asdf-vm/asdf/security

## 次のステップ

前準備が完了したら、[クラスター構築](cluster-installation.html)に進んでください。

