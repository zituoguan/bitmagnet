---
title: 分类器
description: 了解和自定义 bitmagnet 的分类器
parent: 指南
layout: default
nav_order: 4
redirect_from:
  - /tutorials/classifier.html
---

# 分类器

{: .note-title }

> 简要说明：
>
> 分类器可以配置和自定义，实现如下功能：
>
> - 自动删除你不想收录的种子
> - 为你感兴趣的种子添加自定义标签
> - 自定义用于判断种子内容类型的关键词和文件扩展名
> - 指定完全自定义的逻辑，对种子进行分类和其他操作
>
> 跳转到[实际用例与示例](#实际用例与示例)

## 背景

在种子被爬取或导入后，需要进一步处理以收集元数据、猜测种子内容，最终将其索引到数据库中，便于在 UI/API 中搜索和展示。

**bitmagnet** 的分类器基于[领域特定语言（DSL）](https://en.wikipedia.org/wiki/Domain-specific_language)实现，旨在提供高度可定制性和分类过程的透明性，便于协作改进核心分类逻辑。

分类器以 YAML 格式声明。应用内置了一个[核心分类器](https://github.com/bitmagnet-io/bitmagnet/blob/main/internal/classifier/classifier.core.yml)，你可以对其进行配置、扩展或完全替换为自定义分类器。本文档说明了所需格式。

## 源优先级

**bitmagnet** 会尝试从以下所有位置加载分类器源码。发现的分类器源码会按如下优先级合并：

- [核心分类器](https://github.com/bitmagnet-io/bitmagnet/blob/main/internal/classifier/classifier.core.yml)
- 当前用户的 [XDG 兼容](https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html) 配置目录下的 `classifier.yml`（如 MacOS 下为 `~/Library/Application Support/bitmagnet/classifier.yml`）
- 当前工作目录下的 `classifier.yml`
- [分类器配置](#配置)

注意，多个来源会合并而不是替换。例如，配置中添加的关键词会与核心关键词合并。

合并后的分类器源码可通过 CLI 命令 `bitmagnet classifier show` 查看。

{% include callout_cli.md %}

## 模式（Schema）

提供了[分类器的 JSON schema](https://bitmagnet.io/schemas/classifier-0.1.json)；部分编辑器和 IDE 可通过指定 `$schema` 属性校验你的分类器文档结构：

```yaml
$schema: https://bitmagnet.io/schemas/classifier-0.1.json
```

也可通过 CLI 命令 `bitmagnet classifier schema` 查看分类器 schema。

{% include callout_cli.md %}

分类器声明包含以下组件：

## 工作流（Workflows）

工作流是将在所有种子分类时执行的[动作](#动作)列表。当未提供自定义配置时，将运行 `default` 工作流。若要使用其他工作流，请通过 `classifier.workflow` 配置项指定自定义工作流名称。

## 动作（Actions）

动作是要执行的[工作流](#工作流)片段。所有动作要么返回更新后的分类结果，要么返回错误。

例如，以下动作会将当前种子的内容类型设为 `audiobook`：

```yaml
set_content_type: audiobook
```

以下动作会返回 `unmatched` 错误：

```yaml
unmatched
```

以下动作会删除当前正在分类的种子（返回 `delete` 错误）：

```yaml
delete
```

这些动作单独用处不大——通常需要在满足某些条件时才设置内容类型或删除种子，这时可用 `if_else` 动作。例如，以下动作会在种子名称包含有声书相关关键词时将内容类型设为 `audiobook`，否则返回 `unmatched` 错误：

```yaml
if_else:
  condition: "torrent.baseName.matches(keywords.audiobook)"
  if_action:
    set_content_type: audiobook
  else_action: unmatched
```

以下动作会在种子名称匹配 `banned` 关键词列表时删除该种子：

```yaml
if_else:
  condition: "torrent.baseName.matches(keywords.banned)"
  if_action: delete
```

动作可能返回以下错误类型：

- `unmatched`：当前动作未匹配当前种子
- `delete`：应删除该种子
- 未处理的错误，如 TMDB API 无法访问

一旦返回错误，当前分类流程将终止。

注意，工作流不应返回 `unmatched` 错误。通常会依次检查每种内容类型，若当前种子不匹配则继续下一个，直到找到匹配项；若都不匹配，则内容类型为 `unknown`。为此可用 `find_match` 动作。

`find_match` 类似某些编程语言的 try/catch 块：尝试匹配某内容类型，若返回 `unmatched` 错误，则捕获并继续下一个。例如，以下动作会尝试将种子分类为 `audiobook`，再尝试 `ebook`，若都失败则内容类型为 `unknown`：

```yaml
find_match:
  # 匹配有声书：
  - if_else:
      condition: "torrent.baseName.matches(keywords.audiobook)"
      if_action:
        set_content_type: audiobook
      else_action: unmatched
  # 匹配电子书：
  - if_else:
      condition: "torrent.files.map(f, f.extension in extensions.ebook ? f.size : - f.size).sum() > 0"
      if_action:
        set_content_type: ebook
      else_action: unmatched
```

完整动作列表请参见[JSON schema](https://bitmagnet.io/schemas/classifier-0.1.json)。

## 条件（Conditions）

条件与 `if_else` [动作](#动作)配合使用，用于在满足特定条件时执行动作。

上述示例中的条件使用 [CEL（通用表达式语言）](https://cel.dev/) 表达式。

### CEL 环境

CEL 是[文档完善](https://github.com/google/cel-spec/blob/master/doc/intro.md)的语言，这里不详述语法。在 **bitmagnet** 分类器中，CEL 环境暴露了如下变量：

- `torrent`：当前正在分类的种子（protobuf 类型：`bitmagnet.Torrent`）
- `result`：当前分类结果（protobuf 类型：`bitmagnet.Classification`）
- `keywords`：字符串到正则表达式的映射，表示命名的[关键词](#关键词)列表
- `extensions`：字符串到字符串列表的映射，表示命名的[扩展名](#扩展名)列表
- `contentType`：字符串到枚举值的映射，表示内容类型（如 `contentType.movie`、`contentType.music`）
- `fileType`：字符串到枚举值的映射，表示文件类型（如 `fileType.video`、`fileType.audio`）
- `flags`：字符串到[标志](#标志)配置值的映射
- `kb`、`mb`、`gb`：便捷变量，分别为 1KB、1MB、1GB 的字节数

更多协议缓冲类型详情见[protobuf schema](https://github.com/bitmagnet-io/bitmagnet/blob/main/internal/protobuf/bitmagnet.proto)。

### 布尔逻辑（`or`、`and`、`not`）

除 CEL 表达式外，条件还可用布尔逻辑运算符 `or`、`and`、`not` 声明。例如，以下条件为真时，表示种子主要由常见音乐扩展名（如 `flac`）文件组成，或名称包含音乐相关关键词且主要为音频文件：

```yaml
or:
  - "torrent.files.map(f, f.extension in extensions.music ? f.size : - f.size).sum() > 0"
  - and:
      - "torrent.baseName.matches(keywords.music)"
      - "torrent.files.map(f, f.fileType == fileType.audio ? f.size : - f.size).sum() > 0"
```

当然，也可以用单个 CEL 表达式实现，但拆分复杂条件更易读。

## 关键词（Keywords）

分类器包含与不同类型种子相关的关键词列表，旨在提供比正则表达式更简单的替代方案。分类器会将所有关键词列表编译为可在 CEL 表达式中使用的正则表达式。关键词需作为独立词出现才能匹配，即要么在字符串开头或前有非单词字符，要么在结尾或后有非单词字符。

语法保留字符：

- 括号 `(` 和 `)` 表示分组
- `|` 为或运算符
- `*` 为通配符
- `?` 表示前一字符或分组可选
- `+` 表示前一字符出现一次或多次
- `#` 表示任意数字
- 空格 ` ` 表示任意非单词或非数字字符

例如，定义音乐和有声书相关关键词：

```yaml
keywords:
  music: # 音乐相关关键词
    - music # 字母不区分大小写，需小写或转义
    - discography
    - album
    - \V.?\A # 转义字母区分大小写，匹配 "VA"、"V.A"、"V.A."，不匹配 "va"
    - various artists # 匹配 "various artists" 和 "Various.Artists"
  audiobook: # 有声书相关关键词
    - (audio)?books?
    - (un)?abridged
    - narrated
    - novels?
    - (auto)?biograph(y|ies) # 匹配 "biography"、"autobiographies" 等
```

{: .note }

> 如需使用普通正则表达式，CEL 语法同样支持，例如 `torrent.baseName.matches("^myregex$")`。

## 扩展名（Extensions）

分类器包含与不同内容类型相关的文件扩展名列表。例如，要通过扩展名识别 `comic` 类型种子，先声明扩展名：

```yaml
extensions:
  comic:
    - cb7
    - cba
    - cbr
    - cbt
    - cbz
```

然后可在 `if_else` 动作的条件中使用：

```yaml
if_else:
  condition: "torrent.files.map(f, f.extension in extensions.comic ? f.size : - f.size).sum() > 0"
  if_action:
    set_content_type: comic
  else_action: unmatched
```

## 标志（Flags）

标志可用于配置工作流。要在工作流中使用标志，需先定义。例如，核心分类器定义了如下标志用于 `default` 工作流：

```yaml
flag_definitions:
  tmdb_enabled: bool
  delete_content_types: content_type_list
  delete_xxx: bool
```

这些标志可在 CEL 表达式中引用，例如在 `delete_xxx` 标志为 `true` 时删除成人内容：

```yaml
if_else:
  condition: "flags.delete_xxx && result.contentType == contentType.xxx"
  if_action: delete
```

## 配置

可通过在支持的位置提供 `classifier.yml` 文件[如上所述](#源优先级)自定义分类器。如只需小幅修改，也可通过[主应用配置](/setup/configuration.html)指定，在 `config.yml` 或环境变量中提供部分分类器属性。

例如，在 `config.yml` 中可指定：

```yaml
classifier:
  # 指定自定义工作流
  workflow: custom
  # 向核心音乐关键词列表添加自定义关键词
  keywords:
    music:
      - my-custom-music-keyword
  # 向有声书扩展名列表添加扩展名
  extensions:
    audiobook:
      - abc
  # 自动删除所有漫画
  flags:
    delete_content_types:
      - comics
```

或用环境变量指定：

```sh
TMDB_ENABLED=false \ # 禁用 TMDB API 集成
  CLASSIFIER_WORKFLOW=custom \ # 指定自定义工作流
  CLASSIFIER_DELETE_XXX=true \ # 自动删除所有成人内容
  bitmagnet worker run --all
```

## 校验

分类器源码在初始加载时编译，所有结构和语法错误会在编译时捕获。若分类器源码有误，**bitmagnet** 会退出并显示错误位置。

## 重新分类种子

阅读如何[重新分类种子](/guides/reprocess-reclassify.html)。

## 实际用例与示例

### 自动删除特定内容类型

默认工作流提供了自动删除特定内容类型的标志。例如，删除所有 `comic`、`software` 和 `xxx` 种子：

```yaml
flags:
  delete_content_types:
    - comic
    - software
    - xxx
```

自动删除成人内容是最常见的需求之一。为方便起见，可用配置项 `classifier.delete_xxx`，或环境变量 `CLASSIFIER_DELETE_XXX=true` 指定。

### 自动删除包含特定关键词的种子

任何包含 `banned` 列表关键词的种子都会被自动删除。主要用于删除 <abbr title="Child Sexual Abuse Material">CSAM</abbr> 内容，也可扩展列表自动删除其他关键词：

```yaml
keywords:
  banned:
    - my-hated-keyword
```

### 禁用 TMDB API 集成

`tmdb_enabled` 标志可用于禁用 TMDB API 集成：

```yaml
flags:
  tmdb_enabled: false
```

同样可通过配置项 `tmdb.enabled` 或环境变量 `TMDB_ENABLED=false` 指定。

`apis_enabled` 标志有同样效果，禁用 TMDB 及未来的 API 集成：

```yaml
flags:
  apis_enabled: false
```

也可在单次分类时通过 [reprocess 命令](/guides/reprocess-reclassify.html)的 `--apisDisabled` 参数禁用 API 集成。

### 用自定义逻辑扩展默认工作流

可在分类器文档的 `workflows` 部分添加自定义工作流。可通过 `run_workflow` 动作在自定义工作流中扩展默认工作流，例如：

```yaml
workflows:
  custom:
    - <在默认工作流前执行的自定义动作>
    - run_workflow: default
    - <在默认工作流后执行的自定义动作>
```

具体示例：根据自定义条件为种子添加标签。

### 用标签创建自定义种子分类

有些你感兴趣的种子类别可能不在核心内容类型中。种子标签用于自定义类别和内容类型。

假设你想筛选包含有趣文档的种子，这些文档有特定扩展名，文件名包含特定关键词。可创建自定义动作为这些种子打标签：

```yaml
# 定义感兴趣文档的扩展名
extensions:
  interesting_documents:
    - doc
    - docx
    - pdf
# 定义感兴趣文档文件名需包含的关键词
keywords:
  interesting_documents:
    - interesting
    - fascinating
# 用自定义工作流扩展默认工作流，为包含有趣文档的种子打标签
workflows:
  custom:
    # 先运行默认工作流
    - run_workflow: default
    # 再为包含有趣文档的种子添加标签
    - if_else:
        condition: "torrent.files.filter(f, f.extension in extensions.interesting_documents && f.basePath.matches(keywords.interesting_documents)).size() > 0"
        if_action:
          add_tag: interesting-documents
```

要指定使用自定义工作流，记得设置 `classifier.workflow` 配置项，如 `CLASSIFIER_WORKFLOW=custom bitmagnet worker run --all`。
