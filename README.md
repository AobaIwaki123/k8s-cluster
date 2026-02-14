# k8s Cluster on Proxmox

k0s、ArgoCD、および各種クラウドネイティブツールを使用した Kubernetes クラスターセットアップ

## 📚 ドキュメント

詳細なドキュメントは [GitHub Pages](https://aobaiwaki123.github.io/k8s-cluster/) で公開されています。

または、`docs/` ディレクトリ内のマークダウンファイルを直接参照してください。

### 📱 モバイルでのドキュメント閲覧

モバイルデバイスでドキュメントを閲覧する場合のサイドバー操作方法：

- **サイドバーを開く**: 画面右上のメニューアイコン (☰) をタップ
- **サイドバーを閉じる**: 以下のいずれかの方法で閉じることができます
  - サイドバー内の右上の「×」ボタンをタップ
  - サイドバーの外側（グレーのオーバーレイ部分）をタップ
  - サイドバー内のリンクをタップしてページ移動
  - キーボードの ESC キーを押す（対応デバイスのみ）

## 主な機能

### 1. ArgoCDを用いたアプリケーションの管理

![ArgoCD](docs/assets/images/argocd.png)

### 2. Cloudflare Ingress Controllerを用いたサービスの公開

- argocd: https://argocd.example.com
- harbor: https://harbor.example.com

### 3. Rook Cephを用いた永続ストレージの構築

### 4. Harborを用いたプライベートDocker Registryの構築

![Harbor](docs/assets/images/harbor.png)

## 発展

以下のリポジトリとProxmoxを組み合わせることで、VMの作成・削除、構成の自動化が可能になり、自宅に簡易的なクラウド基盤を構築できます。

- [Terraform for Proxmox](https://github.com/AobaIwaki123/Proxmox-Terraform)
- [Ansible](https://github.com/AobaIwaki123/ansible)

## 目次

- [k8s Cluster on Proxmox](#k8s-cluster-on-proxmox)
  - [📚 ドキュメント](#-ドキュメント)
    - [📱 モバイルでのドキュメント閲覧](#-モバイルでのドキュメント閲覧)
  - [主な機能](#主な機能)
    - [1. ArgoCDを用いたアプリケーションの管理](#1-argocdを用いたアプリケーションの管理)
    - [2. Cloudflare Ingress Controllerを用いたサービスの公開](#2-cloudflare-ingress-controllerを用いたサービスの公開)
    - [3. Rook Cephを用いた永続ストレージの構築](#3-rook-cephを用いた永続ストレージの構築)
    - [4. Harborを用いたプライベートDocker Registryの構築](#4-harborを用いたプライベートdocker-registryの構築)
  - [発展](#発展)
  - [目次](#目次)
  - [Versions](#versions)
  - [クイックスタート](#クイックスタート)
    - [0. 前準備](#0-前準備)
    - [k0sクラスターの構築](#k0sクラスターの構築)
  - [コンポーネントのセットアップ](#コンポーネントのセットアップ)

## Versions

- asdf: v0.16.6
- k0sctl: v0.23.0
- k9s: v0.40.10
- helm: 3.17.2
- kubectl: 1.32.3
- argocd: 2.14.7

## クイックスタート

### 0. 前準備

- [asdfのインストール](manifests/0-asdf/README.md)
- [必要なツールのインストール](manifests/0-asdf/README.md)

### k0sクラスターの構築

```bash
cd k0s
make apply
make config
```

詳細は [k0s/README.md](k0s/README.md) を参照

## コンポーネントのセットアップ

各コンポーネントの詳細なセットアップ手順は、以下のドキュメントを参照してください：

1. **ArgoCD** - [手順](manifests/1-argocd/README.md) | [詳細ドキュメント](docs/components/argocd.md)
2. **Cloudflare Ingress Controller** - [手順](manifests/2-cloudflare-ingress-controller/README.md) | [詳細ドキュメント](docs/components/cloudflare-ingress.md)
3. **Rook Ceph** - [手順](manifests/3-rook-ceph-pvc/README.md) | [詳細ドキュメント](docs/components/rook-ceph.md)
4. **Cert Manager** - [手順](manifests/4-cert-manager/README.md) | [詳細ドキュメント](docs/components/cert-manager.md)
5. **Harbor** - [手順](manifests/5-harbor/README.md) | [詳細ドキュメント](docs/components/harbor.md)
