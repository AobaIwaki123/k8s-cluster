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

## Jekyll テーマのカスタマイズ

### テーマの変更

`docs/_config.yml` で別のテーマを指定できます。

```yaml
# GitHub Pages でサポートされているテーマ
theme: jekyll-theme-cayman
# theme: jekyll-theme-minimal
# theme: jekyll-theme-slate
# theme: jekyll-theme-architect

# または外部テーマを使用
# remote_theme: just-the-docs/just-the-docs
# remote_theme: pmarsceill/just-the-docs
```

### レイアウトのカスタマイズ

`docs/_layouts/` ディレクトリを作成してカスタムレイアウトを追加できます。

```bash
mkdir -p docs/_layouts
```

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

### Jekyll のインストール

```bash
# Ruby のインストール（Macの場合）
brew install ruby

# Jekyll と bundler のインストール
gem install jekyll bundler
```

### Gemfile の作成

`docs/Gemfile` を作成：

```ruby
source "https://rubygems.org"

gem "github-pages", group: :jekyll_plugins
gem "webrick"
```

### ローカルサーバーの起動

```bash
cd docs

# 初回のみ
bundle install

# サーバーの起動
bundle exec jekyll serve

# ブラウザで http://localhost:4000 にアクセス
```

## ディレクトリ構造

最終的なディレクトリ構造：

```
k8s-cluster/
├── docs/                      # GitHub Pages ドキュメント
│   ├── _config.yml           # Jekyll 設定
│   ├── index.md              # トップページ
│   ├── setup/                # セットアップガイド
│   ├── components/           # コンポーネントドキュメント
│   └── assets/               # アセット（画像など）
├── manifests/                # Kubernetes マニフェスト
├── k0s/                      # k0s クラスター設定
└── README.md                 # プロジェクト概要
```

## 参考リンク

- [GitHub Pages 公式ドキュメント](https://docs.github.com/ja/pages)
- [Jekyll 公式ドキュメント](https://jekyllrb.com/docs/)
- [GitHub Pages でサポートされているテーマ](https://pages.github.com/themes/)
- [Jekyll テーマ一覧](http://jekyllthemes.org/)

