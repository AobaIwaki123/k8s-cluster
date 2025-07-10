## Istioについて

> 昨年末にアクセス頻度の低いアプリケーション・APIのサーバーレス化を行うため、CircuitにKnative Servingを導入することになりました。 その際、Knativeのnetwork componentとしてIstioを使うことに決めました。  
> ...  
> Istioは、トラフィックを制御するための機能を提供しています。 Istio用のRoute53とIngressさえ用意しておけば、アプリケーション向きのトラフィックをIstio ingress gatewayに経由させることで、各アプリケーションのためにいちいちRoute53, Load Balancer, Target Groupなどを作成する必要がなくなります。
> [blue/green戦略によるKubernetesクラスタ更新時にIstioの対応方法 - Sansan](https://buildersbox.corp-sansan.com/entry/2024/07/05/110000)

- Istioはk8sのネットワークモジュール
- 1つのRoute53からの通信をIstioで分散できる
  - 構成のシンプル化
  - 運用コスト削減

## Ref

-  [blue/green戦略によるKubernetesクラスタ更新時にIstioの対応方法 - Sansan](https://buildersbox.corp-sansan.com/entry/2024/07/05/110000)
-  [Istio入門 - Speaker Deck](https://speakerdeck.com/nutslove/istioru-men)
-  [Istio/Datadog を活用したオブザーバビリティの実践 | CADC 2024 - Cyber Agent](https://youtu.be/pTcQx60Kg_A)
