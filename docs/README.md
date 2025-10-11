# k8s Cluster Documentation

Pure HTML/CSS/JavaScript で実装されたドキュメントサイトです。

## 🎨 特徴

- **Pure HTML/CSS/JS**: フレームワーク不要、ビルドツール不要
- **ダークモード**: ライト/ダークテーマ切り替え対応
- **レスポンシブ**: モバイル、タブレット、デスクトップ対応
- **検索機能**: リアルタイム検索（Ctrl+K）
- **目次自動生成**: 長いページでは目次を自動生成
- **コードハイライト**: シンタックスハイライト + コピーボタン
- **アクセシブル**: WCAG 2.1準拠

## 📁 構造

```
docs/
├── index.html                    # ホームページ ✅
├── setup/                        # セットアップガイド
│   ├── prerequisites.html        # ✅ 完成
│   └── cluster-installation.html # 📝 Markdown版あり
├── components/                   # コンポーネントドキュメント
│   ├── argocd.html              # 📝 Markdown版あり
│   ├── cloudflare-ingress.html  # 📝 Markdown版あり
│   ├── rook-ceph.html           # 📝 Markdown版あり
│   ├── cert-manager.html        # 📝 Markdown版あり
│   ├── harbor.html              # 📝 Markdown版あり
│   ├── firebolt-core.html       # 📝 Markdown版あり
│   ├── minio.html               # 📝 Markdown版あり
│   └── nginx-ingress.html       # 📝 Markdown版あり
├── assets/
│   ├── css/                      # スタイルシート
│   │   ├── variables.css         # CSS変数
│   │   ├── reset.css            # リセットCSS
│   │   ├── typography.css       # タイポグラフィ
│   │   ├── layout.css           # レイアウト
│   │   ├── components.css       # コンポーネント
│   │   └── main.css             # メインCSS
│   ├── js/                       # JavaScript
│   │   ├── config.js            # 設定
│   │   ├── theme.js             # テーマ切り替え
│   │   ├── navigation.js        # ナビゲーション
│   │   ├── search.js            # 検索機能
│   │   ├── toc.js               # 目次生成
│   │   ├── code-highlight.js    # コードハイライト
│   │   └── main.js              # メインスクリプト
│   └── images/                   # 画像
└── README.md                     # このファイル
```

## 📝 実装状況

現在、以下のページが完成しています：

✅ **完成**:
- `index.html` - ホームページ
- `setup/prerequisites.html` - 前準備
- すべてのCSS/JSファイル

📝 **Markdown版あり**（HTML変換が必要）:
- `setup/cluster-installation.md`
- `components/*.md`（8ファイル）

これらのMarkdownファイルは `setup/prerequisites.html` をテンプレートとして使用して、
HTML化できます。各ファイルの構造は同じです：
1. ヘッダー、フッター、サイドバー構造をコピー
2. `<article class="article-content">` 内にMarkdownの内容をHTMLに変換して配置
3. パスを調整（`../assets/` 等）

## 🚀 使い方

### ローカルでの表示

シンプルなHTTPサーバーで表示できます：

```bash
# Python 3
cd docs
python3 -m http.server 8000

# Node.js (http-server)
npx http-server docs -p 8000

# PHP
php -S localhost:8000 -t docs
```

ブラウザで http://localhost:8000 を開きます。

### GitHub Pages での公開

1. GitHubリポジトリの Settings → Pages
2. Source: `main` ブランチの `/docs` フォルダ
3. Save

数分後に自動的にデプロイされます。

## 🎨 カスタマイズ

### カラーテーマの変更

`assets/css/variables.css` でカラーパレットを変更できます：

```css
:root {
  --primary: #3b82f6;      /* メインカラー */
  --secondary: #8b5cf6;    /* セカンダリカラー */
  --accent: #06b6d4;       /* アクセントカラー */
  /* ... */
}
```

### ナビゲーションの変更

`assets/js/config.js` でナビゲーション構造を変更できます：

```javascript
const CONFIG = {
  navigation: [
    {
      title: 'セクション名',
      icon: 'fa-icon',
      items: [
        { title: 'ページ名', url: '/path/to/page.html' }
      ]
    }
  ]
};
```

### 新しいページの追加

1. `docs/setup/prerequisites.html` をテンプレートとしてコピー
2. `<title>` と `<h1>` を変更
3. `<article class="article-content">` 内のコンテンツを編集
4. `config.js` のナビゲーションに追加

## ⌨️ キーボードショートカット

- `Ctrl + K` または `Cmd + K`: 検索を開く
- `Alt + T`: テーマ切り替え
- `Esc`: サイドバー/検索を閉じる

## 🎯 機能

### テーマ切り替え

ヘッダーの月/太陽アイコンをクリックしてテーマを切り替えられます。
選択したテーマは LocalStorage に保存され、次回訪問時も維持されます。

### 検索機能

ヘッダーの検索バーで ドキュメント内を検索できます：
- リアルタイムで結果を表示
- マッチした箇所をハイライト
- キーボードショートカット対応（Ctrl+K）

### 目次（TOC）

長いページ（h2/h3が3つ以上）では、右側に目次が自動生成されます：
- スクロールに連動してアクティブセクションをハイライト
- クリックでスムーススクロール
- 1280px以上の画面で表示

### コードブロック

すべてのコードブロックに以下の機能が自動で付与されます：
- シンタックスハイライト（Highlight.js）
- コピーボタン
- 言語ラベル

## 🔧 開発

### CSS構成

CSSは機能ごとに分割されています：

- `variables.css`: CSS変数（カラー、フォント、スペーシング等）
- `reset.css`: モダンなリセットCSS
- `typography.css`: テキストスタイル
- `layout.css`: ページレイアウト
- `components.css`: UIコンポーネント
- `main.css`: 上記をすべてインポート + ユーティリティクラス

### JavaScript構成

JavaScriptも機能ごとにモジュール化されています：

- `config.js`: グローバル設定
- `theme.js`: ダークモード管理
- `navigation.js`: サイドバーとモバイルメニュー
- `search.js`: 検索機能
- `toc.js`: 目次自動生成
- `code-highlight.js`: コードハイライトとコピー
- `main.js`: その他のメイン機能

各モジュールは独立しており、必要に応じて追加・削除できます。

## 📱 レスポンシブデザイン

以下のブレークポイントで最適化されています：

- モバイル: < 640px
- タブレット: 640px - 1024px
- デスクトップ: 1024px - 1440px
- 大画面: > 1440px

## ♿ アクセシビリティ

- セマンティックHTML5タグ使用
- ARIA属性の適切な使用
- キーボードナビゲーション対応
- フォーカスインジケーターの明確化
- カラーコントラスト WCAG AA準拠
- スクリーンリーダー対応

## 🌐 ブラウザサポート

- Chrome/Edge: 最新版と1つ前のバージョン
- Firefox: 最新版と1つ前のバージョン
- Safari: 最新版と1つ前のバージョン
- モバイルブラウザ: iOS Safari, Chrome for Android

## 📦 依存関係

外部ライブラリは CDN から読み込まれます：

- [Highlight.js](https://highlightjs.org/) - コードハイライト
- [Font Awesome](https://fontawesome.com/) - アイコン
- [Google Fonts](https://fonts.google.com/) - フォント（Inter, Noto Sans JP, JetBrains Mono）

## 🐛 トラブルシューティング

### スタイルが適用されない

- ブラウザのキャッシュをクリア
- `assets/css/main.css` が正しく読み込まれているか確認
- ブラウザの開発者ツールでCSSエラーを確認

### JavaScriptが動作しない

- ブラウザのコンソールでエラーを確認
- すべてのJSファイルが読み込まれているか確認
- `CONFIG` オブジェクトが正しく定義されているか確認

### 検索が機能しない

- `config.js` の `searchEnabled` が `true` か確認
- `navigation` 配列が正しく定義されているか確認

## 📄 ライセンス

このドキュメントサイトのコードは MIT License で提供されています。

## 🤝 貢献

プルリクエストを歓迎します！大きな変更の場合は、まず issue を開いて変更内容を議論してください。

## 📞 サポート

質問や問題がある場合は、GitHubのIssueを開いてください。

---

Built with ❤️ and Kubernetes
