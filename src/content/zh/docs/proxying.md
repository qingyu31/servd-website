---
title: 代理 HTTP 与 WebSocket
description: 通过同一个源反向代理 HTTP API 并隧道转发 WebSocket 连接，支持前缀重写。
group: guides
order: 2
---

## 为什么在开发中代理

除非服务器通过 CORS 显式放行，否则浏览器会拦截跨源请求。与其到处配置 CORS，不如用 `servd` 把前端和后端放在同一个源之后。对 `/api/...` 和 `/ws` 的请求会被转发到你的后端，于是浏览器只看到一个源。

## HTTP 代理

`--proxy` 把一个挂载前缀映射到上游 URL。前缀会被剥离，剩余部分拼接到目标路径之后：

```bash
servd --spa=./frontend --proxy=/api/=http://localhost:9000/api/
```

- `GET /api/users` -> `http://localhost:9000/api/users`
- `POST /api/orders/42` -> `http://localhost:9000/api/orders/42`
- 查询字符串会被保留，并与目标上的任何查询合并。
- 百分号编码的路径段会被原样保留。

目标必须使用 `http` 或 `https` 协议并包含主机名。`--proxy` 可重复；同一参数的重复挂载会被拒绝。

### 优先级与转发

- 在同一挂载点上，**代理优先于文件**。
- 来自客户端的 `Forwarded` / `X-Forwarded-*` 头部会被剥离，随后 `servd` 设置自己的 `X-Forwarded-For`、`X-Forwarded-Host`、`X-Forwarded-Proto`。
- 上游的响应头部与内容编码会原样透传。
- 如果上游不可达，`servd` 返回 `502 Bad Gateway`（超时时为 `504 Gateway Timeout`），而不是泄露原始错误。

## WebSocket 代理

`--ws` 把 WebSocket 升级隧道转发到 `ws://` 或 `wss://` 上游：

```bash
servd --spa=./frontend --ws=/ws=ws://localhost:9000/socket
```

- 对 `/ws/chat?room=1` 的请求会升级并连接到 `ws://localhost:9000/socket/chat?room=1`。
- 只有真正的升级才会被代理：请求必须带 `Upgrade: websocket` 和 `Connection: upgrade`、使用 `GET`，并带有合法的查询字符串。
- 已打开的隧道会被跟踪，并在关闭时干净地断开，因此优雅停止不会留下半开的 socket。

## 组合使用

一条命令即可通过单个端口托管应用、API 与实时更新：

```bash
servd \
  --spa=./frontend \
  --proxy=/api/=http://localhost:9000/api/ \
  --ws=/ws=ws://localhost:9000/socket \
  --port=8080
```

配合 [TLS](/docs/tls/)，同样的配置可以从一个端口提供 `https://` 与 `wss://`。
