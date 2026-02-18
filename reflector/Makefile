GCR_KEY      ?= secret/key.json
GCR_SERVER   ?= gcr.io
GCR_EMAIL    ?= unused@example.com
SECRET_NAME  = gcr-pull-secret
SECRET_NS    = default
SECRET_TEMPLATE = gcr-pull-secret.template.yaml
SECRET_OUTPUT   = gcr-pull-secret.yaml

.PHONY: generate-secret
generate-secret:
	@if [ ! -f "$(GCR_KEY)" ]; then \
		echo "Error: $(GCR_KEY) not found"; \
		exit 1; \
	fi
	@kubectl create secret docker-registry $(SECRET_NAME) \
		--docker-server=$(GCR_SERVER) \
		--docker-username=_json_key \
		--docker-password="$$(cat $(GCR_KEY))" \
		--docker-email=$(GCR_EMAIL) \
		--namespace=$(SECRET_NS) \
		--dry-run=client -o yaml \
	| kubectl annotate --local -f - \
		reflector.v1.k8s.emberstack.com/reflection-allowed=true \
		reflector.v1.k8s.emberstack.com/reflection-auto-enabled=true \
		-o yaml \
		> $(SECRET_OUTPUT)
	@echo "Generated $(SECRET_OUTPUT)"