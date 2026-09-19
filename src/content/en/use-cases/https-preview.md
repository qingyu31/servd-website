---
title: Local HTTPS & WSS preview
description: Serve HTTPS and WSS from a real certificate to test secure-context-only behavior before deploying.
summary: Some browser features only work in a secure context. servd terminates TLS 1.2+ from a PEM cert and key so you can test service workers, secure cookies, geolocation and wss:// locally.
order: 4
tags:
  - tls
  - https
  - security
---

## The scenario

A growing set of browser features requires a **secure context**: service workers, the Clipboard and Geolocation APIs, `Secure`/`SameSite=None` cookies, HTTP authentication over TLS, and `wss://`. `http://localhost` is treated as potentially trustworthy, but a LAN preview (`http://192.168.x.x`), a staging host, or anything reached over a real hostname is not. To test those features faithfully you need real HTTPS.

`servd` terminates TLS from a certificate and key, and serves HTTPS and WSS from the same port.

## One command

```bash
servd --static=./dist \
  --tls-cert=./fullchain.pem \
  --tls-key=./privkey.pem \
  --port=8443
```

The startup line shows the scheme:

```text
servd 0.1.0 listening on 0.0.0.0:8443 (all IPv4 interfaces, https)
```

Open `https://localhost:8443/`. A front-end opened here can register a service worker, set `Secure` cookies, and connect to `wss://localhost:8443/ws`.

## Get a locally-trusted certificate

A self-signed cert works but the browser will warn. For a smooth local experience, use [`mkcert`](https://github.com/FiloSottile/mkcert) to mint a certificate your machine already trusts:

```bash
mkcert -install
mkcert localhost 127.0.0.1 ::1
```

Or generate a plain self-signed certificate with OpenSSL:

```bash
openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
  -keyout privkey.pem -out fullchain.pem \
  -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
```

## Rules worth knowing

- `--tls-cert` and `--tls-key` must be used together, each exactly once; paths are made absolute at startup.
- The certificate may carry its full chain (leaf first) and multiple SANs.
- Minimum protocol is TLS 1.2+, and connections are HTTP/1.1 only — predictable for a preview server.
- Both HTTPS and WSS are served from the one TLS port; plain HTTP is not served there.

## Keep keys safe

Never place `privkey.pem` inside a directory you are serving — with no routes `servd` serves the current working directory. Keep certificates in a sibling folder or an absolute path outside every mount:

```bash
servd --static=./dist --tls-cert=/etc/servd/fullchain.pem --tls-key=/etc/servd/privkey.pem
```

Combine TLS with a [proxy](/use-cases/spa-with-api/) to serve `https://` and `wss://` for an app and its API, or run it under [daemon mode](/use-cases/demo-daemon/) to keep the preview alive in the background. Details in the [TLS guide](/docs/tls/).
