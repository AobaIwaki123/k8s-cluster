# ストレージ方針

## 現在の状態

現行のクラスター共通ストレージは Rook Ceph です。
NFS サーバーはまだ存在しないため、このリポジトリには NFS CSI driver、StorageClass、
NFS サーバーの Deployment を追加しません。NFS は Rook Ceph をすぐに置き換えるのではなく、
運用負荷を下げたい場合の将来候補として扱います。

## Rook Ceph と NFS の使い分け

| 観点 | Rook Ceph | 外部 NFS |
| --- | --- | --- |
| 管理対象 | クラスター内の Ceph 接続定義と Ceph 側 | 別ホストの NFS サーバーと export |
| 長所 | ブロック・ファイル系を含めた拡張性、冗長化の選択肢 | 導入・障害対応が比較的単純、ReadWriteMany を使いやすい |
| 注意点 | Ceph の構成・容量・障害対応が必要 | NFS サーバーが単一障害点になりやすく、性能とバックアップを別途設計 |
| 当面の扱い | 現行正本として維持 | 未導入。導入後に個別 StorageClass で検証 |

NFS を導入しても、既存 PVC を自動移行しません。既存データのバックアップ、
復元テスト、停止時間、アプリケーションが必要とする access mode を確認したうえで、
PVC 単位の移行を別変更にします。

## NFS 導入の前提

NFS CSI driver は、すでに構成済みの NFSv3 または NFSv4 サーバーを必要とします。
最初に次を決めます。

- NFS サーバーの可用性、ディスク構成、バックアップ、復旧先
- Kubernetes ノードから到達する管理ネットワークと export パス
- 許可するクライアント範囲。kubelet ノード以外には export しない
- NFSv4.1 を使うか、UID/GID と root squash の扱い
- 永続データと一時データの reclaimPolicy
- NFS 障害中にアプリケーションを停止するのか、読み取り専用で復旧するのか

NFS の export は、サーバー側のアクセス制御だけでなく、ノード側の firewall でも限定します。
共有パスを外部公開用のドキュメントやダッシュボードへ出してはいけません。

## 推奨する Kubernetes 側の構成

Kubernetes の NFS dynamic provisioning は外部 provisioner が必要です。
候補は Kubernetes SIG Storage の NFS CSI driver です。

- CSI driver: nfs.csi.k8s.io
- Helm repository: https://kubernetes-csi.github.io/csi-driver-nfs
- Chart: csi-driver-nfs
- 公式説明: https://github.com/kubernetes-csi/csi-driver-nfs

NFS サーバーが準備できた時点で、次の順に GitOps 定義を追加します。

1. cluster/addons/storage/nfs-csi/ に Argo CD Application を追加する。
2. Chart version を固定し、kube-system に driver を導入する。
3. NFS サーバーの server と share を参照する StorageClass を追加する。
4. 最初は default StorageClass にせず、専用 PVC で smoke test を行う。
5. 書き込み、再マウント、Pod 再配置、ノード停止、バックアップ復元を確認する。
6. 既存 Ceph の代替として使う範囲を決め、必要な PVC だけを移行する。

将来の Application で使う values の骨格は次のとおりです。実際の server、share、
Chart version は NFS サーバーの準備が完了してから確定します。

~~~yaml
source:
  repoURL: https://kubernetes-csi.github.io/csi-driver-nfs
  chart: csi-driver-nfs
  targetRevision: <pinned-version>
  helm:
    valuesObject:
      storageClasses:
        - name: nfs-retain
          parameters:
            server: <nfs-server-dns-or-address>
            share: <nfs-export-path>
          reclaimPolicy: Retain
          volumeBindingMode: Immediate
          mountOptions:
            - nfsvers=4.1
~~~

最初の StorageClass は Retain を基本にします。キャッシュや再作成可能な一時データだけを
別の Delete 用 StorageClass に分け、デフォルト化はバックアップと復旧を確認した後に判断します。
PVC 側では用途に応じて storageClassName を明示し、暗黙のデフォルト依存を避けます。

## 導入時の確認例

NFS サーバーを用意した後、Secret や実データを出力しない範囲で次を確認します。

~~~bash
kubectl get nodes -o wide
kubectl get csidrivers nfs.csi.k8s.io
kubectl get storageclass
kubectl get pods -n kube-system -l app.kubernetes.io/name=csi-driver-nfs
kubectl get pvc -A
~~~

テスト PVC は専用 namespace で作り、次を確認してから実データを移します。

- Bound になること
- Pod から作成したファイルが再起動後も読めること
- 別ノードへの再スケジュール後に mount できること
- PVC 削除時の Retain / Delete の挙動が意図どおりであること
- NFS サーバーのバックアップから復元できること

この手順は設計メモであり、NFS サーバーがない現段階では kubectl apply、helm install、
StorageClass の追加を実行しません。
