---
title: 一个端口，一个源：用 servd 代理 WebSocket
description: servd 如何在单个端口上把 WebSocket 升级与 HTTP 一并隧道转发，以及这为何能把 CORS 从你的开发循环里移除。
date: 2026-09-17
tags:
  - websocket
  - proxy
  - cors
readingTime: 6
author: qingyu31
draft: false
---

一个带实时更新的前端，通常需要后端提供两样东西：普通的 HTTP 请求和一个 WebSocket。开发时它们往往跑在与前端不同的端口上，于是构成跨源 —— 而 WebSocket 并不像 `fetch` 那样使用 CORS，但围绕它的 HTTP 调用会。干净的解法是把一切放到**同一个源**之后，正如生产环境所做的那样。

`servd` 用一对参数即可做到：

```bash
servd \
  --spa=./frontend \
  --proxy=/api/=http://localhost:9000/api/ \
  --ws=/ws=ws://localhost:9000/ws \
  --port=8080
```

浏览器始终只与 `http://localhost:8080` 对话。`/api/...` 被反向代理，`/ws` 被隧道转发，其余一切从 `./frontend` 托管。

## 「隧道转发一个 WebSocket」到底意味着什么

一个 WebSocket 起初只是一个带两个头部的普通 HTTP 请求：

```http
GET /ws/chat?room=1 HTTP/1.1
Host: localhost:8080
Upgrade: websocket
Connection: upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
```

为代理它，`servd` 完全不解析 WebSocket 帧。它**劫持（hijack）**客户端的 TCP 连接，拨号到上游（`ws://` 被当作 `http://`，`wss://` 当作 `https://`），转发升级请求，然后把两条原始字节流拼接在一起。一旦 `101 Switching Protocols` 响应回流，连接在两个方向上都变得不透明，`servd` 就只是拷贝字节，直到任一端关闭。

这正是该代理与协议无关的原因：它适用于任何子协议、二进制或文本帧、ping/pong —— 因为它从不窥视内部。

## 只有真正的升级才会被代理

`servd` 对愿意隧道转发什么很严格，因此一个杂散请求无法意外劫持连接：

- 请求必须携带 `Upgrade: websocket` **和** `Connection: upgrade`；任何其它仅仅提到 "upgrade" 的东西都会得到 `400`。
- 匹配到的挂载必须确实有一个 `--ws` 目标；否则是 `404`。
- 方法必须是 `GET`，且查询字符串必须能解析；否则 `400`。

对 `--ws` 挂载的、并非升级的普通请求，完全不会被当作 WebSocket 流量处理。

## 路径与查询被精确保留

挂载前缀被剥离，剩余部分拼接到上游路径之后 —— **百分号编码逐字节保留**，查询字符串一并带过。因此 `/ws/chat?room=1` 变成 `ws://localhost:9000/ws/chat?room=1`，而像 `/ws/room%2F42` 这样的编码段会保持编码，而不是被悄悄解码成另一个路径。同样的重写规则也适用于 `--proxy`，这正是 `/api/` 与 `/ws` 能并肩可预测工作的原因。

## 干净关闭，不留半开 socket

长连接是大多数临时代理会做错的部分。每条被隧道转发的连接都注册在一个由互斥锁守护的集合里。优雅关闭时，`servd` 把自己标记为正在关闭，并关闭每条被跟踪的隧道，因此一次 `Ctrl+C`（或对守护进程的 `--stop`）不会让 socket 悬在半开状态。一个与关闭竞态的连接会被立即关闭，而不是被加入集合。

新手有时会问这种字节拼接会不会泄漏 goroutine。不会：每条隧道恰好关闭一次、在关闭时自行注销，且关闭流程会清扫任何仍打开的连接。

## HTTPS 顺带变成 WSS

因为隧道不过是同一监听器上的字节流，启用 [TLS](/docs/tls/) 会整体升级这套图景：同一端口现在为应用与 API 提供 `https://`，为 socket 提供 `wss://`。

```bash
servd --spa=./frontend \
  --proxy=/api/=http://localhost:9000/api/ \
  --ws=/ws=ws://localhost:9000/ws \
  --tls-cert=./fullchain.pem --tls-key=./privkey.pem --port=8443
```

于是你的前端在开发*和*生产都能使用相对的 `new WebSocket('/ws')`，无需改动任何 URL。完整语义见[代理指南](/docs/proxying/)与 [SPA + API 用例](/use-cases/spa-with-api/)。
