ssh-config-install:
	cp config/* ~/.ssh/config.d/

k0s-start:
	k0sctl apply --config k0s/k0sctl-test.yml

k0s-stop:
	k0sctl reset --config k0s/k0sctl-test.yml

k0s-status:
	kubectl get nodes -o wide

k0s-config:
	mkdir -p ~/.kube
	k0sctl kubeconfig --config k0s/k0sctl-test.yml > ~/.kube/config
