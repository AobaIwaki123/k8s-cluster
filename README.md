# k8s Cluster on Proxmox

k0s、ArgoCD、および各種クラウドネイティブツールを使用した Kubernetes クラスターセットアップ

## 📚 ドキュメント

詳細なドキュメントは [GitHub Pages](https://aobaiwaki123.github.io/k8s-cluster/) で公開されています。

または、`docs/` ディレクトリ内のマークダウンファイルを直接参照してください。

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

- [Versions](#versions)
- [0. 前準備](#0-前準備)
  - [1. asdfをインストール](#1-asdfをインストール)
  - [2. asdf pluginの追加](#2-asdf-pluginの追加)
- [k0sctlでk8sクラスターを構築](#k0sctlでk8sクラスターを構築)
- [1. ArgoCDのセットアップ](#1-argocdのセットアップ)
- [2. Cloudflare Ingress Controllerのセットアップ](#2-cloudflare-ingress-controllerのセットアップ)
- [1'. ArgoCDの本セットアップ](#1-argocdの本セットアップ)
- [3. Rook Cephを用いたPVCの構築](#3-rook-cephを用いたpvcの構築)
- [4. Cert Managerのセットアップ](#4-cert-managerのセットアップ)
- [5. Harborのセットアップ](#5-harborのセットアップ)
- [Minioのセットアップ (任意)](#minioのセットアップ-任意)
- [Nginx Ingress Controllerのセットアップ (任意)](#nginx-ingress-controllerのセットアップ-任意)
- [参考](#参考)

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

### 必須コンポーネント

1. **ArgoCD** - [手順](manifests/1-argocd/README.md) | [詳細ドキュメント](docs/components/argocd.md)
2. **Cloudflare Ingress Controller** - [手順](manifests/2-cloudflare-ingress-controller/README.md) | [詳細ドキュメント](docs/components/cloudflare-ingress.md)
3. **Rook Ceph** - [手順](manifests/3-rook-ceph-pvc/README.md) | [詳細ドキュメント](docs/components/rook-ceph.md)
4. **Cert Manager** - [手順](manifests/4-cert-manager/README.md) | [詳細ドキュメント](docs/components/cert-manager.md)
5. **Harbor** - [手順](manifests/5-harbor/README.md) | [詳細ドキュメント](docs/components/harbor.md)

### オプションコンポーネント

- **Firebolt Core** - [手順](manifests/firebolt-core/README.md) | [詳細ドキュメント](docs/components/firebolt-core.md)
- **MinIO** - [手順](manifests/minio/README.md) | [詳細ドキュメント](docs/components/minio.md)
- **Nginx Ingress** - [手順](manifests/nginx/README.md) | [詳細ドキュメント](docs/components/nginx-ingress.md)
