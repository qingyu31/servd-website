---
title: Proxying HTTP & WebSocket
description: Reverse-proxy HTTP APIs and tunnel WebSocket connections through the same origin, with prefix rewriting.
group: guides
order: 2
---

## Why proxy in development

Browsers block cross-origin requests unless the server opts in with CORS. Instead of configuring CORS everywhere, put your front-end and back-end behind one origin with `servd`. Requests to `/api/...` and `/ws` are forwarded to your back-end, so the browser sees a single origin.

## HTTP proxy

`--proxy` maps a mount prefix to an upstream URL. The prefix is stripped and the remainder is appended to the target path:

```bash
servd --spa=./frontend --proxy=/api/=http://localhost:9000/api/
```

- `GET /api/users` -> `http://localhost:9000/api/users`
- `POST /api/orders/42` -> `http://localhost:9000/api/orders/42`
- Query strings are preserved and merged with any query on the target.
- Percent-encoded path segments are preserved exactly.

The target must use the `http` or `https` scheme and include a host. `--proxy` is repeatable; a duplicate mount for the same flag is rejected.

### Precedence and forwarding

- **Proxies take precedence over files** at the same mount point.
- Incoming `Forwarded` / `X-Forwarded-*` headers from the client are stripped, then `servd` sets its own `X-Forwarded-For`, `X-Forwarded-Host`, `X-Forwarded-Proto`.
- Upstream response headers and content encodings are passed through unchanged.
- If the upstream is unreachable, `servd` returns `502 Bad Gateway` (or `504 Gateway Timeout` on a timeout) instead of leaking the raw error.

## WebSocket proxy

`--ws` tunnels WebSocket upgrades to a `ws://` or `wss://` upstream:

```bash
servd --spa=./frontend --ws=/ws=ws://localhost:9000/socket
```

- A request to `/ws/chat?room=1` upgrades and connects to `ws://localhost:9000/socket/chat?room=1`.
- Only real upgrades are proxied: the request must carry `Upgrade: websocket` and `Connection: upgrade`, use `GET`, and have a valid query string.
- Open tunnels are tracked and closed cleanly on shutdown, so a graceful stop does not leave half-open sockets.

## Putting it together

One command serves the app, the API, and live updates over a single port:

```bash
servd \
  --spa=./frontend \
  --proxy=/api/=http://localhost:9000/api/ \
  --ws=/ws=ws://localhost:9000/socket \
  --port=8080
```

With [TLS](/docs/tls/) the same setup serves `https://` and `wss://` from one port.
