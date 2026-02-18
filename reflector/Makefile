DOCKER_CONFIG ?= $(HOME)/.docker/config.json
SECRET_TEMPLATE = gcr-pull-secret.template.yaml
SECRET_OUTPUT   = gcr-pull-secret.yaml

.PHONY: generate-secret
generate-secret:
	@if [ ! -f "$(DOCKER_CONFIG)" ]; then \
		echo "Error: $(DOCKER_CONFIG) not found"; \
		exit 1; \
	fi
	@ENCODED=$$(cat $(DOCKER_CONFIG) | base64 -w 0) && \
		sed "s|__DOCKER_CONFIG_BASE64__|$$ENCODED|g" $(SECRET_TEMPLATE) > $(SECRET_OUTPUT)
	@echo "Generated $(SECRET_OUTPUT)"