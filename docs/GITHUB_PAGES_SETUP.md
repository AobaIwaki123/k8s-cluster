---
layout: default
title: GitHub Pages Setup
---

# GitHub Pages のセットアップ手順

このドキュメントでは、このリポジトリを GitHub Pages で公開する手順を説明します。

## 前提条件

- GitHub アカウント
- このリポジトリが GitHub にプッシュされていること

## セットアップ手順

### 1. リポジトリの変更をコミット＆プッシュ

ローカルでの変更をコミットし、GitHub にプッシュします。

```bash
cd /path/to/k8s-cluster

# 変更状態を確認
git status

# 変更をステージング
git add .

# コミット
git commit -m "docs: GitHub Pages用にドキュメント構造を再編成"

# プッシュ
git push origin main
```

### 2. GitHub Pages の有効化

1. GitHub でリポジトリを開く
2. Settings → Pages に移動
3. **Source** セクションで以下を設定：
   - Branch: `main`
   - Folder: `/docs`
4. Save をクリック

### 3. GitHub Pages URL の確認

設定後、数分待つとサイトが公開されます。

- URL: `https://<ユーザー名>.github.io/<リポジトリ名>/`
- 例: `https://aobaiwaki123.github.io/k8s-cluster/`

### 4. _config.yml の更新（必要に応じて）

リポジトリ名がサブパスになる場合、`docs/_config.yml` を更新します。

```yaml
baseurl: "/k8s-cluster"  # リポジトリ名
url: "https://aobaiwaki123.github.io"  # GitHub Pages のベースURL
```

変更後、再度コミット＆プッシュします。

```bash
git add docs/_config.yml
git commit -m "docs: baseurl を設定"
git push origin main
```

## カスタムドメインの設定（オプション）

独自ドメインを使用する場合：

### 1. DNS の設定

お使いのドメインプロバイダーで以下のDNSレコードを設定します。

#### Apex ドメイン（example.com）の場合

```
A レコード:
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

#### サブドメイン（docs.example.com）の場合

```
CNAME レコード:
<ユーザー名>.github.io
```

### 2. GitHub での設定

1. Settings → Pages
2. Custom domain に独自ドメインを入力（例: `docs.example.com`）
3. "Enforce HTTPS" にチェック
4. Save

### 3. CNAME ファイルの作成

`docs/CNAME` ファイルを作成します。

```bash
echo "docs.example.com" > docs/CNAME
git add docs/CNAME
git commit -m "docs: カスタムドメインを設定"
git push origin main
```

## カスタムテーマについて

このドキュメントサイトは、モダンなテックブログ風のカスタムテーマを使用しています。

### 主な機能

✨ **デザイン機能:**
- 📱 レスポンシブデザイン（モバイル対応）
- 🌙 ダークモード対応（トグル切り替え）
- 💅 美しいシンタックスハイライト
- 📖 サイドバーナビゲーション
- 📋 自動目次生成
- ⚡ スムーズなアニメーション
- 📝 コピーボタン付きコードブロック

### カスタマイズ方法

#### カラーテーマの変更

`docs/assets/css/style.scss` の CSS変数を編集することで、カラーテーマをカスタマイズできます：

```scss
:root {
  --color-primary: #0066ff;        // メインカラー
  --color-bg: #ffffff;             // 背景色
  --color-text: #1a1a1a;           // テキスト色
  // ... その他の変数
}
```

#### レイアウトの変更

カスタムレイアウトは `docs/_layouts/default.html` で定義されています。必要に応じて編集可能です。

#### JavaScriptの追加機能

追加のインタラクティブ機能は `docs/assets/js/main.js` で実装できます。

## トラブルシューティング

### サイトが表示されない

- GitHub Pages の設定が正しいか確認
- ブランチとフォルダが正しく指定されているか確認
- 数分待ってから再度アクセス

### スタイルが適用されない

- `_config.yml` の `baseurl` と `url` が正しいか確認
- ブラウザのキャッシュをクリア
- GitHub Pages のビルドログを確認（Settings → Pages）

### 画像が表示されない

- 画像のパスが正しいか確認
- 相対パスを使用している場合は絶対パスに変更を検討

```markdown
<!-- 相対パス -->
![Image](../assets/images/image.png)

<!-- 絶対パス -->
![Image](/k8s-cluster/assets/images/image.png)
```

### ビルドエラー

GitHub の Actions タブでビルドログを確認します。

1. リポジトリ → Actions
2. pages-build-deployment ワークフローを確認
3. エラーメッセージを確認

## ローカルでのプレビュー

GitHub Pages にプッシュする前に、ローカルでプレビューできます。

### 前提条件

- Ruby 2.7以上がインストールされていること
- Bundler がインストールされていること

### Jekyll のインストール

```bash
# Ruby のインストール（Macの場合）
brew install ruby

# Ruby のインストール（Ubuntuの場合）
sudo apt-get install ruby-full build-essential zlib1g-dev

# Bundler のインストール
gem install bundler
```

### ローカルサーバーの起動

```bash
cd docs

# 依存関係のインストール（初回のみ）
bundle install

# サーバーの起動
bundle exec jekyll serve --livereload

# ブラウザで http://localhost:4000 にアクセス
```

`--livereload` オプションを使用すると、ファイルを編集した際に自動的にブラウザがリロードされます。

### よく使うコマンド

```bash
# 開発サーバーの起動（ライブリロード付き）
bundle exec jekyll serve --livereload

# 静的ファイルのビルドのみ
bundle exec jekyll build

# ドラフトも含めてビルド
bundle exec jekyll serve --drafts

# ポート番号を変更
bundle exec jekyll serve --port 4001
```

## ディレクトリ構造

最終的なディレクトリ構造：

```
k8s-cluster/
├── docs/                         # GitHub Pages ドキュメント
│   ├── _config.yml              # Jekyll 設定
│   ├── _layouts/                # カスタムレイアウト
│   │   └── default.html         # メインレイアウト
│   ├── assets/                  # アセット
│   │   ├── css/                 # スタイルシート
│   │   │   └── style.scss       # メインスタイル（SCSS）
│   │   ├── js/                  # JavaScript
│   │   │   └── main.js          # メインスクリプト
│   │   └── images/              # 画像ファイル
│   │       ├── argocd.png
│   │       └── harbor.png
│   ├── index.md                 # トップページ
│   ├── setup/                   # セットアップガイド
│   │   ├── prerequisites.md     # 前準備
│   │   └── cluster-installation.md  # クラスター構築
│   ├── components/              # コンポーネントドキュメント
│   │   ├── argocd.md
│   │   ├── cloudflare-ingress.md
│   │   ├── rook-ceph.md
│   │   ├── cert-manager.md
│   │   ├── harbor.md
│   │   ├── firebolt-core.md
│   │   ├── minio.md
│   │   └── nginx-ingress.md
│   ├── Gemfile                  # Ruby 依存関係
│   └── GITHUB_PAGES_SETUP.md    # このファイル
├── manifests/                   # Kubernetes マニフェスト
├── k0s/                         # k0s クラスター設定
└── README.md                    # プロジェクト概要
```

## 参考リンク

- [GitHub Pages 公式ドキュメント](https://docs.github.com/ja/pages)
- [Jekyll 公式ドキュメント](https://jekyllrb.com/docs/)
- [GitHub Pages でサポートされているテーマ](https://pages.github.com/themes/)
- [Jekyll テーマ一覧](http://jekyllthemes.org/)

