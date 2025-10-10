---
layout: default
title: Cloudflare Ingress Controller
---

# Cloudflare Tunnel Ingress Controller のセットアップ

Cloudflare Tunnel Ingress Controllerは、Cloudflare Tunnelを使用してKubernetesのIngressリソースを自動的に外部公開するコントローラーです。

## 特徴

- SSL/TLS 証明書の自動管理
- Cloudflare の CDN とセキュリティ機能を活用
- グローバルな負荷分散
- DDoS 攻撃からの保護
- ファイアウォールやポート開放が不要

## 前提条件

- Cloudflare アカウント
- ドメインが Cloudflare で管理されていること
- Cloudflare Tunnel が作成済みであること
- ArgoCD がセットアップ済みであること

## API トークンの作成

Cloudflare ダッシュボードで API トークンを作成します。

### 必要な Permissions

以下の権限を持つトークンを作成します：

- `Zone:Zone:Read` - ゾーン情報の読み取り
- `Zone:DNS:Edit` - DNS レコードの編集
- `Account:Cloudflare Tunnel:Edit` - トンネルの編集

各権限は `リソースタイプ:サブリソース:アクセスレベル` の形式です。

## Cloudflare Tunnel の作成

Cloudflare ダッシュボードで事前にトンネルを作成しておきます。

1. Cloudflare ダッシュボードにログイン
2. Zero Trust → Access → Tunnels
3. Create a tunnel → Cloudflared
4. トンネル名を入力（例: `cf-tunnel-ingress-controller`）

## セットアップ手順

### 1. ArgoCD Application の設定ファイルを編集

`manifests/2-cloudflare-ingress-controller/argocd/cloudflare-tunnel-ingress-controller.yml` を編集します。

```yaml
cloudflare:
  apiToken: YOUR_API_TOKEN  # Cloudflare API トークン
  accountId: YOUR_ACCOUNT_ID  # Cloudflare アカウント ID
  tunnelName: cf-tunnel-ingress-controller  # 作成したトンネル名
```

### 2. ArgoCD でデプロイ

```bash
argocd app create --file ../../manifests/2-cloudflare-ingress-controller/argocd/cloudflare-tunnel-ingress-controller.yml
```

### 3. 動作確認

コントローラーが正常に起動していることを確認します。

```bash
# Pod の状態を確認
kubectl get pods -n cloudflare-tunnel-ingress-controller

# ログを確認
kubectl logs -n cloudflare-tunnel-ingress-controller deployment/cloudflare-tunnel-ingress-controller
```

## Ingress リソースの作成例

Cloudflare Ingress Controller を使用した Ingress リソースの例：

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: example-ingress
  annotations:
    kubernetes.io/ingress.class: cloudflare-tunnel
spec:
  rules:
  - host: example.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: example-service
            port:
              number: 80
```

## トラブルシューティング

### トンネルが接続されない

- API トークンの権限を確認
- トンネル名が正しいか確認
- Cloudflare ダッシュボードでトンネルの状態を確認

### DNS レコードが作成されない

- API トークンに `Zone:DNS:Edit` 権限があるか確認
- ドメインが Cloudflare で管理されているか確認

### Pod が起動しない

```bash
# Pod の状態を確認
kubectl describe pod -n cloudflare-tunnel-ingress-controller <pod-name>

# イベントログを確認
kubectl get events -n cloudflare-tunnel-ingress-controller --sort-by='.lastTimestamp'
```

## 参考リンク

- [Cloudflare Tunnel Ingress Controller GitHub](https://github.com/STRRL/cloudflare-tunnel-ingress-controller)
- [自宅 kubernetes で cloudflare-tunnel-ingress-controller を使ってお手軽外部公開](https://zenn.dev/yh/articles/11823e77bd4379)
- [Cloudflare Tunnel 公式ドキュメント](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)

