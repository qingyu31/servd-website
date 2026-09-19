---
title: "One port, one origin: proxying WebSockets with servd"
description: How servd tunnels WebSocket upgrades alongside HTTP on a single port, and why that removes CORS from your dev loop.
date: 2026-09-17
tags:
  - websocket
  - proxy
  - cors
readingTime: 6
author: qingyu31
draft: false
---

A live-updating front-end usually needs two things from its back-end: ordinary HTTP requests and a WebSocket. In development those often live on a different port than your front-end, which makes them cross-origin — and WebSockets do not use CORS the way `fetch` does, but the surrounding HTTP calls do. The clean fix is to put everything behind **one origin**, exactly like production does.

`servd` does this with a single flag pair:

```bash
servd \
  --spa=./frontend \
  --proxy=/api/=http://localhost:9000/api/ \
  --ws=/ws=ws://localhost:9000/ws \
  --port=8080
```

The browser only ever talks to `http://localhost:8080`. `/api/...` is reverse-proxied, `/ws` is tunneled, everything else is served from `./frontend`.

## What "tunneling a WebSocket" actually means

A WebSocket starts life as an ordinary HTTP request with two headers:

```http
GET /ws/chat?room=1 HTTP/1.1
Host: localhost:8080
Upgrade: websocket
Connection: upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
```

To proxy it, `servd` does not parse WebSocket frames at all. It **hijacks** the client TCP connection, dials the upstream (`ws://` is treated as `http://`, `wss://` as `https://`), forwards the upgrade request, and then splices the two raw byte streams together. Once the `101 Switching Protocols` response flows back, the connection is opaque in both directions and `servd` just copies bytes until either side closes.

This is why the proxy is protocol-agnostic: it works for any subprotocol, binary or text frames, ping/pong — because it never looks inside.

## Only real upgrades are proxied

`servd` is strict about what it will tunnel, so a stray request cannot accidentally hijack a connection:

- The request must carry `Upgrade: websocket` **and** `Connection: upgrade`; anything else that merely mentions "upgrade" gets a `400`.
- The matched mount must actually have a `--ws` target; otherwise it is a `404`.
- The method must be `GET` and the query string must parse; otherwise `400`.

Ordinary requests to a `--ws` mount that are not upgrades are not treated as WebSocket traffic at all.

## Path and query are preserved exactly

The mount prefix is stripped and the remainder is appended to the upstream path — with **percent-encoding preserved byte-for-byte** and the query string carried over. So `/ws/chat?room=1` becomes `ws://localhost:9000/ws/chat?room=1`, and an encoded segment like `/ws/room%2F42` stays encoded rather than being silently decoded into a different path. The same rewriting rules apply to `--proxy`, which is why `/api/` and `/ws` behave predictably side by side.

## Clean shutdown, no half-open sockets

Long-lived connections are the part most ad-hoc proxies get wrong. Every tunneled connection is registered in a set guarded by a mutex. On graceful shutdown, `servd` marks itself closing and closes each tracked tunnel, so a `Ctrl+C` (or a `--stop` of a daemon) does not leave sockets dangling in a half-open state. A connection that races the shutdown is closed immediately instead of being added.

Newcomers sometimes ask whether the byte-splicing leaks goroutines. It does not: each tunnel closes exactly once, deregisters itself on close, and shutdown sweeps anything still open.

## HTTPS becomes WSS for free

Because the tunnel is just bytes over the same listener, enabling [TLS](/docs/tls/) upgrades the whole picture: the same port now serves `https://` for the app and API and `wss://` for the socket.

```bash
servd --spa=./frontend \
  --proxy=/api/=http://localhost:9000/api/ \
  --ws=/ws=ws://localhost:9000/ws \
  --tls-cert=./fullchain.pem --tls-key=./privkey.pem --port=8443
```

Your front-end can then use a relative `new WebSocket('/ws')` in development *and* production without changing a URL. For the full semantics, see the [proxying guide](/docs/proxying/) and the [SPA + API use case](/use-cases/spa-with-api/).
