# ドキュメント

ここは GitHub Pages の公開サイトではなく、AI とクラスター運用者が判断に使うための正本ドキュメントです。

読む順序:

1. [`architecture.md`](architecture.md) — 目的、ディレクトリ、コンポーネントの依存関係
2. [`operations.md`](operations.md) — 構築、Argo CD、可観測性、確認手順
3. [`security.md`](security.md) — Secret と公開境界、Pod セキュリティの基準

個別の Kubernetes 定義に関する事実は、ドキュメントより `cluster/` 配下の YAML を正本とします。ドキュメントに設定値を重複して記載する場合は、変更時に両方を更新してください。
