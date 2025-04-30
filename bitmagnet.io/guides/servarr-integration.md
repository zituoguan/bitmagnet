---
title: Servarr 集成
description: 将 bitmagnet 与 Servarr 堆栈中的应用程序集成
parent: 指南
layout: default
nav_order: 8
redirect_from:
  - /tutorials/servarr-integration.html
---

# Servarr 集成

**bitmagnet** 的 HTTP 服务器在 `/torznab` 端点提供服务，使其能够与支持 [Torznab 规范](https://torznab.github.io/spec-1.3-draft/index.html) 的任何应用程序集成，尤其是 [Servarr 堆栈](https://wiki.servarr.com/)（如 Prowlarr、Sonarr、Radarr 等）中的应用。

## 在 Prowlarr 中添加 **bitmagnet** 作为索引器

首先，打开你的 Prowlarr 实例，点击“添加索引器”，然后从列表中选择“Generic Torznab”。

![Prowlarr 添加索引器](/assets/images/prowlarr-1.png)

所需设置非常简单。如果你已经按照 [示例 docker-compose 文件]({% link setup/installation.md %}#docker) 进行了部署，并且 Prowlarr 与 **bitmagnet** 处于同一个 Docker 网络中，那么 Prowlarr 应该可以通过 `http://bitmagnet:3333/torznab` 访问 **bitmagnet** 实例的 Torznab 端点。无需进一步配置，只需点击“测试”按钮，确保一切正常。

![Prowlarr 配置 bitmagnet](/assets/images/prowlarr-2.png)

[根据你的 Prowlarr 配置](https://wiki.servarr.com/prowlarr/settings#applications)，**bitmagnet** 索引器现在应该已经同步到你的其他 \*arr 应用程序。或者，你也可以直接在这些应用中添加 **bitmagnet** 作为索引器，步骤与上述相同。
