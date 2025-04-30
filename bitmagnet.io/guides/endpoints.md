---
title: 端点
parent: 指南
layout: default
nav_order: 1
redirect_from:
  - /endpoints.html
---

# **bitmagnet** 端点

**bitmagnet** 提供了多个端点以实现不同功能：

- `/` - 重定向到 `/webui`
- `/webui` - 主网页用户界面
- `/graphql` - GraphQL API，包括 GraphiQL 浏览器界面
- `/torznab/*` - Torznab API，用于兼容的集成应用
- `/import` - 导入 API，用于向库中添加新内容（参见[导入指南](/guides/import.html)）
- `/metrics` - Prometheus 指标（参见[可观测性指南](/guides/observability-telemetry.html)）
- `/debug/pprof/*` - Go pprof 性能分析端点（参见[可观测性指南](/guides/observability-telemetry.html)）
- `/status` - 健康检查/状态端点
