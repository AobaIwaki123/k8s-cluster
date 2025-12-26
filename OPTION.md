#### Cilium Hubble導入（ネットワーク可視化）

```bash
# Cilium CLI インストール
CILIUM_CLI_VERSION=$(curl -s https://raw.githubusercontent.com/cilium/cilium-cli/main/stable.txt)
curl -L --fail --remote-name-all https://github.com/cilium/cilium-cli/releases/download/${CILIUM_CLI_VERSION}/cilium-linux-amd64.tar.gz{,.sha256sum}
sha256sum --check cilium-linux-amd64.tar.gz.sha256sum
sudo tar xzvfC cilium-linux-amd64.tar.gz /usr/local/bin
rm cilium-linux-amd64.tar.gz{,.sha256sum}

# Ciliumインストール（既存CNIと共存可能モード）
cilium install --version 1.15.0

# Hubble有効化
cilium hubble enable --ui

# Hubble UI アクセス
cilium hubble ui

# ブラウザで http://localhost:12000 にアクセス
# サービスマップ、フローログが表示される
```

#### 成果物チェックリスト

- [ ] Hubble UIでネットワークフロー確認