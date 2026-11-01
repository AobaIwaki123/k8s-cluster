.PHONY: help apply config reset status

# デフォルトターゲット
.DEFAULT_GOAL := help

help: ## このヘルプメッセージを表示
	@echo "k0s Kubernetes Cluster Management"
	@echo "================================="
	@echo ""
	@echo "利用可能なコマンド:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "詳細な使い方はREADME.mdを参照してください。"

apply: ## k0sクラスターを構築
	@echo "クラスターを構築中..."
	@k0sctl apply --config k0sctl.yml
	@echo "クラスター構築が完了しました。"

config: ## kubeconfigを取得・設定
	@echo "kubeconfigを設定中..."
	@mkdir -p ~/.kube
	@k0sctl kubeconfig > ~/.kube/config
	@echo "kubeconfigの設定が完了しました。"
	@echo "クラスター情報を確認: kubectl cluster-info"

reset: ## k0sクラスターを削除
	@echo "クラスターをリセット中..."
	@k0sctl reset --config k0sctl.yml
	@echo "クラスターのリセットが完了しました。"

status: ## クラスターの状態を確認
	@echo "クラスター状態を確認中..."
	@kubectl get nodes -o wide || echo "kubeconfigが設定されていません。'make config'を実行してください。"
