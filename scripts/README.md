# Bootstrap Scripts

このディレクトリには、k8sクラスタの自動セットアップスクリプトが含まれています。

## スクリプト一覧

### メインスクリプト

- **`bootstrap.sh`** - メインのブートストラップスクリプト
  - 4つのセットアップステップを順次実行
  - エラーハンドリングと進捗表示を含む

### セットアップスクリプト

- **`setup-k0s.sh`** - k0sクラスタの構築
  - k0sctlによるクラスタ作成
  - kubeconfigの取得と配置
  
- **`setup-argocd.sh`** - ArgoCDのインストール
  - ArgoCDのインストール
  - Insecureモードの設定
  - 初期パスワードの取得と変更
  
- **`setup-cloudflare.sh`** - Cloudflare Ingress Controller
  - テンプレートから設定ファイル生成
  - ArgoCD Applicationとしてデプロイ
  
- **`setup-argocd-ingress.sh`** - ArgoCD Ingress公開
  - Ingressリソースの作成
  - ドメイン経由でのアクセス設定

### ヘルパースクリプト

- **`helpers.sh`** - 共通ヘルパー関数
  - 設定ファイルの読み込み
  - ログ出力（カラー対応）
  - kubectl待機関数
  - 前提条件チェック

## 使用方法

### 基本的な使い方

```bash
# ルートディレクトリから実行
make bootstrap
```

### 個別スクリプトの実行

```bash
# k0sクラスタのみセットアップ
./scripts/setup-k0s.sh

# ArgoCDのみセットアップ
./scripts/setup-argocd.sh
```

### 設定ファイルのチェック

```bash
make bootstrap-check
# または
./scripts/helpers.sh check-config
```

## 設定ファイル

すべてのスクリプトは `config/cluster.yml` から設定を読み込みます。

```yaml
k0s:
  config_file: k0s/k0sctl-test.yml

argocd:
  admin_password: "your-password"
  domain: "argocd.example.com"

cloudflare:
  api_token: "your-token"
  account_id: "your-account-id"
  tunnel_name: "your-tunnel-name"
```

## 環境変数

### BOOTSTRAP_SKIP_CONFIRM

確認プロンプトをスキップします（CI/CDで便利）。

```bash
BOOTSTRAP_SKIP_CONFIRM=true make bootstrap
```

## エラーハンドリング

すべてのスクリプトは `set -e` でエラー時に即座に停止します。

エラーが発生した場合：

1. エラーメッセージを確認
2. 該当するステップのログを確認
3. 必要に応じて手動で修正
4. スクリプトを再実行

## トラブルシューティング

### yq が見つからない

```bash
# macOS
brew install yq

# Linux
wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/local/bin/yq
chmod +x /usr/local/bin/yq
```

### envsubst が見つからない

```bash
# macOS
brew install gettext
brew link --force gettext

# Linux (通常は標準でインストール済み)
apt-get install gettext-base
```

### ArgoCD初期パスワード取得失敗

ArgoCD Podの起動を待ってから再実行してください。

```bash
kubectl get pods -n argocd
# すべてのPodがRunningになるまで待機
./scripts/setup-argocd.sh
```

## 開発者向け

### 新しいセットアップステップの追加

1. `scripts/setup-xxx.sh` を作成
2. `helpers.sh` をsourceして関数を利用
3. `bootstrap.sh` に新しいステップを追加
4. 実行権限を付与: `chmod +x scripts/setup-xxx.sh`

### デバッグ

デバッグ出力を有効にする：

```bash
set -x  # スクリプトの先頭に追加
```

## 依存関係

- k0sctl
- kubectl
- argocd CLI
- yq (YAML parser)
- envsubst (テンプレート処理)
- bash 4.0以上

