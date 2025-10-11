---
layout: home
title: Home
---

<style>
.hero {
  text-align: center;
  padding: 3rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 1rem;
  margin-bottom: 3rem;
  box-shadow: var(--shadow-xl);
}

.hero h1 {
  color: white;
  border: none;
  margin: 0 0 1rem 0;
  padding: 0;
  font-size: 2.5rem;
}

.hero p {
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.25rem;
  max-width: 600px;
  margin: 0 auto;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
}

.feature-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary-color);
}

.feature-card h3 {
  margin-top: 0;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.feature-card h3 i {
  font-size: 1.5rem;
}

.feature-card p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.feature-image {
  width: 100%;
  border-radius: 0.5rem;
  margin: 1rem 0;
  box-shadow: var(--shadow-md);
}

.quick-start {
  background: var(--bg-tertiary);
  border-left: 4px solid var(--primary-color);
  padding: 2rem;
  border-radius: 0.5rem;
  margin: 3rem 0;
}

.quick-start h2 {
  margin-top: 0;
  border: none;
  padding: 0;
}

.quick-start ol {
  margin-bottom: 0;
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.component-link {
  display: block;
  padding: 1.5rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  text-decoration: none;
  transition: all var(--transition-base);
  color: var(--text-primary);
}

.component-link:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.component-link strong {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}

.component-link span {
  color: var(--text-secondary);
  font-size: 0.9375rem;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--primary-color);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-left: 0.5rem;
}

.badge.optional {
  background: var(--text-light);
}
</style>

<div class="hero">
  <h1>🚀 k8s Cluster on Proxmox</h1>
  <p>k0s、ArgoCD、および各種クラウドネイティブツールを使用した<br>Kubernetesクラスター構築ガイド</p>
</div>

## 🎯 このドキュメントでできること

<div class="features">
  <div class="feature-card">
    <h3><i class="fas fa-sync-alt"></i> GitOps 管理</h3>
    <p>ArgoCDを用いたアプリケーションの宣言的な管理とデプロイの自動化</p>
    <img src="assets/images/argocd.png" alt="ArgoCD" class="feature-image">
  </div>
  
  <div class="feature-card">
    <h3><i class="fas fa-globe"></i> サービス公開</h3>
    <p>Cloudflare Ingress Controllerによる安全なサービス公開</p>
    <ul>
      <li>argocd.example.com</li>
      <li>harbor.example.com</li>
    </ul>
  </div>
  
  <div class="feature-card">
    <h3><i class="fas fa-database"></i> 永続ストレージ</h3>
    <p>Rook Cephを用いた高可用性永続ストレージの構築</p>
  </div>
  
  <div class="feature-card">
    <h3><i class="fas fa-box"></i> プライベートRegistry</h3>
    <p>Harborによるコンテナイメージの安全な管理</p>
    <img src="assets/images/harbor.png" alt="Harbor" class="feature-image">
  </div>
</div>

<div class="quick-start">
  <h2>🏁 クイックスタート</h2>
  <ol>
    <li><a href="setup/prerequisites.html">前準備</a> - 必要なツールのインストール</li>
    <li><a href="setup/cluster-installation.html">クラスター構築</a> - k0sクラスターのセットアップ</li>
  </ol>
</div>

## 📦 コアコンポーネント

<div class="component-grid">
  <a href="components/argocd.html" class="component-link">
    <strong><i class="fas fa-sync-alt"></i> ArgoCD</strong>
    <span>GitOps ツール</span>
  </a>
  
  <a href="components/cloudflare-ingress.html" class="component-link">
    <strong><i class="fas fa-cloud"></i> Cloudflare Ingress</strong>
    <span>SSL 対応 Ingress Controller</span>
  </a>
  
  <a href="components/rook-ceph.html" class="component-link">
    <strong><i class="fas fa-database"></i> Rook Ceph</strong>
    <span>永続ストレージ</span>
  </a>
  
  <a href="components/cert-manager.html" class="component-link">
    <strong><i class="fas fa-certificate"></i> Cert Manager</strong>
    <span>証明書管理</span>
  </a>
  
  <a href="components/harbor.html" class="component-link">
    <strong><i class="fas fa-anchor"></i> Harbor</strong>
    <span>プライベートコンテナレジストリ</span>
  </a>
</div>

## 🔧 バージョン情報

| ツール | バージョン |
|--------|-----------|
| asdf | v0.16.6 |
| k0sctl | v0.23.0 |
| k9s | v0.40.10 |
| helm | 3.17.2 |
| kubectl | 1.32.3 |
| argocd | 2.14.7 |

## 🚀 発展

以下のリポジトリとProxmoxを組み合わせることで、VMの作成・削除、構成の自動化が可能になり、自宅に簡易的なクラウド基盤を構築できます。

- [Terraform for Proxmox](https://github.com/AobaIwaki123/Proxmox-Terraform) - インフラのコード化
- [Ansible](https://github.com/AobaIwaki123/ansible) - 構成管理の自動化

## 📁 リポジトリ構造

```
k8s-cluster/
├── manifests/         # Kubernetes マニフェストと設定
├── docs/              # このドキュメント (GitHub Pages)
├── k0s/               # k0s クラスター設定
└── README.md          # プロジェクト概要
```

