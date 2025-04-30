---
title: 配置
description: bitmagnet 的配置选项
parent: 设置
layout: default
nav_order: 2
---

# 配置

**bitmagnet** 提供了许多配置选项。大多数情况下你无需关心它们，但如果需要自定义，可以进行调整。如果你使用的是[示例 docker-compose 文件]({% link setup/installation.md %}#docker)，那么一切 _应该_ 都能“开箱即用”。这里仅介绍一些重要的配置项：

- `postgres.host`、`postgres.name`、`postgres.user`、`postgres.password`（默认值：`localhost`、`bitmagnet`、`postgres`、_空_）：用于配置 Postgres 数据库的连接信息。
- `postgres.dsn`：也可以直接指定 Postgres 数据源名称（DSN）。如果设置了该项，其他 `postgres.*` 选项将被忽略。
- `tmdb.api_key`：这是一个非常重要的配置项，详情请[见下文](#获取-tmdb-api-key)。
- `tmdb.enabled`（默认值：`true`）：设置为 `false` 可禁用 TMDB API 集成。
- `dht_crawler.save_files_threshold`（默认值：`100`）：部分种子包含成千上万个文件，会影响性能并占用大量数据库空间。此参数用于设置爬虫每个种子保存的最大文件数。
- `dht_crawler.save_pieces`（默认值：`false`）：若为 true，DHT 爬虫会保存种子元数据中的 pieces 字节。pieces 占用空间较大，目前用处不大，但未来可能会用到。
- `log.level`（默认值：`info`）：如果你在开发或想查看更多信息，可以设置为 `debug`；但 `debug` 输出会非常详细。
- `log.development`（默认值：`false`）：开发时可启用此选项，输出更详细的信息如堆栈跟踪。
- `log.json`（默认值：`false`）：默认日志为彩色美化格式；如需纯 JSON 格式，可启用此选项。
- `log.file_rotator.enabled`（默认值：`false`）：若为 true，日志将以轮转文件方式输出到 `log.file_rotator.path` 目录下，日志级别为 `log.file_rotator.level`，便于转发到日志聚合器（参见[可观测性指南](/guides/observability-telemetry.html)）。
- `http_server.options`（默认值 `["*"]`）：启用的 HTTP 服务器组件列表，默认全部启用。组件包括：`cors`、`pprof`、`graphql`、`import`、`prometheus`、`torznab`、`status`、`webui`。
- `dht_crawler.scaling_factor`（默认值：`10`）：DHT 爬虫有多种速率和并发限制。此参数大致反映爬虫的资源使用情况；各管道通道的并发和缓冲区大小会乘以该值。超过默认值 10 后，提升效果会递减。由于尚未在各种硬件和网络环境下广泛测试，实际效果可能有所不同。
- `processor.concurrency`（默认值：`1`）：定义同时处理/分类的最大种子数。默认值 `1` 适用于大多数系统。提高该值（如设为 `3`）可能提升处理队列吞吐量，但在性能较低的系统上可能导致变慢。

如需通过 CLI 查看所有可用配置项，请运行：

```sh
bitmagnet config show
```

{% include callout_cli.md %}

该命令会显示每个配置参数的以下信息：

- 配置键路径
- Go 类型
- 当前配置值
- 默认值
- 当前值的来源（如 `default`、`./config.yml`、`env`）

## 指定配置值

配置路径用点号分隔。如果在 YAML 文件中指定配置，每个点代表一层嵌套，例如配置 `log.json`、`tmdb.api_key` 和 `http_server.cors.allowed_origins`：

```yaml
log:
  json: true
tmdb:
  api_key: my-api-key
http_server:
  cors:
    allowed_origins:
      - https://example1.com
      - https://example2.com
```

{: .note }
这不是建议的配置文件，仅用于演示如何指定配置值。

如需通过环境变量配置这些值，将路径转为大写并用下划线替换点号，例如：

```sh
LOG_JSON=true \
TMDB_API_KEY=my-api-key \
HTTP_SERVER_CORS_ALLOWED_ORIGINS=https://example1.com,https://example2.com \
  bitmagnet config show
```

## 配置优先级

配置值的读取顺序如下（优先级从高到低）：

- 环境变量
- `EXTRA_CONFIG_FILES` 环境变量中指定的逗号分隔配置文件列表
- 当前工作目录下的 `config.yml`
- 当前用户 [XDG 规范](https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html) 配置路径下的 `config.yml`（如 MacOS 下为 `~/Library/Application Support/bitmagnet/config.yml`）
- 默认值

{: .warning }
环境变量可用于配置简单的标量类型（字符串、数字、布尔值）和数组类型。更复杂的类型（如 map）需使用 YAML 配置。若无法解析配置值，**bitmagnet** 会报错并退出。

## VPN 配置

建议你在 VPN 环境下运行 **bitmagnet**。如果使用 Docker，[gluetun](https://github.com/qdm12/gluetun-wiki) 是一个不错的选择，但网络设置可能较为复杂。[示例 docker-compose 文件](https://github.com/bitmagnet-io/bitmagnet/blob/main/docker-compose.yml) 已做了演示。

## 获取 TMDB API Key

{: .highlight }
**bitmagnet** 使用 [TMDB API](https://developer.themoviedb.org/docs) 获取影视元数据。默认情况下你会与其他用户共用 API key。如果你大量使用本应用及其内容分类功能，建议申请个人 TMDB API key。否则启动时日志会有警告，并且 TMDB API 请求速率被限制为每秒 1 次。这个速率仅够 DHT 爬虫使用，如果你需要大量导入和分类内容，这会成为瓶颈。若多人共用默认 key，请尽量申请个人 key！

申请 API key 免费且相对简单，但需注册 TMDB 账号，填写一些个人信息，如联系方式、网站 URL（可用 GitHub 或社交媒体主页），以及简短的用途描述（**提示：**本应用用途可写为 _"A content classifier that identifies movies and TV shows based on filenames"_）。提交申请后通常会立即获批。

[群晖 Synology 提供了完整的 TMDB API key 申请教程](https://kb.synology.com/en-au/DSM/tutorial/How_to_apply_for_a_personal_API_key_to_get_video_info)。

获得 API key 后，将其配置到 `tmdb.api_key`。此时你的速率限制将提升至每秒 20 次，远高于 [TMDB 官方建议的公平使用限额](https://developer.themoviedb.org/docs/rate-limiting)。

{: .highlight }
如需完全禁用 TMDB API 集成，可将 `tmdb.enabled` 设为 `false`。
