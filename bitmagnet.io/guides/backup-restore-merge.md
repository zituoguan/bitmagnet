---
title: 备份、恢复与合并
description: 如何备份、恢复、合并和共享 bitmagnet 数据库
parent: Guides
layout: default
nav_order: 7
redirect_from:
  - /tutorials/backup-restore-merge.html
---

# 备份、恢复与合并

定期备份 **bitmagnet** 数据库是个好主意。系统崩溃可能会导致数据库损坏，这种情况下你在启动 Postgres 时可能会看到可怕的 `PANIC: could not locate a valid checkpoint record` 错误。

也许你想将 **bitmagnet** 安装迁移到新服务器，或者你想合并两个 **bitmagnet** 实例的数据。

本教程将向你展示如何备份、恢复和合并 **bitmagnet** 数据库。

{: .note-title }

> 前置条件
>
> - [x] 你需要安装 `pg_dump` 和 `psql`。它们是 PostgreSQL 套件的一部分。请使用 Google 查找如何在你的操作系统上安装这些工具。

## 备份

{: .warning }
如果你打算将备份导入到另一个 **bitmagnet** 实例，请确保目标实例的版本与源实例相同。如果目标实例版本更高，你需要先升级源实例再进行备份。

以下命令将备份关键的 **bitmagnet** 数据，并保存到名为 `export.sql` 的文件中。（注意，这不是数据库的完整备份，不包括表、索引等的创建。）通过使用 `--data-only` 标志导出，生成的文件可以在 **bitmagnet** 运行迁移以设置数据库和表后，导入到新的或现有的安装中。

请参考 [pg_dump 官方文档](https://www.postgresql.org/docs/current/app-pgdump.html)，并确保为源数据库指定正确的参数（如 `host`、`username` 和 `password`）。

```sh
pg_dump \
        --column-inserts \
        --data-only \
        --on-conflict-do-nothing \
        --rows-per-insert=1000 \
        --table=metadata_sources \
        --table=content \
        --table=content_attributes \
        --table=content_collections \
        --table=content_collections_content \
        --table=torrent_sources \
        --table=torrents \
        --table=torrent_files \
        --table=torrent_hints \
        --table=torrent_contents \
        --table=torrent_tags \
        --table=torrents_torrent_sources \
        --table=key_values \
        bitmagnet \
        > backup.sql
```

## 恢复备份或合并到另一个 **bitmagnet** 实例

首先，确保你有一个目标 **bitmagnet** 实例正在运行，且版本与备份来源一致。

以下命令会将备份文件导入到目标数据库，并与现有数据合并。

请参考 [psql 官方文档](https://www.postgresql.org/docs/current/app-psql.html)，并确保为目标数据库指定正确的参数（如 `host`、`username` 和 `password`）。

```sh
psql bitmagnet < backup.sql
```
