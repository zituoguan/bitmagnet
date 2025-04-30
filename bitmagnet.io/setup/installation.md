---
title: 安装
description: bitmagnet 的安装说明
parent: Setup
layout: default
nav_order: 1
---

# 安装

## Docker

使用 [Docker Compose](https://docs.docker.com/compose/) 是最快速启动 **bitmagnet** 的方式。以下 `docker-compose.yml` 是一个最小示例。如需包含 VPN 路由和可观测性服务的更完整示例，请参见 [GitHub 仓库中的 docker compose 配置](https://github.com/bitmagnet-io/bitmagnet/blob/main/docker-compose.yml)。

```yml
services:
  bitmagnet:
    image: ghcr.io/bitmagnet-io/bitmagnet:latest
    container_name: bitmagnet
    ports:
      # API 和 WebUI 端口:
      - "3333:3333"
      # BitTorrent 端口:
      - "3334:3334/tcp"
      - "3334:3334/udp"
    restart: unless-stopped
    environment:
      - POSTGRES_HOST=postgres
      - POSTGRES_PASSWORD=postgres
    #      - TMDB_API_KEY=your_api_key
    volumes:
      - ./config:/root/.config/bitmagnet
    command:
      - worker
      - run
      - --keys=http_server
      - --keys=queue_server
      # 禁用下一行可在无 DHT 爬虫的情况下运行
      - --keys=dht_crawler
    depends_on:
      postgres:
        condition: service_healthy

  postgres:
    image: postgres:16-alpine
    container_name: bitmagnet-postgres
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    #    ports:
    #      - "5432:5432" 如需访问数据库可开放此端口
    restart: unless-stopped
    environment:
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=bitmagnet
      - PGUSER=postgres
    shm_size: 1g
    healthcheck:
      test:
        - CMD-SHELL
        - pg_isready
      start_period: 20s
      interval: 10s
```

运行 `docker compose up -d` 后，你应该可以通过 `http://localhost:3333` 访问 Web 界面。DHT 爬虫会自动启动，大约一分钟内你会在 Web UI 中看到条目出现。

如需升级安装，可以运行：

```sh
docker compose down bitmagnet
docker pull ghcr.io/bitmagnet-io/bitmagnet:latest
docker compose up -d bitmagnet
```

## go install

你也可以通过 `go install github.com/bitmagnet-io/bitmagnet` 原生安装 **bitmagnet**。如果选择此方法，你需要[配置]({% link setup/configuration.md %})（至少）一个 Postgres 实例供 bitmagnet 连接。

## 运行 CLI

**bitmagnet** CLI 是应用程序的入口。请根据你的安装方式注意运行 CLI 所需的命令。

- 如果你使用上述 docker-compose 示例，可以在服务启动后通过 `docker exec -it bitmagnet bitmagnet` 运行 CLI。
- 如果你通过 `go install` 安装 bitmagnet，可以直接用 `bitmagnet` 运行 CLI。

在后续文档中，CLI 命令统一用 `bitmagnet` 表示；请根据实际情况替换为正确的命令。例如，查看 CLI 帮助信息：

```sh
bitmagnet --help
```

## 启动 **bitmagnet**

**bitmagnet** 以多个 worker 进程运行，可以单独启动，也可以一次性全部启动。要启动所有 worker，请运行：

```sh
bitmagnet worker run --all
```

或者，指定要启动的单个 worker：

```sh
bitmagnet worker run --keys=http_server,queue_server,dht_crawler
```
