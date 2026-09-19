---
title: 用 servd 替换 http-server
description: 从 npm 的 http-server 迁移到 servd 的实操指南 —— 等价命令、变化之处，以及你的收获。
date: 2026-09-16
tags:
  - migration
  - http-server
  - static
readingTime: 6
author: qingyu31
draft: false
---

多年来，`http-server` 一直是 Node 生态里默认的「托管这个目录」工具。`servd` 力图覆盖它的常见用法，同时移除 Node 运行时依赖，并增加一流的代理、WebSocket 隧道、Host 过滤与后台守护进程。本文是一份实操迁移指南。

## 你真正会用的那条一行命令

大多数 `http-server` 调用长这样：

```bash
http-server ./dist -p 3000
```

`servd` 的等价写法：

```bash
servd --static=./dist --port=3000
```

两者都在 3000 端口托管 `./dist`。区别在于 `servd` 是单一的 Go 二进制 —— 没有 Node 进程，请求时不做 `node_modules` 解析，行为也不会随所装 Node 版本而漂移。

## 命令速查表

| 任务 | `http-server` | `servd` |
| --- | --- | --- |
| 托管目录 | `http-server ./dist` | `servd --static=./dist` |
| 自定义端口 | `-p 8080` | `--port=8080` |
| SPA 回退 | `--proxy` 技巧或 `-P` | `--spa=./dist` |
| 代理某路径 | `--proxy=http://...`（仅回退） | `--proxy=/api/=http://...` |
| WebSocket 代理 | 不支持 | `--ws=/ws=ws://...` |
| CORS | `--cors` | `--cors=*` 或 `--cors=<origin>` |
| HTTPS | `--cert`/`--key` | `--tls-cert`/`--tls-key` |
| Host 过滤 | 不支持 | `--host=example.com` |
| 后台 + 重启 | 不支持 | `--daemon` |

## 模型差异所在

**单根 vs. 挂载。** `http-server` 托管一个根目录，并为磁盘上找不到的任何请求提供单一的 `--proxy` 回退。`servd` 基于挂载：你可以在一个进程里，把多个静态/SPA 根*与*多个代理挂到不同前缀上，最长匹配的挂载胜出。这正是一个端口能同时容纳前端、API 与 WebSocket、而无需单独反向代理的原因。

**SPA 回退语义。** 一个常见的 `http-server` SPA 变通法是把未匹配的请求代理到 `index.html`，这也会吞掉缺失资源的真实 `404`。`servd --spa` 只对「无扩展名且带 `Accept: text/html`」的导航回退，因此缺失的 `/app.js` 仍是真正的 `404`。

**压缩。** `http-server` 在存在时托管预压缩的 `.gz`。`servd` 托管 `.gz` *和* `.br`，在客户端接受时优先 Brotli，否则即时 gzip 压缩可压缩文本。

## CORS 行为一致，但少了意外

```bash
servd --static=./dist --cors=*
```

与 `http-server --cors` 一样，这会加上 `Access-Control-Allow-Origin`。两点刻意的差异：`servd` **永不**发送 `Access-Control-Allow-Credentials`（因此你不会意外暴露带凭据的跨源请求），且当某条路由是代理时，它会剥离上游的 `Access-Control-*` 头部，使其不被重复。

## 保留你所喜欢的

如果你的工作流只需要「托管一个目录」，且环境中本就有 Node，`http-server` 依旧很好 —— 不必急于迁移。`servd` 在以下场景才真正物有所值：

- 开发时让前端、API 与 WebSocket 位于**同一个源**之后；
- 需要一个**自包含二进制**，用于容器、CI 产物或快速的内部托管；
- 需要一个在后台**持续运行**、崩溃时自我重启的预览。

## 迁移一个真实配置

一个用代理 API 托管 SPA 的 `package.json` 脚本：

```json
{
  "scripts": {
    "serve": "http-server ./dist -p 8080 --proxy http://localhost:9000?"
  }
}
```

变成：

```json
{
  "scripts": {
    "serve": "servd --spa=./dist --proxy=/api/=http://localhost:9000/api/ --port=8080"
  }
}
```

注意代理现在被限定在 `/api/`，而不再是包揽一切的回退 —— 这通常正是你本就想要的。完整参数面见 [CLI 参考](/docs/cli/)，逐项特性拆解见[对比](/docs/comparison/)。
