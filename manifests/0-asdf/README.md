# asdfのインストールとプラグインの追加方法

## Install asdf

```sh
$ wget https://github.com/asdf-vm/asdf/releases/download/v0.16.6/asdf-v0.16.6-linux-amd64.tar.gz
$ tar -xzvf asdf-v0.16.6-linux-amd64.tar.gz 
$ sudo install asdf /usr/bin
```

## asdfのパスを通す

以下を`.bashrc`や`.zshrc`に追記してください。

```sh
export PATH=$PATH:$HOME/.asdf/shims
```

## Pluginの追加方法

asdfプラグインの使用の責任はユーザーにあり、サービス開発者はasdf-core以外についてSecurity Policyを保証しないと以下のように明記されています。
使用する際は自己責任でお願いします。

> This security policy only applies to asdf core, which is the code contained in this repository. All plugins are the responsibility of their creators and are not covered under this security policy., https://github.com/asdf-vm/asdf/security


- PLUGIN_NAME: プラグイン名
- PLUGIN_URL: プラグインが公開されているGitHubのURL
- PLUGIN_VERSION: プラグインのバージョン (asdf listで確認できる)

```sh
$ asdf plugin add {PLUGIN_NAME} {PLUGIN_GITHUB_URL}
$ asdf install {PLUGIN_NAME} latest # 一部のプラグインでlatestが使用できない場合は具体的なバージョン番号を指定してください
$ asdf set -u {PLUGIN_NAME} {PLUGIN_VERSION}
```
