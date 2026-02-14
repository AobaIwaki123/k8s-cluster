.PHONY: dashboard
dashboard:
	@echo "Generating dashboard ConfigMap from JSON file..."
	@printf "apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: grafana-dashboards\n  namespace: observability\n  labels:\n    grafana_dashboard: \"1\"\ndata:\n  observability-dashboard.json: |-\n" > dashboard-configmap.yaml
	@sed 's/^/    /' dashboards/observability-dashboard.json >> dashboard-configmap.yaml
	@echo "Dashboard ConfigMap generated successfully!"

.PHONY: apply
apply: dashboard
	@echo "Applying dashboard ConfigMap to cluster..."
	@kubectl apply -f dashboard-configmap.yaml
	@echo "Dashboard applied successfully!"

.PHONY: help
help:
	@echo "Available targets:"
	@echo "  dashboard  - Generate dashboard ConfigMap from JSON file"
	@echo "  apply      - Generate and apply dashboard ConfigMap to cluster"
	@echo "  help       - Show this help message"
