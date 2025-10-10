---
layout: default
title: Home
---

# k8s Cluster on Proxmox 構築手順

## このドキュメントでできること

### 1. ArgoCDを用いたアプリケーションの管理

![ArgoCD](assets/images/argocd.png)

### 2. Cloudflare Ingress Controllerを用いたサービスの公開

- argocd: https://argocd.example.com
- harbor: https://harbor.example.com

### 3. Rook Cephを用いた永続ストレージの構築

### 4. Harborを用いたプライベートDocker Registryの構築

![Harbor](assets/images/harbor.png)

## はじめに

1. [前準備](setup/prerequisites.html) - 必要なツールのインストール
2. [クラスター構築](setup/cluster-installation.html) - k0sクラスターのセットアップ

## コンポーネント

- [ArgoCD](components/argocd.html) - GitOps ツール
- [Cloudflare Ingress Controller](components/cloudflare-ingress.html) - SSL 対応 Ingress
- [Rook Ceph](components/rook-ceph.html) - 永続ストレージ
- [Cert Manager](components/cert-manager.html) - 証明書管理
- [Harbor](components/harbor.html) - プライベートコンテナレジストリ
- [Firebolt Core](components/firebolt-core.html) - Firebolt データベース (オプション)
- [MinIO](components/minio.html) - オブジェクトストレージ (オプション)
- [Nginx Ingress](components/nginx-ingress.html) - Nginx Ingress Controller (オプション)

## バージョン情報

- asdf: v0.16.6
- k0sctl: v0.23.0
- k9s: v0.40.10
- helm: 3.17.2
- kubectl: 1.32.3
- argocd: 2.14.7

## 発展

以下のリポジトリとProxmoxを組み合わせることで、VMの作成・削除、構成の自動化が可能になり、自宅に簡易的なクラウド基盤を構築できます。

- [Terraform for Proxmox](https://github.com/AobaIwaki123/Proxmox-Terraform)
- [Ansible](https://github.com/AobaIwaki123/ansible)

## リポジトリ構造

```
k8s-cluster/
├── manifests/         # Kubernetes マニフェストと設定
├── docs/              # このドキュメント (GitHub Pages)
├── k0s/               # k0s クラスター設定
└── README.md          # プロジェクト概要
```

