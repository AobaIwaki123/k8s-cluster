# Istio について

## 概要

Istio は Kubernetes 上のサービスメッシュプラットフォームです。ネットワークトラフィックを一元管理し、インフラストラクチャの簡素化と運用コストの削減を実現します。

### 主なメリット

- **トラフィック管理の一元化**: Istio Gateway を使用して1つの Route53 から無数9999のアプリケーションにトラフィックを分散可能
- **インフラ構成の簡素化**: アプリケーション毎に Route53、Load Balancer、Target Group を作成する必要がなくなる
- **運用コストの削減**: リソースの統合管理により管理負荷を軽減

### 実例

以下は Sansan 社の例です：

> 昨年末にアクセス頻度の低いアプリケーション・APIのサーバーレス化を行うため、CircuitにKnative Servingを導入することになりました。その際、Knativeのnetwork componentとしてIstioを使うことに決めました。
>
> Istioは、トラフィックを制御するための機能を提供しています。 Istio用のRoute53とIngressさえ用意しておけば、アプリケーション向きのトラフィックをIstio ingress gatewayに経由させることで、各アプリケーションのためにいちいちRoute53, Load Balancer, Target Groupなどを作成する必要がなくなります。  
> — [blue/green戦略によるKubernetesクラスタ更新時にIstioの対応方法 - Sansan](https://buildersbox.corp-sansan.com/entry/2024/07/05/110000)


## 参考資料

- [blue/green戦略によるKubernetesクラスタ更新時にIstioの対応方法 - Sansan](https://buildersbox.corp-sansan.com/entry/2024/07/05/110000)
- [Istio入門 - Speaker Deck](https://speakerdeck.com/nutslove/istioru-men)
- [Istio/Datadog を活用したオブザーバビリティの実践 | CADC 2024 - Cyber Agent](https://youtu.be/pTcQx60Kg_A)
