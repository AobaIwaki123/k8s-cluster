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

## Response Style

- `TabSeparatedWithNamesAndTypes`: default
- `JSON_Compact`: 
- `JSON_CompactLimited`: limited 10,000 rows
- `JSONLines_Compact`: chunked versin of `JSON_CompactLimited`

### JSON Compact

```sh
$ curl -s "http://192.168.11.220:32619/?output_format=JSON_Compact" --data-binary "select 42";
?column?
int
42
{
	"query":
	{
		"query_id": "3fd26ae5-b088-4a6d-bb49-93d09983cec3",
		"request_id": "e2b8c039-b82a-413c-bd0f-cfa0fbf1a27c",
		"query_label": null
	},
	"meta":
	[
		{
			"name": "?column?",
			"type": "int"
		}
	],

	"data":
	[
		[42]
	],

	"rows": 1,

	"statistics":
	{
		"elapsed": 0.00182,
		"rows_read": 1,
		"bytes_read": 1,
		"time_before_execution": 0.000381456,
		"time_to_execute": 0.000165333,
		"scanned_bytes_cache": 0,
		"scanned_bytes_storage": 0
	}
}
```

## Ref

- [Introducing Firebolt Core - Self-Hosted Firebolt, For Free, Forever - June 24, 2025](https://www.firebolt.io/blog/introducing-firebolt-core)
- [firebolt-core - GitHub](https://github.com/firebolt-db/firebolt-core)
- [Deployment on Kubernetes - Deployment and Operational Guide](https://docs.firebolt.io/firebolt-core/firebolt-core-operation/firebolt-core-deployment-k8s)

