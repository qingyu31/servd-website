---
title: Local debug proxy (SPA + API + WebSocket)
description: Serve a single-page app and reverse-proxy its HTTP API and WebSocket through the same origin during development, so cross-origin CORS problems disappear.
summary: Put your front-end build and back-end behind one port while debugging locally. servd serves the SPA, rewrites /api to your server, and tunnels /ws — the browser sees a single origin and no CORS setup is needed.
order: 2
tags:
  - spa
  - proxy
  - websocket
  - cors
---

## The scenario

Your front-end calls `/api/...` and opens a WebSocket at `/ws`. In production a reverse proxy puts them on one origin. In development the front-end runs on one port and the API on another, so the browser treats them as cross-origin and you start fighting CORS, preflights and `withCredentials`.

`servd` reproduces the production topology locally: serve the SPA and proxy the API and WebSocket through a single port.

## One command

```bash
servd \
  --spa=./frontend \
  --proxy=/api/=http://localhost:9000/api/ \
  --ws=/ws=ws://localhost:9000/ws \
  --port=8080
```

Now, from the browser's point of view, everything is `http://localhost:8080`:

- `GET /api/users` is forwarded to `http://localhost:9000/api/users`.
- `POST /api/orders/42` is forwarded with its body and query intact.
- `/ws` upgrades and tunnels to `ws://localhost:9000/ws`.
- Every other path is served from `./frontend`, falling back to `index.html` for client-side routes.

## Why the SPA fallback is safe

`--spa` only falls back to `index.html` when the path has **no extension** and the request sends `Accept: text/html`. So `/dashboard/settings` renders the app, while `/app.js`, `/styles.css` and `/logo.png` are served as real files — and a genuinely missing asset still returns `404`, not HTML. This avoids the classic bug where a broken script URL silently returns the index page.

## Routing precedence

- **Longest mount wins:** `/api/...` matches the proxy before the SPA root at `/`.
- **Proxies beat files** at the same mount, so an `/api` proxy is never shadowed by a stray `frontend/api` folder.

Forwarding is transparent: `servd` strips client-supplied `X-Forwarded-*` headers and sets its own `X-Forwarded-For` / `-Host` / `-Proto`, and passes upstream response headers and encodings through unchanged. If the API is down you get a clean `502`/`504`, not a leaked stack trace.

## Add HTTPS and WSS

Give the same setup a certificate and it serves `https://` and `wss://` from one port — see the [HTTPS preview](/use-cases/https-preview/) use case. For the exact proxy semantics, read [Proxying](/docs/proxying/).
