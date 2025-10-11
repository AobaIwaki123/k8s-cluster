# Cloudflare Tunnel Ingress Controller の ArgoCD Application 設定
# Kubernetes クラスターへの外部アクセスを Cloudflare Tunnel 経由で提供
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: cloudflare-tunnel-ingress-controller
  namespace: argocd
spec:
  # ArgoCD プロジェクト設定
  project: default
  
  # Helm チャートのソース設定
  source:
    repoURL: https://helm.strrl.dev
    chart: cloudflare-tunnel-ingress-controller
    targetRevision: 0.0.12  # 使用する Helm チャートのバージョン
    
    helm:
      valuesObject:
        cloudflare:
          # Cloudflare API トークン - Zone:DNS:Edit, Account:Cloudflare Tunnel:Edit 権限が必要
          apiToken: ${CLOUDFLARE_API_TOKEN}
          # Cloudflare アカウント ID
          accountId: ${CLOUDFLARE_ACCOUNT_ID}
          # Cloudflare Tunnel 名 - 事前に Cloudflare ダッシュボードで作成が必要
          tunnelName: ${CLOUDFLARE_TUNNEL_NAME}

  # デプロイ先の設定
  destination:
    server: https://kubernetes.default.svc  # ローカル Kubernetes クラスター
    namespace: cloudflare-tunnel-ingress-controller
  
  # 自動同期の設定
  syncPolicy:
    automated:
      prune: true     # 不要なリソースを自動削除
      selfHeal: true  # ドリフトを自動修正
    syncOptions:
      - CreateNamespace=true    # Namespace が存在しない場合は自動作成
      - ServerSideApply=true   # Server-side apply を使用してリソースの競合を回避

