# GitHub Pages デザインガイド

このドキュメントは、GitHub Pagesサイトのデザインとカスタマイズ方法について説明します。

## 📁 ファイル構造

```
docs/
├── _config.yml           # Jekyll設定ファイル
├── _layouts/             # カスタムレイアウト
│   ├── default.html     # 標準ページレイアウト
│   └── home.html        # ホームページ専用レイアウト
├── assets/              # 静的アセット
│   ├── css/
│   │   └── style.css    # メインスタイルシート
│   ├── js/
│   │   └── main.js      # JavaScriptファイル
│   └── images/          # 画像ファイル
├── components/          # コンポーネントページ
├── setup/              # セットアップガイド
└── index.md            # ホームページ
```

## 🎨 デザインシステム

### カラーパレット

- **Primary**: `#3b82f6` (ブルー)
- **Secondary**: `#8b5cf6` (パープル)
- **Accent**: `#06b6d4` (シアン)
- **Text Primary**: `#1f2937` (ダークグレー)
- **Text Secondary**: `#6b7280` (ミディアムグレー)

### タイポグラフィ

- **本文フォント**: Inter, Noto Sans JP, sans-serif
- **コードフォント**: JetBrains Mono, monospace

### スペーシング

- Header高さ: 64px
- Sidebar幅: 280px
- コンテンツ最大幅: 900px

## 🛠️ 利用可能なコンポーネント

### 1. アラートボックス

重要な情報を強調表示するために使用します。

```html
<div class="alert alert-info">
  <span class="alert-icon"><i class="fas fa-info-circle"></i></span>
  <div>情報メッセージ</div>
</div>

<div class="alert alert-warning">
  <span class="alert-icon"><i class="fas fa-exclamation-triangle"></i></span>
  <div>警告メッセージ</div>
</div>

<div class="alert alert-danger">
  <span class="alert-icon"><i class="fas fa-exclamation-circle"></i></span>
  <div>危険メッセージ</div>
</div>

<div class="alert alert-success">
  <span class="alert-icon"><i class="fas fa-check-circle"></i></span>
  <div>成功メッセージ</div>
</div>
```

**自動変換**: `> **重要:**` のようなblockquoteは自動的にアラートに変換されます。

### 2. カードグリッド

ホームページで使用されているカード形式のレイアウト。

```html
<div class="component-grid">
  <a href="link.html" class="component-link">
    <strong><i class="fas fa-icon"></i> タイトル</strong>
    <span>説明文</span>
  </a>
</div>
```

### 3. ステップガイド

手順を分かりやすく表示します。

```html
<div class="step-guide">
  <div class="step">
    <h3>ステップタイトル</h3>
    <p>説明文...</p>
  </div>
  
  <div class="step">
    <h3>次のステップ</h3>
    <p>説明文...</p>
  </div>
</div>
```

### 4. バッジ・ラベル

```html
<span class="badge">New</span>
<span class="badge optional">Optional</span>

<span class="label label-primary">Primary</span>
<span class="label label-success">Success</span>
<span class="label label-warning">Warning</span>
<span class="label label-danger">Danger</span>
```

### 5. フィーチャーカード

```html
<div class="features">
  <div class="feature-card">
    <h3><i class="fas fa-icon"></i> タイトル</h3>
    <p>説明文</p>
  </div>
</div>
```

## 📝 Markdownでの書き方

### ページフロントマター

各Markdownファイルの先頭に以下を追加：

```yaml
---
layout: default  # または home
title: ページタイトル
---
```

### 見出し

```markdown
# H1 - ページタイトル（1つのみ）
## H2 - セクション
### H3 - サブセクション
#### H4 - 小セクション
```

### コードブロック

````markdown
```bash
kubectl get pods
```

```yaml
apiVersion: v1
kind: Pod
```
````

コードブロックには自動的に：
- シンタックスハイライト
- コピーボタン
- 言語ラベル

が追加されます。

### リンク

```markdown
[リンクテキスト](url)
```

外部リンクには自動的に外部リンクアイコンが追加されます。

### 画像

```markdown
![代替テキスト](assets/images/image.png)
```

画像は自動的に：
- レスポンシブ対応
- 角丸
- シャドウ効果

が適用されます。

## 🎭 カスタムスタイルの追加

### インラインスタイル

特定のページでのみスタイルを追加したい場合：

```markdown
---
layout: default
title: ページタイトル
---

<style>
.custom-class {
  /* カスタムスタイル */
}
</style>

<!-- ページコンテンツ -->
```

### グローバルスタイル

全ページに適用する場合は `assets/css/style.css` を編集してください。

## 🚀 機能

### 実装済み機能

- ✅ レスポンシブデザイン
- ✅ モバイルメニュー
- ✅ シンタックスハイライト
- ✅ コードコピーボタン
- ✅ スムーススクロール
- ✅ スクロールトップボタン
- ✅ 目次の自動生成（h2, h3が3つ以上の場合）
- ✅ アクティブナビゲーションハイライト
- ✅ フェードインアニメーション
- ✅ パンくずナビゲーション

### 今後追加可能な機能

- ⬜ ダークモード
- ⬜ サイト内検索
- ⬜ ページネーション
- ⬜ タグ・カテゴリー機能

## 📱 レスポンシブブレークポイント

- **モバイル**: < 480px
- **タブレット**: 480px - 768px
- **デスクトップ**: 768px - 1024px
- **大画面**: > 1024px

サイドバーは1024px以下で自動的にハンバーガーメニューに切り替わります。

## 🔧 開発とテスト

### ローカルで確認

```bash
# Jekyllをインストール（初回のみ）
gem install bundler jekyll

# docsディレクトリに移動
cd docs

# ローカルサーバーを起動
jekyll serve

# ブラウザで http://localhost:4000 を開く
```

### GitHub Pagesでの公開

1. リポジトリの Settings → Pages
2. Source: `main` ブランチの `/docs` フォルダ
3. Save

数分後に自動的にデプロイされます。

## 💡 ベストプラクティス

### 1. パフォーマンス

- 画像は最適化してから使用（WebP推奨）
- 不要なCSSやJSは削除
- CDNを活用（Font Awesome、Highlight.jsなど）

### 2. アクセシビリティ

- 適切な見出し階層を使用
- altテキストを必ず記述
- コントラスト比を確保

### 3. SEO

- 各ページに適切な title を設定
- meta description を追加
- 構造化データの利用を検討

### 4. 一貫性

- スタイルガイドに従う
- コンポーネントを再利用
- 命名規則を統一

## 📚 参考リンク

- [Jekyll公式ドキュメント](https://jekyllrb.com/docs/)
- [GitHub Pages公式ドキュメント](https://docs.github.com/ja/pages)
- [Markdown Guide](https://www.markdownguide.org/)
- [Font Awesome Icons](https://fontawesome.com/icons)

---

質問や提案がある場合は、GitHubのIssueで報告してください。
