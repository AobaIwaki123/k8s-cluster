---
layout: default
title: Firebolt Core
---

# Firebolt Core

Firebolt Coreは、セルフホスト可能な高速分析データベースです。無料で永続的に利用できるオープンソース版として提供されています。

## 概要

Firebolt Coreは、大規模なデータ分析ワークロードに最適化されたデータベースエンジンです。

### 特徴

- **高速クエリ処理**: 最適化されたクエリエンジン
- **SQL互換**: 標準的なSQLをサポート
- **スケーラブル**: Kubernetes上で水平スケール可能
- **セルフホスト**: クラウドコストを削減
- **永続無料**: オープンソースとして提供

## 前提条件

- Kubernetes クラスターが構築済みであること
- ArgoCD がセットアップ済みであること
- 永続ストレージが利用可能であること

## セットアップ手順

### ArgoCD でデプロイ

```bash
argocd app create --file ../../manifests/firebolt-core/argocd/firebolt-core.yml
```

### デプロイの確認

```bash
# Pod の状態を確認
kubectl get pods -n firebolt-core

# StatefulSet の状態を確認
kubectl get statefulset -n firebolt-core

# Service の確認
kubectl get svc -n firebolt-core
```

## 使用方法

### ポートフォワードでアクセス

```bash
kubectl port-forward firebolt-core-0 3473:3473 -n firebolt-core
```

### サンプルクエリの実行

基本的なクエリを実行してみます。

```bash
curl -s "http://localhost:3473" --data-binary "select 42"
```

出力例：
```
?column?
int
42
```

### JSON 形式での出力

`output_format` パラメータを使用して、JSON形式で結果を取得できます。

```bash
curl -s "http://localhost:3473/?output_format=JSON_Compact" --data-binary "select 42"
```

出力例：
```json
{
  "query": {
    "query_id": "3fd26ae5-b088-4a6d-bb49-93d09983cec3",
    "request_id": "e2b8c039-b82a-413c-bd0f-cfa0fbf1a27c",
    "query_label": null
  },
  "meta": [
    {
      "name": "?column?",
      "type": "int"
    }
  ],
  "data": [[42]],
  "rows": 1,
  "statistics": {
    "elapsed": 0.00182,
    "rows_read": 1,
    "bytes_read": 1
  }
}
```

## 出力フォーマット

Firebolt Core は複数の出力フォーマットをサポートしています。

- `TabSeparatedWithNamesAndTypes`: デフォルト形式
- `JSON_Compact`: コンパクトなJSON形式
- `JSON_CompactLimited`: 最大10,000行に制限されたJSON形式
- `JSONLines_Compact`: `JSON_CompactLimited` のチャンク版

### フォーマット指定例

```bash
# タブ区切り形式（デフォルト）
curl "http://localhost:3473" --data-binary "select * from my_table"

# JSON形式
curl "http://localhost:3473/?output_format=JSON_Compact" \
  --data-binary "select * from my_table"

# JSONLines形式
curl "http://localhost:3473/?output_format=JSONLines_Compact" \
  --data-binary "select * from my_table"
```

## データベース操作

### データベースの作成

```bash
curl "http://localhost:3473" --data-binary "CREATE DATABASE my_database"
```

### テーブルの作成

```bash
curl "http://localhost:3473" --data-binary "
CREATE TABLE my_database.users (
  id INTEGER,
  name TEXT,
  email TEXT,
  created_at TIMESTAMP
) ENGINE = MergeTree()
ORDER BY id
"
```

### データの挿入

```bash
curl "http://localhost:3473" --data-binary "
INSERT INTO my_database.users VALUES
  (1, 'Alice', 'alice@example.com', '2025-01-01 00:00:00'),
  (2, 'Bob', 'bob@example.com', '2025-01-02 00:00:00')
"
```

### データのクエリ

```bash
curl "http://localhost:3473/?output_format=JSON_Compact" \
  --data-binary "SELECT * FROM my_database.users WHERE id = 1"
```

## Helm Chart のカスタマイズ

Helm Chartは `manifests/firebolt-core/helm/` に配置されています。

### values.yaml の主な設定

```yaml
replicaCount: 1  # レプリカ数

resources:
  limits:
    cpu: "4"
    memory: "8Gi"
  requests:
    cpu: "2"
    memory: "4Gi"

persistence:
  enabled: true
  storageClass: "ceph-rbd"  # 使用するStorageClass
  size: 50Gi
```

### カスタム設定の適用

```bash
# values.yaml を編集
vim manifests/firebolt-core/helm/values.yaml

# ArgoCD で同期
argocd app sync firebolt-core
```

## トラブルシューティング

### Pod が起動しない

```bash
# Pod の状態を確認
kubectl describe pod firebolt-core-0 -n firebolt-core

# ログを確認
kubectl logs firebolt-core-0 -n firebolt-core

# PVC の状態を確認
kubectl get pvc -n firebolt-core
```

### クエリが失敗する

```bash
# ポートフォワードの確認
kubectl port-forward firebolt-core-0 3473:3473 -n firebolt-core

# 接続テスト
curl -v "http://localhost:3473" --data-binary "select 1"

# ログの確認
kubectl logs firebolt-core-0 -n firebolt-core -f
```

### パフォーマンスの問題

- リソース（CPU、メモリ）の割り当てを確認
- ストレージのパフォーマンスを確認
- クエリの最適化を検討

## 参考リンク

- [Introducing Firebolt Core - Self-Hosted Firebolt, For Free, Forever](https://www.firebolt.io/blog/introducing-firebolt-core)
- [Firebolt Core GitHub](https://github.com/firebolt-db/firebolt-core)
- [Deployment on Kubernetes - Deployment and Operational Guide](https://docs.firebolt.io/firebolt-core/firebolt-core-operation/firebolt-core-deployment-k8s)

