## Cloudflare Tunnel Ingress Controllerのセットアップ

```yaml
        cloudflare:
          apiToken: YOUR_API_TOKEN # 下記のPermissionsを参考にしてトークンを作成
          accountId: YOUR_ACCOUNT_ID
          tunnelName: cf-tunnel-ingress-controller # 事前にCloudflareダッシュボードでトンネルを作成しておく
```

## API トークンに必要な Permissions

Cloudflare の API トークンには以下の権限が必要です：

- Zone:Zone:Read
- Zone:DNS:Edit
- Account:Cloudflare Tunnel:Edit

各権限は `リソースタイプ:サブリソース:アクセスレベル` の形式です。

## ArgoCD でセットアップ

```sh
$ argocd app create --file ./argocd/cloudflare-tunnel-ingress-controller.yml
```

## 参考

- [自宅 kubernetes で cloudflare-tunnel-ingress-controller を使ってお手軽外部公開](https://zenn.dev/yh/articles/11823e77bd4379)
- [Cloudflare Tunnel Ingress Controller](https://github.com/STRRL/cloudflare-tunnel-ingress-controller)
