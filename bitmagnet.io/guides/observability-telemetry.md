---
title: 可观测性与遥测
description: bitmagnet 的可观测性与遥测功能
parent: Guides
layout: default
nav_order: 9
redirect_from:
  - /internals-development/observability-telemetry.html
---

# 可观测性与遥测

## Grafana 堆栈与 Prometheus 集成

**bitmagnet** 可以与 [Grafana 堆栈](https://grafana.com/) 和 [Prometheus](https://prometheus.io/) 集成，用于监控和为 DHT 爬虫及其他组件构建可观测性仪表盘。请参阅 [示例 docker compose 配置](https://github.com/bitmagnet-io/bitmagnet/blob/main/docker-compose.yml) 的“可选可观测性服务”部分，以及[示例 Grafana / Prometheus 配置文件和预配置的 Grafana 仪表盘](https://github.com/bitmagnet-io/bitmagnet/tree/main/observability)。

![Grafana 仪表盘](/assets/images/grafana-1.png)

示例集成包括：

- [Grafana](https://grafana.com/oss/grafana/) - 仪表盘和可视化工具
- [Grafana Agent](https://grafana.com/oss/agent/) - 收集指标和日志，并转发到存储后端
- [Prometheus](https://prometheus.io/) - 指标的时序数据库
- [Loki](https://grafana.com/oss/loki/) - 日志聚合系统
- [Pyroscope](https://pyroscope.io/) - 持续分析工具
- [Postgres exporter](https://github.com/prometheus-community/postgres_exporter) - 向 Prometheus 暴露 Postgres 指标

# 使用 pprof 进行性能分析

**bitmagnet** 在 `/debug/pprof/*` 处暴露了 [Go pprof](https://golang.org/pkg/net/http/pprof/) 性能分析端点，例如：

```sh
go tool pprof http://localhost:3333/debug/pprof/heap
```
