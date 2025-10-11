# manifests/ ディレクトリリファクタリング計画

## 🎯 目的

- ディレクトリ構造の統一化
- ドキュメントの重複排除（GitHub Pages への一元化）
- 保守性と可読性の向上

## 📁 現状の問題点

### 1. ディレクトリ構造の不統一

| コンポーネント | argocd/ | manifests/ | 備考 |
|---------------|---------|-----------|------|
| 0-asdf | ❌ | ❌ | README.md のみ |
| 1-argocd | ❌ | ✅ | ArgoCD 自体のインストール用 |
| 2-cloudflare-ingress-controller | ✅ | ❌ | - |
| 3-rook-ceph-pvc | ✅ | ❌ | tests/ あり |
| 4-cert-manager | ✅ | ✅ | - |
| 5-harbor | ✅ | ✅ | - |

### 2. ドキュメントの重複

- `manifests/*/README.md` - 手順書（重複内容）
- `docs/components/*.md` - 詳細ドキュメント（GitHub Pages）
- 両方に似た内容が記載されており、保守が煩雑

### 3. 削除済みコンポーネントの参照

- firebolt-core, istio, minio, nginx が削除済み
- ルートの `README.md` にまだ参照が残っている

## 🔄 リファクタリング内容

### Phase 1: ディレクトリ構造の統一

#### 1-1. ArgoCD Application ディレクトリの追加

**対象**: `1-argocd/`

- 現状: `manifests/` のみ
- 変更後: `argocd/` ディレクトリを追加し、ArgoCD で管理される他のコンポーネント用の Application 定義を配置
- 理由: 他のコンポーネントとの構造統一

```
1-argocd/
├── argocd/                          # 新規作成
│   ├── cloudflare-ingress.yaml     # 2-cloudflare から移動
│   ├── rook-ceph.yaml               # 3-rook-ceph から移動
│   ├── cert-manager.yaml            # 4-cert-manager から移動
│   └── harbor.yaml                  # 5-harbor から移動
├── manifests/                       # 既存
│   ├── argocd-cm.yml
│   ├── argocd-cmd-params-cm.yml
│   └── ingress.yml
└── README.md
```

**注意**: この変更は、「ArgoCD で他のコンポーネントを管理する」というアーキテクチャに合わせた配置です。

#### 1-2. 各コンポーネントディレクトリの整理

**2-cloudflare-ingress-controller/**
- `argocd/cloudflare-tunnel-ingress-controller.yml` → `1-argocd/argocd/` へ移動
- 移動後は README.md のみ残す

**3-rook-ceph-pvc/**
- `argocd/*.yaml` → `1-argocd/argocd/` へ移動
- `tests/` は保持（テスト用途）
- 移動後は README.md と tests/ のみ残す

**4-cert-manager/**
- `argocd/cert-manager.yaml` → `1-argocd/argocd/` へ移動
- `manifests/clusterissuer-letsencrypt.yaml` は保持
- 構造維持: `manifests/`, `README.md`

**5-harbor/**
- `argocd/harbor.yaml` → `1-argocd/argocd/` へ移動
- `manifests/certificate.yaml` は保持
- 構造維持: `manifests/`, `README.md`

#### 1-3. 最終的なディレクトリ構造

```
manifests/
├── 0-asdf/
│   └── README.md                    # ツールインストールガイド
├── 1-argocd/
│   ├── argocd/                      # 新規: 全 ArgoCD Applications
│   │   ├── cloudflare-ingress.yaml
│   │   ├── rook-ceph.yaml
│   │   ├── rook-ceph-external.yaml
│   │   ├── cert-manager.yaml
│   │   └── harbor.yaml
│   ├── manifests/                   # ArgoCD 自体の設定
│   │   ├── argocd-cm.yml
│   │   ├── argocd-cmd-params-cm.yml
│   │   └── ingress.yml
│   └── README.md
├── 2-cloudflare-ingress-controller/
│   └── README.md                    # GitHub Pages へのリンク
├── 3-rook-ceph-pvc/
│   ├── tests/                       # テスト用マニフェスト
│   │   ├── test-pod.yaml
│   │   └── test-pvc.yaml
│   └── README.md
├── 4-cert-manager/
│   ├── manifests/
│   │   └── clusterissuer-letsencrypt.yaml
│   └── README.md
├── 5-harbor/
│   ├── manifests/
│   │   └── certificate.yaml
│   └── README.md
└── PLAN.md                          # このファイル
```

### Phase 2: README の簡素化

#### 2-1. README のテンプレート

各コンポーネントの README.md を以下の形式に統一：

```markdown
# [コンポーネント名]

> **📚 詳細なドキュメントは [GitHub Pages](https://aobaiwaki123.github.io/k8s-cluster/components/[component].html) を参照してください。**

## クイックリファレンス

### 前提条件
- [必要な前提条件を簡潔に記載]

### インストール
\`\`\`bash
# ArgoCD Application の作成
argocd app create --file ../1-argocd/argocd/[component].yaml

# 追加の手順（必要な場合のみ）
kubectl apply -f manifests/
\`\`\`

### 関連ファイル
- ArgoCD Application: `../1-argocd/argocd/[component].yaml`
- マニフェスト: `manifests/`（該当する場合）

## 参考リンク
- [公式ドキュメント URL]
- [詳細ドキュメント](https://aobaiwaki123.github.io/k8s-cluster/components/[component].html)
```

#### 2-2. 各 README の更新対象

- `1-argocd/README.md`
- `2-cloudflare-ingress-controller/README.md`
- `3-rook-ceph-pvc/README.md`
- `4-cert-manager/README.md`
- `5-harbor/README.md`

### Phase 3: ルート README の更新

#### 3-1. 削除されたコンポーネントの参照を削除

削除対象：
- Firebolt Core への参照（89-92行目）
- MinIO への参照（93行目）
- Nginx Ingress への参照（94行目）

#### 3-2. ArgoCD Application の配置変更を反映

パスの更新：
- `manifests/*/argocd/*.yaml` → `manifests/1-argocd/argocd/*.yaml`

### Phase 4: ファイル命名規則の統一

#### 4-1. ArgoCD Application YAML

**命名規則**: `<component-name>.yaml`

変更対象：
- `cloudflare-tunnel-ingress-controller.yml` → `cloudflare-ingress.yaml`
- `rook-ceph-external-cluster.yaml` → `rook-ceph-external.yaml`

#### 4-2. Kubernetes マニフェスト

**命名規則**: ケバブケース + 説明的な名前

現状確認：
- ✅ `argocd-cm.yml` - OK
- ✅ `argocd-cmd-params-cm.yml` - OK
- ✅ `ingress.yml` - OK
- ✅ `clusterissuer-letsencrypt.yaml` - OK
- ✅ `certificate.yaml` - OK

拡張子統一（オプション）:
- `.yml` → `.yaml` への統一を検討

### Phase 5: docs/ との整合性確保

#### 5-1. docs/components/ の更新

各コンポーネントのドキュメントで以下を確認・更新：
- マニフェストパスの更新
- ArgoCD Application パスの更新
- 削除されたコンポーネントへの参照削除

#### 5-2. docs/index.md の更新

- 削除されたコンポーネントのリンク削除
- コンポーネントグリッドの更新

## 📋 実施チェックリスト

### Phase 1: ディレクトリ構造の統一
- [ ] `1-argocd/argocd/` ディレクトリの作成
- [ ] ArgoCD Application YAML の移動
  - [ ] cloudflare-ingress.yaml
  - [ ] rook-ceph.yaml
  - [ ] rook-ceph-external.yaml
  - [ ] cert-manager.yaml
  - [ ] harbor.yaml
- [ ] 移動元ディレクトリの削除
  - [ ] `2-cloudflare-ingress-controller/argocd/`
  - [ ] `3-rook-ceph-pvc/argocd/`
  - [ ] `4-cert-manager/argocd/`
  - [ ] `5-harbor/argocd/`

### Phase 2: README の簡素化
- [ ] `1-argocd/README.md` の更新
- [ ] `2-cloudflare-ingress-controller/README.md` の更新
- [ ] `3-rook-ceph-pvc/README.md` の更新
- [ ] `4-cert-manager/README.md` の更新
- [ ] `5-harbor/README.md` の更新

### Phase 3: ルート README の更新
- [ ] 削除されたコンポーネントへの参照を削除
- [ ] パスの更新

### Phase 4: ファイル命名規則の統一
- [ ] ArgoCD Application YAML のリネーム
- [ ] 拡張子の統一（オプション）

### Phase 5: docs/ との整合性確保
- [ ] `docs/components/*.md` の更新
- [ ] `docs/index.md` の更新

### Phase 6: 検証
- [ ] 各コンポーネントのインストール手順を検証
- [ ] リンク切れの確認
- [ ] GitHub Pages のビルド確認

## ⚠️ 注意事項

1. **既存環境への影響**
   - ArgoCD Application の移動により、既存のパスを参照しているスクリプトや手順書に影響がある可能性
   - 移行後は新しいパスを使用するよう周知が必要

2. **バックアップ**
   - リファクタリング前にブランチを切る
   - 必要に応じてタグを打つ

3. **段階的な移行**
   - 一度に全てを変更せず、Phase ごとに確認しながら進める
   - 各 Phase 完了後にコミットして履歴を残す

4. **ドキュメントの整合性**
   - manifests/README.md と docs/components/ の内容が乖離しないよう注意
   - 詳細は GitHub Pages、クイックリファレンスは manifests/README.md という役割分担を明確に

## 🚀 実施順序

1. 新ブランチの作成: `git checkout -b refactor-manifests-structure`
2. Phase 1 実施 → コミット
3. Phase 2 実施 → コミット
4. Phase 3 実施 → コミット
5. Phase 4 実施 → コミット
6. Phase 5 実施 → コミット
7. Phase 6 実施（検証）
8. プルリクエスト作成 → レビュー → マージ

## 📝 想定される効果

### メリット
- ✅ ディレクトリ構造の統一により、新しいコンポーネント追加時の迷いが減少
- ✅ ArgoCD Application の一元管理により、管理が容易に
- ✅ ドキュメントの重複排除により、保守コストが削減
- ✅ GitHub Pages への集約により、ユーザーにとって分かりやすい

### 考慮すべき点
- ⚠️ 既存のスクリプトや手順書の更新が必要
- ⚠️ チーム内での新しい構造の周知が必要
- ⚠️ 移行期間中の混乱を最小化する工夫が必要
