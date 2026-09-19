---
title: 简介
description: servd 是什么、何时使用它，以及它与普通静态文件服务器的区别。
group: start
order: 1
---

## servd 是什么？

`servd` 是一个轻量、自包含的服务器，适用于开发、测试和轻量托管。它是单一的 Go 二进制文件，没有运行时依赖，可作为 npm `http-server` 的替代品。

除了托管静态文件，`servd` 还理解单页应用（SPA），反向代理 HTTP 与 WebSocket 上游，应用 CORS 和 Host 过滤，终结 TLS，并能以自我监督的后台守护进程方式运行。它通过 npm 分发：一个极小的启动器加上各平台的原生二进制，因此 `npx @qingyu31/servd` 开箱即用。

## 何时使用

- 在本地托管生产构建产物（`dist/`、`build/`、`_site/`），部署前做验证。
- 托管需要客户端路由回退到 `index.html` 的单页应用。
- 开发时把前端与后端 API（及其 WebSocket）放在同一个源之后。
- 用真实证书预览 HTTPS/WSS 行为。
- 让一个演示或内部工具在后台常驻运行，并在崩溃时自动重启。

## 核心概念

`servd` 按**挂载前缀**路由请求。每条路由是以下之一：

- **static** —— 从目录托管文件。
- **spa** —— 托管文件，并对无扩展名的导航回退到 `index.html`。
- **proxy** —— 将 HTTP 请求转发到上游 URL，并重写路径。
- **ws** —— 将 WebSocket 连接隧道转发到上游。

三条规则决定一个请求如何处理：

1. **最长挂载优先。** 更具体的前缀先于更短的前缀匹配。
2. 在同一挂载点上，**代理优先于文件**。
3. **完全没有路由时**，`servd` 托管当前工作目录。

## 初次一瞥

```bash
servd --static=./dist --port=3000
```

启动时 `servd` 会打印解析后的路由，方便你确认实际托管的内容：

```text
servd 0.1.0 listening on 0.0.0.0:3000 (all IPv4 interfaces)
Hosts: unrestricted
  static / -> /app/dist
```

继续阅读[安装](/docs/installation/)与[快速开始](/docs/quick-start/)，或直接查看 [CLI 参考](/docs/cli/)。
