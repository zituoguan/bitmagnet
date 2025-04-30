---
title: 首页
layout: default
nav_order: -1
---

# bitmagnet

**一个自托管的 BitTorrent 索引器、DHT 爬虫和内容分类工具。**

![WebUI 截图](/assets/images/webui-1.png)

{: .warning-title }

> 重要提示
>
> 本软件目前处于 alpha 阶段。你可以抢先体验一些有趣且独特的功能，但在 1.0 正式版发布前（目前还只是理论上的），可能会有 bug，以及 API 和数据库结构的变动。如果你愿意支持本项目并帮助其发展，请 **[在 GitHub 上点个星](https://github.com/bitmagnet-io/bitmagnet)** 或 **[在 OpenCollective 上赞助](https://opencollective.com/bitmagnet)**。

## DHT 是什么？

DHT 爬虫是 **bitmagnet** 的核心特色。那么它到底是什么？

你可能知道可以在 BitTorrent 客户端中启用 DHT，这样就能通过分布式哈希表（DHT）找到发布某个种子哈希的节点，而不依赖中心化的 tracker。DHT 还有一个鲜为人知的功能：它允许你爬取它已知的 info hash。**bitmagnet** 的 DHT 爬虫正是这样工作的——它遍历 DHT 网络，获取发现的每个 info hash 的元数据，并尝试对这些元数据进行分类，关联到已知的内容（如电影和电视剧）。你可以搜索所有已索引的内容。

这意味着 **bitmagnet** 不依赖任何外部 tracker 或种子索引站。它是一个自包含、自托管的种子索引器，通过 DHT 连接到全球节点网络，不断发现新内容。

## 功能与路线图

### 已实现功能

- [x] DHT 爬虫及协议实现
- [x] 通用 BitTorrent 索引器：**bitmagnet** 可索引来自任何来源的种子，不仅限于 DHT 网络——目前仅支持通过 [`/import` 接口](/guides/import.html) 导入；更友好的方式正在开发中，见下方高优先级功能
- [x] 高度可定制的 <a href="/guides/classifier.html">内容分类器</a>，可识别多种内容类型及相关属性（如语言、分辨率、来源等），并结合 [The Movie Database](https://www.themoviedb.org/) 等数据源丰富信息
- [x] [支持从任意来源导入种子，例如 RARBG 备份](/guides/import.html)
- [x] 种子搜索引擎
- [x] GraphQL API：目前提供单一搜索查询，内置 GraphQL playground（`/graphql`）
- [x] 响应式多语言 Web UI（Angular 实现）
- [x] [兼容 Torznab 的接口，方便与 Serverr 生态集成](/guides/servarr-integration.html)
- [x] WebUI 仪表盘，便于监控和管理

### 高优先级待实现功能

- [ ] 认证、API 密钥、访问级别等
- [ ] 收藏搜索，支持自定义订阅源
- [ ] 与 [Prowlarr 索引代理](https://prowlarr.com/) 双向集成：目前可将 **bitmagnet** 作为 Prowlarr 的索引器，未来计划支持从 Prowlarr 配置的任意索引器爬取内容，解锁更多内容来源

### 未来畅想功能

这些想法目前还很模糊，现阶段专注于核心功能，但未来可能会探索：

- [ ] 原地做种：识别本地与已索引种子相关的文件，支持在移动、重命名或删除部分文件后继续做种
- [ ] 集成主流 BitTorrent 客户端
- [ ] 联邦模式：允许好友互联实例，共享索引工作，或通过众包补充自动分类器
- [ ] 类去中心化私人 tracker：基于个人信任和手动筛选，避免出现像 [Tribler](https://github.com/Tribler/tribler) 那样协议层实现信任和隐私带来的高开销
- [ ] 支持 [BitTorrent v2 协议](https://blog.libtorrent.org/2020/09/bittorrent-v2/)：是否值得加入，取决于后续生态发展
