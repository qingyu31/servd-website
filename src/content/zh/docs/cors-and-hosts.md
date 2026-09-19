---
title: CORS 与 Host 过滤
description: 用 CORS 放行跨源请求，并限制 servd 接受哪些 Host 头部。
group: guides
order: 3
---

## CORS

`--cors` 启用跨源资源共享（Cross-Origin Resource Sharing）。传 `*` 放行任意来源，或列出显式来源（可重复）：

```bash
servd --static=./dist --cors=*
servd --static=./dist --cors=https://app.example.com --cors=https://admin.example.com
```

行为：

- 使用 `*` 时，每个响应都带 `Access-Control-Allow-Origin: *`。
- 使用显式来源时，请求的 `Origin` 会被规范化，仅在匹配时回显，并加上 `Vary: Origin`。
- **永不启用凭据。** `servd` 不会发送 `Access-Control-Allow-Credentials`，因此 cookie 与 HTTP 认证不会跨源共享。
- 预检（`OPTIONS`）请求以 `204` 应答，并带上允许的方法/头部。对静态挂载只允许 `GET`/`HEAD`；代理挂载则允许所请求的方法。
- 当启用 CORS 且某条路由是代理时，来自上游的任何 `Access-Control-*` 头部会被剥离，从而让 `servd` 保持权威、头部不被重复。

`Origin` 为 `null`（例如来自 `file://` 页面或沙箱 iframe）仅在 `--cors=*` 下被放行。

## Host 过滤

`--host` 限制接受哪些 `Host` 请求头（可重复）：

```bash
servd --static=./dist --host=localhost --host=app.example.com
```

- `Host` 不在列表中的请求会得到 `403 Forbidden`。
- 值会被规范化（转小写、去掉末尾的点、解开 IPv6）。host 条目不得包含端口。
- 不带 `--host` 时，接受所有主机（启动输出中为 `Hosts: unrestricted`）。

> Host 过滤是一种路由/守卫便利功能。它**不**配置 DNS，也**不提供任何认证** —— 任何能连到端口的人都能发送匹配的 `Host` 头。用它来避免为意外的虚拟主机托管内容，而不是当作安全边界。

## 两者结合

```bash
servd \
  --spa=./frontend \
  --proxy=/api/=http://localhost:9000/api/ \
  --host=localhost \
  --cors=http://localhost:5173
```

这会托管应用、代理 API、只应答发往 `localhost` 的请求，并允许 Vite 开发源在开发期间跨源调用它。
