---
title: 技术栈
description: bitmagnet 使用的技术栈
parent: 指南
layout: default
nav_order: 10
redirect_from:
  - /internals-development.html
  - /internals-development/dht-crawler.html
  - /internals-development/tech-stack.html
---

# 技术栈

{: .highlight }
你是一位熟悉 GoLang、Postgres、TypeScript/Angular 或 BitTorrent 协议的开发者吗？目前我是唯一的开发者，同时有全职工作和许多其他事务，这个项目是我在业余时间开发的，已经持续了几个月。这个项目太大了，一个人难以完成！如果你有兴趣参与，请[查看 open issues](https://github.com/bitmagnet-io/bitmagnet/issues)，欢迎随时提交 PR！

## Postgres

Postgres 是主要的数据存储，支持搜索引擎和消息队列。这些功能依赖于多个 Postgres 特有的特性和扩展，因此支持其他存储引擎会比较复杂，目前不是优先事项。

## GoLang 后端

主要使用的库包括：

- [anacrolix/torrent](https://github.com/anacrolix/torrent)：目前用得不多，但包含许多有用的 BitTorrent 工具，未来可用于实现如原地做种等功能
- [fx](https://uber-go.github.io/fx/)：用于依赖注入和应用生命周期管理
- [gin](https://gin-gonic.com/)：HTTP 服务器
- [goose](https://pressly.github.io/goose/)：数据库迁移
- [gorm](https://gorm.io/)：数据库访问
- [gqlgen](https://gqlgen.com/)：GraphQL 服务器实现
- [rex](https://github.com/hedhyw/rex)：正则表达式库，使复杂的分类正则表达式更易管理
- [urfave/cli](https://cli.urfave.org/)：命令行接口
- [zap](https://github.com/uber-go/zap)：日志记录

## TypeScript/Angular Web UI

使用 [Angular Material 组件](https://material.angular.io/)。Web UI 被嵌入到 GoLang 二进制文件中，并由 Gin Web 框架提供服务，因此构建产物会提交到仓库。

## Nix 开发环境

仓库内包含 Nix shell，可提供可复现的开发环境。只需[安装 Nix](https://nixos.org/download/)，然后运行 `nix develop`（推荐使用 [nix-direnv](https://github.com/nix-community/nix-direnv) 自动加载 shell）。

## 其他工具

- 仓库包含一个 [Taskfile](https://taskfile.dev/)，内含多种实用开发脚本
- 使用 GitHub Actions 进行 CI、构建 Docker 镜像和本网站

## DHT 爬虫的架构与生命周期

DHT 和 BitTorrent 协议的文档（较为晦涩）可在 [bittorrent.org](http://bittorrent.org/beps/bep_0000.html) 查阅。相关资源包括：

- [BEP 5: DHT 协议](http://bittorrent.org/beps/bep_0005.html)
- [BEP 51: Infohash 索引](https://www.bittorrent.org/beps/bep_0051.html)
- [BEP 33: DHT 抓取](https://www.bittorrent.org/beps/bep_0033.html)
- [BEP 10: 扩展协议](https://www.bittorrent.org/beps/bep_0010.html)
- [Kademlia 论文](https://pdos.csail.mit.edu/~petar/papers/maymounkov-kademlia-lncs.pdf)

我对 DHT 爬虫实现的理解主要参考了 [已归档的 **magnetico** 项目](https://github.com/boramalper/magnetico) 和 [anacrolix 的 BitTorrent 库](https://github.com/anacrolix)。
