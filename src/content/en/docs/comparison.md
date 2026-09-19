---
title: Comparison with http-server
description: How servd compares to npm's http-server and when to choose each.
group: reference
order: 3
---

`servd` aims to be a drop-in replacement for the common uses of [`http-server`](https://www.npmjs.com/package/http-server), while adding first-class proxies, WebSocket tunneling, host filtering and a background daemon.

## Feature comparison

| Capability | `http-server` | `servd` |
| --- | --- | --- |
| Static file serving | Yes | Yes |
| SPA fallback | Basic | Yes (content-negotiated) |
| HTTP proxy | `--proxy` fallback only | First-class mount proxies with rewriting |
| WebSocket proxy | No | Yes |
| CORS | Yes | Yes (wildcard or explicit origins) |
| Host filtering | No | Yes |
| TLS / HTTPS | Yes | Yes (TLS 1.2+, HTTP/1.1) |
| Pre-compressed `.gz` / `.br` | `.gz` only | `.gz` and `.br` |
| Background daemon with restart | No | Yes |
| Runtime dependencies | Node.js | None (single Go binary) |

## Runtime model

`http-server` is a Node.js program: it needs a Node runtime present, and its behavior can vary with the installed Node version. `servd` is a single statically-linked Go binary. The npm package is only a launcher that resolves and runs that binary, so serving does not depend on Node at all.

## Routing model

`http-server` serves one root and offers a single `--proxy` fallback for unmatched requests. `servd` is mount-based: you can attach several static/SPA roots and several HTTP/WebSocket proxies at different prefixes in one process. The longest matching mount wins, and a proxy at a mount takes precedence over files at that same mount.

## When to keep http-server

- You only need to serve one static folder and already depend on Node in the environment.
- You rely on `http-server`-specific flags or ecosystem integrations.

## When servd is a better fit

- You want a front-end and an API (and WebSocket) behind one origin during development.
- You need a self-contained binary with no runtime, for containers, CI artifacts or quick internal hosting.
- You want a preview that keeps running in the background and restarts itself on crashes.

See the [CLI reference](/docs/cli/) for the exact flag surface.
