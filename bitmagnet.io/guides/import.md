---
title: 导入
description: 将种子导入 bitmagnet
parent: 指南
layout: default
nav_order: 6
redirect_from:
  - /tutorials/importing.html
  - /tutorials/import.html
---

# 导入

{: .warning-title }

> 重要
>
> 在继续本教程之前，请先[获取并配置个人 TMDB API 密钥，或禁用 TMDB API 集成]({% link setup/configuration.md %}#obtaining-a-tmdb-api-key)。

**bitmagnet** 提供了一个 `/import` 导入端点，可用于从任何来源导入 Torrent 文件。

{: .note }

> 该端点需要一个合适的 schema，并且需要改进输入校验。目前还没有办法连同种子内包含的文件信息一起导入（在 **bitmagnet** 中这是可选的）。如果导入的种子随后被 DHT 爬虫发现，其相关文件信息会在那时保存。

## 示例：RARBG 备份导入

本教程以 RARBG 的 SQLite 备份为例，你也可以根据自己的数据源进行适配。

{: .note-title }

> 前置条件
>
> - [x] 你已[获取并配置个人 TMDB API 密钥，或禁用 TMDB API 集成]({% link setup/configuration.md %}#obtaining-a-tmdb-api-key)
> - [x] 你已获得 RARBG SQLite 备份（无法协助你获取，但通常可以找到）
> - [x] 你已[安装 SQLite3 CLI](https://www.tutorialspoint.com/sqlite/sqlite_installation.htm)
> - [x] 你已[安装 jq](https://jqlang.github.io/jq/download/)

首先，在名为 `rarbg-import.sql` 的文件中编写如下 SQLite 查询。它会提取我们需要的数据，并将其格式化为 **bitmagnet** 期望的样子。以下内容仅供参考，请根据实际需求调整：

```sql
select
  hash as infoHash,
  title as name,
  size,
-- 将 RARBG 分类映射为有效的 bitmagnet 内容类型：
  case
    when cat like 'ebooks%' then 'ebook'
    when cat like 'games%' then 'software'
    when cat like 'movies%' then 'movie'
    when cat like 'tv%' then 'tv_show'
    when cat like 'music%' then 'music'
    when cat like 'software%' then 'software'
    when cat = 'xxx' then 'xxx'
  end as contentType,
-- 如果已知内容特征，可提前赋值，便于分类器识别：
  case
    when cat like '%_4k' then 'V2160p'
    when cat like '%_720' then 'V720p'
    when cat like '%_SD' then 'V480p'
  end as videoResolution,
  case
    when cat like '%_bd_%' then 'BluRay'
  end as videoSource,
  case
    when cat like '%_bd_full' then 'BRDISK'
    when cat like '%_bd_remux' then 'REMUX'
  end as videoModifier,
  case
    when cat like '%_x264%' then 'x264'
    when cat like '%_x265%' then 'x265'
    when cat like '%_xvid%' then 'XviD'
  end as videoCodec,
  case
    when cat like '%_3D' then 'V3D'
  end as video3D,
  imdb,
-- 将 dt 字段转换为有效的 ISO 日期字符串：
  (substr(dt, 0, 11) || 'T' || substr(dt, 12) || '.000Z') as publishedAt
  from items
  where

-- 以下筛选条件可选；
-- 建议根据兴趣筛选类别，
-- 在导入阶段过滤掉不需要和低质量内容可提升体验
    cat not like '%_720' and
    cat not like '%_SD' and
    cat not like 'software%' and
    cat not like 'games%' and
-- 如果你不想过滤成人内容，可注释掉下面这行；
-- 但请注意 RARBG 备份中此类内容非常多
    cat != 'xxx' and

--
    true
-- 随机但确定性的排序可减少解析器重复工作概率：
  order by infoHash

-- 测试查询时可启用以下行
-- limit 100
```

你可以在喜欢的数据库工具中运行此查询，或使用 SQLite3 CLI。

目前我们已将数据初步整理成所需格式。接下来还需做一些调整，然后通过管道传递给 **bitmagnet** 的 `/import` 端点。你需要根据实际情况修改以下命令，然后粘贴到终端或作为 bash 脚本运行：

```sh
sqlite3 -json -batch /path/to/your/rarbg_db.sqlite "$(cat rarbg-import.sql)" \
  | jq -r --indent 0 '.[] | . * { source: "rarbg" } | . + if .imdb != null then { contentSource: "imdb", contentId: .imdb } else {} end | del(.imdb) | del(..|nulls)' \
  | curl --verbose -H "Content-Type: application/json" -H "Connection: close" --data-binary @- http://localhost:3333/import
```

这里发生了什么？

- 首先，我们用上面的 SQL 查询对备份数据库进行查询，并让 SQLite 以 JSON 格式输出结果。你可以单独运行 `sqlite3 -json -batch /path/to/your/rarbg_db.sqlite "$(cat rarbg-import.sql)"` 测试（测试时建议加上 `limit`，如 10 或 100）
- 接着，我们用 [jq](https://jqlang.github.io/jq/) 对 JSON 结构做进一步处理。可以先只加 `| jq` 这部分测试效果。主要操作有：
  - 添加 `source` 字段，值为 `rarbg`：每个存储在 **bitmagnet** 的种子都关联一个或多个来源，便于搜索和携带来源特定信息（如导入 ID、做种/下载数等，后续文档会补充）
  - 添加 **bitmagnet** 期望的 `contentSource` 和 `contentId` 字段，内容为 IMDB ID（如存在）；这不是必填项，但如果已知内容的 IMDB 或 TMDB ID，有助于分类器识别
  - 删除 **bitmagnet** 不识别的 `imdb` 字段
  - 删除所有 `null` 值，减小数据体积
- 最后，将处理后的结果通过管道传递给 **bitmagnet** 的 `/import` 端点；导入过程中会有反馈，注意日志中的错误信息！

导入总耗时取决于记录数量和硬件性能。以 M2 MacBook Air 导入 150 万条记录为例，大约需要 10 分钟。

导入开始后，你应能在 Web UI 中立即看到新条目。但这还没结束；每个导入的条目还会被送入分类队列以进一步丰富元数据。随着队列处理，你会在 Web UI 看到更多细节。如果导入量很大，队列处理可能需要数小时。一旦某部电影或剧集的元数据保存后，后续无需再请求 TMDB，因此队列会随着本地元数据的积累而加速。
