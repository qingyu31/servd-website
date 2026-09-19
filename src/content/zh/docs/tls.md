---
title: TLS（HTTPS 与 WSS）
description: 用 PEM 证书与私钥，通过 TLS 1.2+ 提供 HTTPS 与 WSS。
group: guides
order: 4
---

## 启用 TLS

提供一份证书和一把私钥。该端口随即通过 TLS 提供 **HTTPS 与 WSS**：

```bash
servd --static=./dist \
  --tls-cert=./fullchain.pem \
  --tls-key=./privkey.pem \
  --port=8443
```

启动行会反映出所用协议：

```text
servd 0.1.0 listening on 0.0.0.0:8443 (all IPv4 interfaces, https)
```

## 规则与限制

- `--tls-cert` 与 `--tls-key` **必须一起使用**，且各自只能指定一次。路径在启动时被解析为绝对路径。
- 证书文件可以携带其**证书链**（叶子证书在前）以及多个 **SAN**。
- 最低协议为 **TLS 1.2+**，连接**仅为 HTTP/1.1**（无 HTTP/2）。这让一个开发/预览服务器的行为保持可预测。
- HTTPS 与 WSS 由同一端口提供；TLS 端口上不提供明文 HTTP。

## 本地证书

本地测试时，你可以生成一张信任 `localhost` 的自签名证书：

```bash
openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
  -keyout privkey.pem -out fullchain.pem \
  -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
```

浏览器会对自签名颁发者告警；添加一个本地例外，或使用 `mkcert` 之类的工具获得一张本地受信任的证书。

## 续期

证书在启动时加载。续期文件后，重启以使其生效：

```bash
servd --stop --port=8443
servd --daemon --static=./dist --tls-cert=./fullchain.pem --tls-key=./privkey.pem --port=8443
```

## 别让私钥待在托管目录里

不带任何路由时，`servd` 会托管当前工作目录。切勿把 `privkey.pem` 放进你正在托管的目录。把证书放在同级目录，或放在所有挂载之外的绝对路径：

```bash
servd --static=./dist --tls-cert=/etc/servd/fullchain.pem --tls-key=/etc/servd/privkey.pem
```

## 后台运行 TLS

TLS 与[守护进程模式](/docs/daemon/)的协作方式完全一致 —— 在 `--daemon` 旁一并传入证书参数即可，`--status` / `--stop` 仍按端口正常工作。
