---
title: 与 http-server 对比
description: servd 与 npm 的 http-server 相比如何，以及各自适合什么场景。
group: reference
order: 3
---

`servd` 力图成为 [`http-server`](https://www.npmjs.com/package/http-server) 常见用法的即插即用替代品，同时增加了一流的代理、WebSocket 隧道、Host 过滤与后台守护进程。

## 特性对比

| 能力 | `http-server` | `servd` |
| --- | --- | --- |
| 静态文件托管 | 是 | 是 |
| SPA 回退 | 基础 | 是（内容协商） |
| HTTP 代理 | 仅 `--proxy` 回退 | 一流的挂载代理，带重写 |
| WebSocket 代理 | 否 | 是 |
| CORS | 是 | 是（通配或显式来源） |
| Host 过滤 | 否 | 是 |
| TLS / HTTPS | 是 | 是（TLS 1.2+，HTTP/1.1） |
| 预压缩 `.gz` / `.br` | 仅 `.gz` | `.gz` 与 `.br` |
| 带重启的后台守护进程 | 否 | 是 |
| 运行时依赖 | Node.js | 无（单一 Go 二进制） |

## 运行时模型

`http-server` 是一个 Node.js 程序：它需要现场存在 Node 运行时，且其行为可能随所装 Node 版本而变。`servd` 是单一的静态链接 Go 二进制。npm 包只是一个启动器，用于解析并运行那个二进制，因此托管完全不依赖 Node。

## 路由模型

`http-server` 托管单个根目录，并为未匹配的请求提供单一的 `--proxy` 回退。`servd` 基于挂载：你可以在一个进程里，把多个静态/SPA 根与多个 HTTP/WebSocket 代理挂到不同前缀上。最长匹配的挂载胜出，且某挂载点上的代理优先于该点的文件。

## 何时保留 http-server

- 你只需要托管一个静态目录，且环境中本就依赖 Node。
- 你依赖 `http-server` 特有的参数或生态集成。

## 何时 servd 更合适

- 你想在开发期间让前端与 API（及 WebSocket）位于同一个源之后。
- 你需要一个无运行时的自包含二进制，用于容器、CI 产物或快速的内部托管。
- 你想要一个在后台持续运行、并在崩溃时自我重启的预览。

确切的参数面见 [CLI 参考](/docs/cli/)。
