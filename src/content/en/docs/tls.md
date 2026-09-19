---
title: TLS (HTTPS & WSS)
description: Serve HTTPS and WSS from a PEM certificate and key over TLS 1.2+.
group: guides
order: 4
---

## Enabling TLS

Provide a certificate and a private key. The port then serves **HTTPS and WSS** over TLS:

```bash
servd --static=./dist \
  --tls-cert=./fullchain.pem \
  --tls-key=./privkey.pem \
  --port=8443
```

The startup line reflects the scheme:

```text
servd 0.1.0 listening on 0.0.0.0:8443 (all IPv4 interfaces, https)
```

## Rules and limits

- `--tls-cert` and `--tls-key` **must be used together**, and each may be specified only once. Paths are resolved to absolute at startup.
- The certificate file may carry its **chain** (leaf first) and multiple **SANs**.
- Minimum protocol is **TLS 1.2+**, and the connection is **HTTP/1.1 only** (no HTTP/2). This keeps behavior predictable for a dev/preview server.
- Both HTTPS and WSS are served from the same port; plain HTTP is not served on a TLS port.

## Local certificates

For local testing you can generate a self-signed certificate that trusts `localhost`:

```bash
openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
  -keyout privkey.pem -out fullchain.pem \
  -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
```

Browsers will warn about the self-signed issuer; add a local exception or use a tool like `mkcert` for a locally-trusted certificate.

## Renewing

Certificates are loaded at startup. After renewing the files, restart to pick them up:

```bash
servd --stop --port=8443
servd --daemon --static=./dist --tls-cert=./fullchain.pem --tls-key=./privkey.pem --port=8443
```

## Keep keys out of served directories

With no routes, `servd` serves the current working directory. Never place `privkey.pem` inside a directory you are serving. Keep certificates in a sibling folder or an absolute path outside every mount:

```bash
servd --static=./dist --tls-cert=/etc/servd/fullchain.pem --tls-key=/etc/servd/privkey.pem
```

## TLS in the background

TLS works with [Daemon mode](/docs/daemon/) exactly the same way — pass the certificate flags alongside `--daemon`, and `--status` / `--stop` continue to work per port.
