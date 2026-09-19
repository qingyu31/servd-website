---
title: 本地调试代理（SPA + API + WebSocket）
description: 开发期托管单页应用，并把它的 HTTP API 与 WebSocket 通过同一个源反向代理，从而消除跨域 CORS 问题。
summary: 本地调试时把前端构建产物与后端放在同一个端口之后。servd 托管 SPA、把 /api 重写到你的服务器、并隧道转发 /ws —— 浏览器只看到一个源，无需任何 CORS 配置。
order: 2
tags:
  - spa
  - proxy
  - websocket
  - cors
---

## 场景

你的前端调用 `/api/...`，并在 `/ws` 打开一个 WebSocket。生产环境里由反向代理把它们放到同一个源上。开发时前端跑在一个端口、API 跑在另一个端口，于是浏览器视其为跨源，你开始与 CORS、预检和 `withCredentials` 缠斗。

`servd` 在本地复现生产拓扑：托管 SPA，并通过单个端口代理 API 与 WebSocket。

## 一条命令

```bash
servd \
  --spa=./frontend \
  --proxy=/api/=http://localhost:9000/api/ \
  --ws=/ws=ws://localhost:9000/ws \
  --port=8080
```

现在，从浏览器的视角看，一切都是 `http://localhost:8080`：

- `GET /api/users` 被转发到 `http://localhost:9000/api/users`。
- `POST /api/orders/42` 连同其请求体与查询原样转发。
- `/ws` 升级并隧道转发到 `ws://localhost:9000/ws`。
- 其余每个路径都从 `./frontend` 托管，客户端路由回退到 `index.html`。

## 为什么 SPA 回退是安全的

`--spa` 仅在路径**没有扩展名**且请求带 `Accept: text/html` 时才回退到 `index.html`。因此 `/dashboard/settings` 渲染应用，而 `/app.js`、`/styles.css`、`/logo.png` 作为真实文件托管 —— 真正缺失的资源仍然返回 `404`，而不是 HTML。这避免了那个经典 bug：一个坏掉的脚本 URL 悄悄返回了首页。

## 路由优先级

- **最长挂载优先：** `/api/...` 先于位于 `/` 的 SPA 根匹配到代理。
- 在同一挂载点上，**代理优先于文件**，因此 `/api` 代理绝不会被一个杂散的 `frontend/api` 目录遮蔽。

转发是透明的：`servd` 剥离客户端提供的 `X-Forwarded-*` 头部并设置自己的 `X-Forwarded-For` / `-Host` / `-Proto`，并把上游的响应头部与编码原样透传。如果 API 挂了，你会拿到干净的 `502`/`504`，而不是泄露的堆栈跟踪。

## 加上 HTTPS 与 WSS

给同样的配置一份证书，它就能从一个端口提供 `https://` 与 `wss://` —— 参见 [HTTPS 预览](/use-cases/https-preview/)用例。确切的代理语义见[代理](/docs/proxying/)。
