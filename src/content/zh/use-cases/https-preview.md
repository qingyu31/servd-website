---
title: 本地 HTTPS 与 WSS 预览
description: 用真实证书提供 HTTPS 与 WSS，在部署前测试仅安全上下文可用的行为。
summary: 一些浏览器特性只在安全上下文中工作。servd 用 PEM 证书与私钥终结 TLS 1.2+，让你在本地测试 service worker、安全 cookie、地理位置与 wss://。
order: 4
tags:
  - tls
  - https
  - security
---

## 场景

越来越多的浏览器特性要求**安全上下文**：service worker、Clipboard 与 Geolocation API、`Secure`/`SameSite=None` cookie、经 TLS 的 HTTP 认证，以及 `wss://`。`http://localhost` 被视为潜在可信，但局域网预览（`http://192.168.x.x`）、预发布主机，或任何经真实主机名访问的场景则不是。要忠实地测试这些特性，你需要真正的 HTTPS。

`servd` 用一份证书和一把私钥终结 TLS，并从同一端口提供 HTTPS 与 WSS。

## 一条命令

```bash
servd --static=./dist \
  --tls-cert=./fullchain.pem \
  --tls-key=./privkey.pem \
  --port=8443
```

启动行会显示所用协议：

```text
servd 0.1.0 listening on 0.0.0.0:8443 (all IPv4 interfaces, https)
```

打开 `https://localhost:8443/`。在这里打开的前端可以注册 service worker、设置 `Secure` cookie，并连接到 `wss://localhost:8443/ws`。

## 获得本地受信任的证书

自签名证书可用，但浏览器会告警。为了顺畅的本地体验，用 [`mkcert`](https://github.com/FiloSottile/mkcert) 签发一张你机器已信任的证书：

```bash
mkcert -install
mkcert localhost 127.0.0.1 ::1
```

或用 OpenSSL 生成一张普通的自签名证书：

```bash
openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
  -keyout privkey.pem -out fullchain.pem \
  -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
```

## 值得了解的规则

- `--tls-cert` 与 `--tls-key` 必须一起使用，各自恰好一次；路径在启动时被转为绝对路径。
- 证书可以携带完整证书链（叶子在前）与多个 SAN。
- 最低协议为 TLS 1.2+，连接仅为 HTTP/1.1 —— 对预览服务器而言足够可预测。
- HTTPS 与 WSS 由这一个 TLS 端口提供；此处不提供明文 HTTP。

## 保护私钥

切勿把 `privkey.pem` 放进你正在托管的目录 —— 不带任何路由时 `servd` 会托管当前工作目录。把证书放在同级目录，或放在所有挂载之外的绝对路径：

```bash
servd --static=./dist --tls-cert=/etc/servd/fullchain.pem --tls-key=/etc/servd/privkey.pem
```

把 TLS 与[代理](/use-cases/spa-with-api/)结合，为一个应用及其 API 提供 `https://` 与 `wss://`；或在[守护进程模式](/use-cases/demo-daemon/)下运行，让预览在后台常驻。细节见 [TLS 指南](/docs/tls/)。
