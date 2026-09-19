---
title: 快速开始
description: 几秒内托管一个目录，加上 SPA 与 API 代理，并确认实际托管的内容。
group: start
order: 3
---

## 托管当前目录

不带任何路由时，`servd` 会在 `8080` 端口托管当前工作目录：

```bash
servd
```

启动时你应当看到打印出的解析后配置：

```text
servd 0.1.0 listening on 0.0.0.0:8080 (all IPv4 interfaces)
Hosts: unrestricted
  static / -> /current/working/dir
```

`servd` 始终监听所有 IPv4 接口（`0.0.0.0`）。打开 `http://localhost:8080/`。

## 在自定义端口托管指定目录

```bash
servd --static=./dist --port=3000
```

## 托管单页应用

使用 `--spa`，让客户端路由回退到 `index.html`：

```bash
servd --spa=./frontend --port=8080
```

回退仅在「无扩展名的导航请求且带 `Accept: text/html`」时触发，因此静态资源请求（`.js`、`.css`、`.png` 等）会被正常托管，缺失的资源仍然返回 `404`。

## 加上 API 与 WebSocket 代理

通过同一个源托管前端并代理后端：

```bash
servd \
  --spa=./frontend \
  --proxy=/api/=http://localhost:9000/api/ \
  --ws=/ws=ws://localhost:9000/ws \
  --port=8080
```

现在 `GET /api/users` 会被转发到 `http://localhost:9000/api/users`，`/ws` 会隧道转发到上游 WebSocket —— 开发时无需再折腾 CORS。

## 停止

按 `Ctrl+C`。`servd` 会优雅关闭。若想让它在后台常驻并自动重启，参见[守护进程模式](/docs/daemon/)。

## 下一步

- [静态与 SPA](/docs/static-and-spa/) —— 挂载、索引、缓存、压缩。
- [代理](/docs/proxying/) —— HTTP 与 WebSocket 上游。
- [CLI 参考](/docs/cli/) —— 每一个参数。
