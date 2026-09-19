---
title: CLI 参考
description: servd 的每一个参数、它的取值，以及支配路由与优先级的规则。
group: reference
order: 1
---

## 概要

```text
servd [options]
```

`servd` 监听所有 IPv4 接口（`0.0.0.0`）。不带任何路由时，它托管当前工作目录。

## 参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| `--static` | `./dir` 或 `/mount=./dir` | 静态根目录；可重复。 |
| `--spa` | `./dir` 或 `/mount=./dir` | 带 `index.html` 回退的 SPA 根目录；可重复。 |
| `--proxy` | `/mount=http://host/path` | 带前缀重写的 HTTP 反向代理；可重复。 |
| `--ws` | `/mount=ws://host/path` | WebSocket 代理；可重复。 |
| `--port` | `1`-`65535` | TCP 端口；只能指定一次（默认 `8080`）。 |
| `--host` | `example.org` 或 IP | 允许的请求 `Host`；可重复。不允许带端口。 |
| `--cors` | `*` 或某个 Origin | 允许的来源；可重复。永不发送凭据。 |
| `--tls-cert` | `./fullchain.pem` | TLS 证书（PEM）；与 `--tls-key` 配对。 |
| `--tls-key` | `./privkey.pem` | TLS 私钥（PEM）；启用 HTTPS 与 WSS。 |
| `--daemon` | — | 在后台运行并在崩溃时重启。 |
| `--status` | — | 显示某端口的后台实例状态。 |
| `--stop` | — | 停止某端口的后台实例。 |
| `--help`、`-h` | — | 显示帮助。 |
| `--version` | — | 显示版本。 |

## 路由规则

- **最长挂载优先。** 更具体的前缀先于更短的前缀匹配。
- 在同一挂载点上，**代理优先于文件**。
- 挂载会被规范化：必须以 `/` 开头，不得包含 `//`、`.`、`..`、`\`、`%`、`?`、`#`、空白或控制字符。
- `--proxy` 与 `--ws` 要求 `mount=target` 形式；同一参数的重复挂载会被拒绝。
- 同一挂载点上的多个目录按顺序尝试；第一个存在的文件胜出。

## 互斥与校验

- `--daemon`、`--status` 与 `--stop` 互斥。
- `--status` 与 `--stop` 只接受 `--port`。
- `--tls-cert` 与 `--tls-key` 必须一起使用，各自至多一次。
- `--port` 只能指定一次，且必须为 `1`-`65535`。
- 空参数与意外的位置参数会被拒绝。

## 退出码

- `0` —— 成功（对 `--status` 而言，表示实例正在运行）。
- `1` —— 运行时或启动/停止失败（对 `--status` 而言，表示未运行）。
- `2` —— 非法的用法/参数。

## 示例

```bash
# 当前目录，:8080
servd

# 构建产物，:3000
servd --static=./dist --port=3000

# SPA + API + WebSocket，同一个源
servd --spa=./frontend \
  --proxy=/api/=http://localhost:9000/api/ \
  --ws=/ws=ws://localhost:9000/ws

# HTTPS 预览
servd --static=./dist --tls-cert=./fullchain.pem --tls-key=./privkey.pem --port=8443

# 后台运行并自动重启
servd --static=./dist --port=8080 --daemon
```
