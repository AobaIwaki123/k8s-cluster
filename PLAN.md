# ドキュメントサイト再実装計画

## 現状分析

### 既存の実装
- **技術スタック**: Jekyll + Markdown + GitHub Pages
- **レイアウト**: 2つのレイアウト（default.html, home.html）
- **スタイル**: カスタムCSS（style.css）
- **機能**: 基本的なナビゲーション、シンタックスハイライト、コピーボタン

### 問題点
1. Jekyll依存により、ローカルでの開発にRuby環境が必要
2. Markdownのレンダリングが必要で、即座のプレビューが困難
3. 検索機能がない
4. ダークモードがない
5. より洗練されたUI/UXが必要
6. インタラクティブな要素が少ない

## 新しい実装

### 技術スタック
- **HTML5**: セマンティックなマークアップ
- **CSS3**: モダンなスタイリング
  - CSS Variables（カスタムプロパティ）
  - Flexbox/Grid Layout
  - CSS Transitions/Animations
- **Vanilla JavaScript**: フレームワークなしの軽量実装
- **外部ライブラリ**:
  - Highlight.js: シンタックスハイライト
  - Font Awesome: アイコン
  - Marked.js: Markdown → HTML変換（オプション）

### 設計思想
1. **ゼロビルド**: ビルドツール不要、ブラウザで直接実行
2. **軽量**: 最小限の依存関係
3. **モダン**: 最新のWeb標準を活用
4. **アクセシブル**: WCAG 2.1準拠
5. **パフォーマンス**: 高速な読み込みと操作
6. **レスポンシブ**: モバイルファースト設計

## ディレクトリ構造

```
docs/
├── index.html                      # ホームページ
├── setup/
│   ├── prerequisites.html         # 前準備
│   └── cluster-installation.html  # クラスター構築
├── components/
│   ├── argocd.html
│   ├── cloudflare-ingress.html
│   ├── rook-ceph.html
│   ├── cert-manager.html
│   ├── harbor.html
│   ├── firebolt-core.html
│   ├── minio.html
│   └── nginx-ingress.html
├── assets/
│   ├── css/
│   │   ├── variables.css          # CSS変数定義
│   │   ├── reset.css              # リセットCSS
│   │   ├── typography.css         # タイポグラフィ
│   │   ├── components.css         # コンポーネントスタイル
│   │   ├── layout.css             # レイアウト
│   │   ├── themes.css             # テーマ（ライト/ダーク）
│   │   └── main.css               # メインスタイルシート
│   ├── js/
│   │   ├── config.js              # 設定
│   │   ├── navigation.js          # ナビゲーション機能
│   │   ├── theme.js               # テーマ切り替え
│   │   ├── search.js              # 検索機能
│   │   ├── code-highlight.js     # コードハイライト
│   │   ├── toc.js                # 目次生成
│   │   └── main.js               # メインスクリプト
│   ├── images/
│   │   ├── argocd.png
│   │   ├── harbor.png
│   │   └── ... 
│   └── data/
│       ├── navigation.json        # ナビゲーション構造
│       └── search-index.json      # 検索インデックス
└── templates/
    ├── header.html                # ヘッダーテンプレート
    ├── sidebar.html               # サイドバーテンプレート
    └── footer.html                # フッターテンプレート
```

## 主要機能

### 1. レイアウトシステム
- **ヘッダー**: 固定ヘッダー、ロゴ、検索バー、テーマ切り替えボタン
- **サイドバー**: 折りたたみ可能、アクティブ項目のハイライト
- **メインコンテンツ**: 最大幅制限、読みやすい行間
- **目次**: 自動生成、スクロールに連動してハイライト
- **フッター**: バージョン情報、リンク

### 2. ナビゲーション
- **グローバルナビゲーション**: ヘッダーに固定
- **サイドバーナビゲーション**: 階層構造、アコーディオン
- **パンくずリスト**: 現在位置の表示
- **前へ/次へボタン**: ページ間の移動

### 3. 検索機能
- **インクリメンタルサーチ**: リアルタイムで結果表示
- **ハイライト**: 検索語をハイライト
- **フィルタリング**: カテゴリ別の絞り込み
- **キーボードショートカット**: Ctrl+K or Cmd+K で検索

### 4. テーマシステム
- **ライトモード**: デフォルト
- **ダークモード**: 目に優しい配色
- **自動切り替え**: システム設定に追従（オプション）
- **永続化**: LocalStorageに保存

### 5. コード表示
- **シンタックスハイライト**: 複数言語対応
- **行番号**: オプションで表示
- **コピーボタン**: ワンクリックでコピー
- **言語ラベル**: コードブロックの言語表示
- **折りたたみ**: 長いコードブロックを折りたたみ

### 6. レスポンシブデザイン
- **ブレークポイント**:
  - モバイル: < 640px
  - タブレット: 640px - 1024px
  - デスクトップ: 1024px - 1440px
  - 大画面: > 1440px
- **モバイルメニュー**: ハンバーガーメニュー
- **タッチ対応**: スワイプジェスチャー

### 7. アクセシビリティ
- **セマンティックHTML**: 適切なタグ使用
- **ARIA属性**: スクリーンリーダー対応
- **キーボードナビゲーション**: Tabキーで操作可能
- **フォーカス表示**: 明確なフォーカスインジケーター
- **カラーコントラスト**: WCAG AA準拠

### 8. パフォーマンス
- **遅延読み込み**: 画像の遅延読み込み
- **コード分割**: 必要なJSのみ読み込み
- **キャッシュ**: Service Worker（オプション）
- **最適化**: CSS/JSのminify

## デザインシステム

### カラーパレット

#### ライトモード
```css
--primary: #3b82f6;        /* ブルー */
--primary-dark: #2563eb;
--primary-light: #60a5fa;
--secondary: #8b5cf6;      /* パープル */
--accent: #06b6d4;         /* シアン */
--success: #10b981;        /* グリーン */
--warning: #f59e0b;        /* オレンジ */
--danger: #ef4444;         /* レッド */
--info: #3b82f6;           /* ブルー */

--text-primary: #1f2937;
--text-secondary: #6b7280;
--text-tertiary: #9ca3af;

--bg-primary: #ffffff;
--bg-secondary: #f9fafb;
--bg-tertiary: #f3f4f6;
--bg-code: #1f2937;

--border: #e5e7eb;
--border-light: #f3f4f6;
```

#### ダークモード
```css
--primary: #60a5fa;
--primary-dark: #3b82f6;
--primary-light: #93c5fd;
--secondary: #a78bfa;
--accent: #22d3ee;
--success: #34d399;
--warning: #fbbf24;
--danger: #f87171;
--info: #60a5fa;

--text-primary: #f9fafb;
--text-secondary: #d1d5db;
--text-tertiary: #9ca3af;

--bg-primary: #111827;
--bg-secondary: #1f2937;
--bg-tertiary: #374151;
--bg-code: #0f172a;

--border: #374151;
--border-light: #4b5563;
```

### タイポグラフィ
- **フォント**:
  - 本文: Inter, Noto Sans JP, system-ui, sans-serif
  - コード: JetBrains Mono, Fira Code, monospace
  - 見出し: Inter, Noto Sans JP, sans-serif (font-weight: 700)
- **サイズスケール** (Tailwind CSS風):
  - xs: 0.75rem (12px)
  - sm: 0.875rem (14px)
  - base: 1rem (16px)
  - lg: 1.125rem (18px)
  - xl: 1.25rem (20px)
  - 2xl: 1.5rem (24px)
  - 3xl: 1.875rem (30px)
  - 4xl: 2.25rem (36px)
  - 5xl: 3rem (48px)

### スペーシング
- **マージン/パディング** (Tailwind CSS風):
  - 0: 0
  - 1: 0.25rem (4px)
  - 2: 0.5rem (8px)
  - 3: 0.75rem (12px)
  - 4: 1rem (16px)
  - 5: 1.25rem (20px)
  - 6: 1.5rem (24px)
  - 8: 2rem (32px)
  - 10: 2.5rem (40px)
  - 12: 3rem (48px)
  - 16: 4rem (64px)

### シャドウ
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

### アニメーション
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
```

## コンポーネント一覧

### 1. Button
- Primary, Secondary, Ghost
- サイズ: sm, md, lg
- 状態: default, hover, active, disabled

### 2. Card
- 基本カード
- インタラクティブカード（ホバーエフェクト）
- 画像付きカード

### 3. Alert
- info, success, warning, danger
- アイコン付き
- 閉じるボタン（オプション）

### 4. Badge
- サイズ: sm, md
- カラー: primary, secondary, success, warning, danger
- 形状: pill, rounded

### 5. Code Block
- シンタックスハイライト
- 行番号
- コピーボタン
- 言語ラベル
- ファイル名表示（オプション）

### 6. Table
- ストライプ
- ホバー
- ソート可能（オプション）

### 7. Navigation
- サイドバーナビゲーション
- モバイルメニュー
- パンくずリスト

### 8. Search
- 検索バー
- 検索結果表示
- ハイライト

### 9. TOC (Table of Contents)
- 自動生成
- スクロール連動
- 折りたたみ可能

### 10. Modal
- オーバーレイ
- 閉じるボタン
- アニメーション

## 実装フェーズ

### Phase 1: 基盤構築（Day 1-2）
1. ✅ ディレクトリ構造の作成
2. ✅ HTMLテンプレートの作成
3. ✅ CSS変数の定義
4. ✅ リセットCSSの適用
5. ✅ 基本レイアウトの実装

### Phase 2: コンポーネント実装（Day 3-4）
1. ✅ ヘッダーコンポーネント
2. ✅ サイドバーコンポーネント
3. ✅ フッターコンポーネント
4. ✅ ナビゲーションコンポーネント
5. ✅ コードブロックコンポーネント
6. ✅ アラートコンポーネント
7. ✅ カードコンポーネント

### Phase 3: 機能実装（Day 5-6）
1. ✅ テーマ切り替え（ダークモード）
2. ✅ 検索機能
3. ✅ 目次自動生成
4. ✅ モバイルメニュー
5. ✅ スムーススクロール
6. ✅ コードコピー機能

### Phase 4: コンテンツ移行（Day 7-8）
1. ✅ ホームページの移行
2. ✅ セットアップページの移行
3. ✅ コンポーネントページの移行
4. ✅ 画像の最適化

### Phase 5: 最適化とテスト（Day 9-10）
1. ✅ パフォーマンス最適化
2. ✅ アクセシビリティチェック
3. ✅ ブラウザ互換性テスト
4. ✅ レスポンシブデザインテスト
5. ✅ ドキュメント作成

## 優先順位

### Must Have（必須）
- [x] レスポンシブレイアウト
- [x] ダークモード
- [x] コードハイライト
- [x] コピーボタン
- [x] モバイルメニュー
- [x] パンくずリスト
- [x] 目次自動生成

### Should Have（重要）
- [x] 検索機能
- [x] ページ遷移アニメーション
- [x] キーボードショートカット
- [x] 前へ/次へナビゲーション
- [x] スクロールプログレス

### Nice to Have（あれば良い）
- [ ] オフライン対応（Service Worker）
- [ ] PWA対応
- [ ] 印刷最適化
- [ ] 複数言語対応
- [ ] コメント機能

## 互換性

### ブラウザサポート
- Chrome/Edge: 最新版と1つ前のバージョン
- Firefox: 最新版と1つ前のバージョン
- Safari: 最新版と1つ前のバージョン
- モバイルブラウザ: iOS Safari, Chrome for Android

### デバイス
- デスクトップ: 1024px以上
- タブレット: 640px - 1024px
- モバイル: 640px以下

## パフォーマンス目標

- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms

## メンテナンス

### 更新頻度
- コンテンツ: 必要に応じて
- デザイン: 四半期ごとにレビュー
- 依存関係: 月次でチェック

### ドキュメント
- README.md: セットアップ手順
- CONTRIBUTING.md: 貢献ガイド
- CHANGELOG.md: 変更履歴

## まとめ

この計画に基づいて、Jekyll依存の既存ドキュメントをPure HTML/CSS/JSで再実装します。
モダンで使いやすく、メンテナンスしやすいドキュメントサイトを目指します。

実装は段階的に行い、各フェーズで動作確認とテストを実施します。
