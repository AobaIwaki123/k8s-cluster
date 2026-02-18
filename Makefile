.PHONY: help bootstrap bootstrap-check ssh-config-install k0s-start k0s-stop k0s-status k0s-config

.DEFAULT_GOAL := help

help: ## このヘルプメッセージを表示
	@echo "K8s Cluster Management"
	@echo "======================"
	@echo ""
	@echo "利用可能なコマンド:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

bootstrap: ## クラスタを自動構築（k0s + ArgoCD + Cloudflare Ingress）
	@./scripts/bootstrap.sh

bootstrap-check: ## 設定ファイルの妥当性チェック
	@./scripts/helpers.sh check-config

ssh-config-install: ## SSH設定ファイルをインストール
	@cp config/* ~/.ssh/config.d/

k0s-start: ## k0sクラスタを起動
	@k0sctl apply --config k0s/k0sctl-test.yml

k0s-stop: ## k0sクラスタを停止
	@k0sctl reset --config k0s/k0sctl-test.yml

k0s-status: ## クラスタの状態を確認
	@kubectl get nodes -o wide

k0s-config: ## kubeconfigを取得・設定
	@mkdir -p ~/.kube
	@k0sctl kubeconfig --config k0s/k0sctl-test.yml > ~/.kube/config
