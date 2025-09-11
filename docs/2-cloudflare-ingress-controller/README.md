## Cloudflare Tunnel Ingress Controllerのセットアップ

```yaml
        cloudflare:
          apiToken: hoge # READMEのPermissionを参考にしてトークンを作成
          accountId: hoge
          tunnelName: cf-tunnel-ingress-controller # トンネルをCloudflareで作成しておく
```

### Permissions: 

CloudflareのPermissionは`:`区切りの3つのパートから構成されます。

- Zone:Zone:Read
- Zone:DNS:Edit
- Account:Cloudflare Tunnel:Edit

## ArgoCDでセットアップ

```sh
$ argocd app create --file ./argocd/cloudflare-tunnel-ingress-controller.yml
```

## 参考

- [自宅 kubernetes で cloudflare-tunnel-ingress-controller を使ってお手軽外部公開](https://zenn.dev/yh/articles/11823e77bd4379)
- [Cloudflare Tunnel Ingress Controller](https://github.com/STRRL/cloudflare-tunnel-ingress-controller)
