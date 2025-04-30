---
title: 文本搜索
description: 使用 bitmagnet 的文本搜索
parent: Guides
layout: default
nav_order: 2
redirect_from:
  - /tutorials/text-search.html
---

# 文本搜索

文本搜索旨在“开箱即用”，但了解可用的语法和功能可以帮助你更好地使用它。

## 引号

未加引号的搜索词将匹配包含所有这些词（顺序不限）的记录。可以用引号括起词语（或部分词语），以指定它们必须按给定顺序出现。例如，搜索 `"fat cats and sad rats"` 会返回包含该确切短语的结果，而搜索 `fat cats and sad rats` 可能会返回包含“rats and fat, sad cats”等短语的结果。

一个常见的用法是用引号搜索电影名并加上未加引号的年份，例如 `"steamboat willie" 1928`。

## 顺序运算符

`.` 字符是指定词语顺序的另一种方式。例如，搜索 `apple . orange` 会返回包含 `apple` 紧跟 `orange` 的结果。

## OR 运算符

`|` 字符是 OR 运算符。搜索会返回包含 `|` 两侧任一词语的结果。例如，搜索 `apple | orange` 会返回包含 `apple` 或 `orange` 的结果。

## 否定运算符

`!` 字符是否定运算符。搜索会返回不包含 `!` 后面词语的结果。例如，搜索 `orange !apple` 会返回包含 `orange` 且不包含 `apple` 的结果。

## 通配符后缀

`*` 字符可用作通配符后缀。搜索会返回以 `*` 前面的词语开头的结果。例如，搜索 `appl*` 会返回以 `appl` 开头的结果，如 `apple`、`application`、`appliance` 等。

注意，通配符只能用作后缀，不能作为前缀或中缀。

## 括号

括号可用于控制运算符优先级。例如，搜索 `"banana split" | (apple !toffee)` 会返回包含短语 "banana split" 的结果，或包含 "apple" 但不包含 "toffee" 的结果。

## 规范化

搜索文本不区分大小写。上述未提及的任何标点符号都被视为空格。搜索索引和搜索词都会被规范化为 ASCII 字符（即搜索 `cafe` 会匹配包含 "café" 的记录，反之亦然）。这适用于所有语言，例如简体和繁体中文字符在搜索时可视为可互换。

## 语法校验

搜索查询解析器很宽容：任何字符串都是有效的文本搜索输入，解析器会尽力将上述语法应用于任何输入字符串。例如，如果你搜索 `"Steamboat Willie`（忘记闭合引号），搜索查询解析器仍会将其视为一个带引号的短语。
