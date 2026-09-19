---
title: servd 发布
description: 一个用于开发、测试与轻量托管的单一二进制静态/SPA/HTTP/WebSocket 服务器 —— 通过 npm 分发。
date: 2026-09-15
tags:
  - release
  - go
  - static
readingTime: 5
author: qingyu31
draft: false
---

`servd` 是一个小服务器，只做一件事：把一个目录正确地挂到某个端口上，且无需安装任何运行时。它托管静态文件与单页应用，反向代理 HTTP 与 WebSocket 上游，应用 CORS 与 Host 过滤，终结 TLS，并能作为自我监督的后台守护进程运行。它是单一的静态链接 Go 二进制，并通过 npm 分发，因此 `npx @qingyu31/servd` 开箱即用。

## 为什么又一个服务器

当我们需要查看一个构建产物时，大多数人早已习惯伸手去拿 `http-server` 或 `python -m http.server`。这些工具对于「托管这个目录」够用，但一旦你的前端需要 API、需要 WebSocket、需要真正的 HTTPS，或需要一个熬过关闭终端的预览，你就开始东拼西凑代理、CORS 头部和进程管理器。

`servd` 把这些需求收进一个二进制、一套心智模型：**挂载（mounts）**。每条路由是一个映射到某种行为的前缀，少数几条可预测的规则决定谁胜出。

## 心智模型

```bash
servd --spa=./frontend --proxy=/api/=http://localhost:9000/api/ --ws=/ws=ws://localhost:9000/ws
```

- **最长挂载优先。** `/api/...` 先于 `/` 匹配。
- 在同一挂载点上，**代理优先于文件**。
- **完全不带路由**意味着「托管当前工作目录」。

这就是全部的路由面。一旦内化，其余的不过是参数。

## 无运行时，真实的 HTTP

npm 包只是一个启动器；服务器本身是一个没有依赖的 Go 二进制。这不只是体积上的优势 —— 它意味着 HTTP 语义在各台机器间稳定且可预测，因为底层没有一个会改变行为的 Node 版本：

- 目录请求重定向到带尾斜杠的形式并托管 `index.html`。
- 文件带 `Cache-Control: no-cache` 以及弱 `ETag` 和 `Last-Modified`，因此浏览器会再验证并拿到快速的 `304`。
- 预压缩的 `.gz` / `.br` 同级文件被直接托管；其余可压缩文本被即时 gzip，并带上正确的 `Vary`。
- `Range`、`HEAD` 与条件请求都被遵守。
- 路径穿越（`..`、`//`、反斜杠、NUL）被拒绝，文件通过 rooted handle 打开。

## 安全的 SPA 回退

「永远返回 `index.html`」的经典隐患是：一个拼错的资源 URL 会悄悄返回 HTML 而不是 `404`。`servd` 仅在路径**没有扩展名***且*请求带 `Accept: text/html` 时才回退。因此客户端路由渲染应用，而 `/app.js` 和 `/logo.png` 是真实文件 —— 真正缺失的资源是真正的 `404`。

## 尊重你安装过程的分发

`servd` 采用与 esbuild、SWC、Biome 相同的模式：一个极小的主包，加上按平台划分的可选依赖，每个内含一个原生二进制。你的包管理器只下载与你 OS 和架构匹配的那个二进制。没有 postinstall 脚本，安装时不拉取任何东西。

```bash
npm install --global @qingyu31/servd
servd --version
```

## 接下来

阅读[简介](/docs/introduction/)来一场巡礼，跳到[快速开始](/docs/quick-start/)，或看看 `servd` 与 [http-server 的对比](/docs/comparison/)。本博客的其余文章会深入大家问得最多的两块：[单端口 WebSocket 代理](/blog/one-port-websocket-proxy/)与[自我监督的守护进程](/blog/self-supervising-daemon/)。
