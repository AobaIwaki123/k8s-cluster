## Getting Started

### argocdでデプロイ

```sh
$ argocd app create --file argocd/firebolt-core.yml
```

### クエリを叩いてみる

```sh
$ kubectl port-forward firebolt-core-0 3473:3473 -n firebolt-core
```

```sh
$ curl -s "http://localhost:3473" --data-binary "select 42";
?column?
int
42
```

curl -s "http://192.168.11.212:3473" --data-binary "with tmp as (select 42 as number) select *from tmp";
## Ref

- [Introducing Firebolt Core - Self-Hosted Firebolt, For Free, Forever - June 24, 2025](https://www.firebolt.io/blog/introducing-firebolt-core)
- [firebolt-core - GitHub](https://github.com/firebolt-db/firebolt-core)
- [Deployment on Kubernetes - Deployment and Operational Guide](https://docs.firebolt.io/firebolt-core/firebolt-core-operation/firebolt-core-deployment-k8s)

