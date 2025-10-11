# セットアップガイド

このディレクトリには、k8sクラスター上に各コンポーネントをセットアップするための手順書が含まれています。

## セットアップ順序

必ず以下の順序でセットアップを実行してください：

| # | コンポーネント | 説明 | ディレクトリ |
|---|--------------|------|------------|
| 0 | **asdf** | 開発ツールのバージョン管理 | [0-asdf/](0-asdf/) |
| 1 | **ArgoCD** | GitOpsツール - 継続的デリバリー | [1-argocd/](1-argocd/) |
| 2 | **Cloudflare Ingress** | トンネル経由でのサービス公開 | [2-cloudflare-ingress-controller/](2-cloudflare-ingress-controller/) |
| 3 | **Rook Ceph** | 分散ストレージシステム | [3-rook-ceph-pvc/](3-rook-ceph-pvc/) |
| 4 | **cert-manager** | TLS証明書の自動管理 | [4-cert-manager/](4-cert-manager/) |
| 5 | **Harbor** | プライベートコンテナレジストリ | [5-harbor/](5-harbor/) |

## クイックスタート

### 前提条件

- k0sクラスターが構築済みであること（[../k0s/README.md](../k0s/README.md) 参照）
- `kubectl` でクラスターにアクセス可能であること

### 基本的なワークフロー

```bash
# 1. 各コンポーネントのディレクトリに移動
cd guide/1-argocd/

# 2. README.md を読んでセットアップ手順を確認
cat README.md

# 3. マニフェストを適用
kubectl apply -f manifests/

# 4. 必要に応じてArgoCDでアプリケーションを管理
kubectl apply -f argocd/
```

## ディレクトリ構造

各コンポーネントディレクトリは以下の構造を持ちます：

```
{component-name}/
├── README.md          # セットアップ手順書
├── manifests/         # 生のKubernetesマニフェスト
├── argocd/           # ArgoCD Application定義（該当する場合）
├── helm/             # Helmチャート（該当する場合）
└── tests/            # テストマニフェスト（該当する場合）
```

##  Tips

- **マニフェスト適用前の確認**: `kubectl apply --dry-run=client -f <file>`
- **リソースの確認**: `kubectl get all -n <namespace>`
- **ログの確認**: `kubectl logs -n <namespace> <pod-name>`
- **ArgoCD UI**: セットアップ後は ArgoCD UI からアプリケーションを管理可能

## 関連ドキュメント

- [プロジェクトルート README](../README.md) - プロジェクト全体の概要
- [k0s README](../k0s/README.md) - クラスター構築手順
- [GitHub Pages](https://aobaiwaki123.github.io/k8s-cluster/) - 詳細ドキュメント

## 注意事項

1. **順序厳守**: 依存関係があるため、必ず番号順にセットアップしてください
2. **シークレット管理**: 各 README に記載されているシークレットは適切に管理してください
3. **リソース確認**: 各ステップ完了後、リソースが正常に起動していることを確認してください
4. **バックアップ**: 本番環境では定期的なバックアップを推奨します

