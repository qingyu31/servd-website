---
title: Introduction
description: What servd is, when to reach for it, and how it differs from a typical static file server.
group: start
order: 1
---

## What is servd?

`servd` is a small, self-contained server for development, testing and lightweight hosting. It is a single Go binary with no runtime dependencies, and a drop-in alternative to npm's `http-server`.

Beyond serving static files, `servd` understands single-page applications, reverse-proxies HTTP and WebSocket upstreams, applies CORS and host filters, terminates TLS, and can run as a self-supervising background daemon. It ships through npm as a tiny launcher plus per-platform native binaries, so `npx @qingyu31/servd` just works.

## When to use it

- Serving a production build (`dist/`, `build/`, `_site/`) locally to sanity-check it before deploy.
- Hosting a single-page app that needs client-side routing to fall back to `index.html`.
- Putting a front-end and a back-end API (and its WebSocket) behind one origin during development.
- Previewing HTTPS/WSS behavior with a real certificate.
- Leaving a demo or an internal tool running in the background with automatic restarts.

## Core concepts

`servd` routes requests by **mount prefix**. Every route is one of:

- **static** — serve files from a directory.
- **spa** — serve files, and fall back to `index.html` for extensionless navigations.
- **proxy** — forward HTTP requests to an upstream URL, rewriting the path.
- **ws** — tunnel WebSocket connections to an upstream.

Three rules decide what happens for a request:

1. **Longest mount wins.** A more specific prefix is matched before a shorter one.
2. **Proxies beat files** at the same mount point.
3. With **no routes at all**, `servd` serves the current working directory.

## A first look

```bash
servd --static=./dist --port=3000
```

On startup `servd` prints the resolved routes so you can confirm exactly what is being served:

```text
servd 0.1.0 listening on 0.0.0.0:3000 (all IPv4 interfaces)
Hosts: unrestricted
  static / -> /app/dist
```

Continue with [Installation](/docs/installation/) and the [Quick start](/docs/quick-start/), or jump straight to the [CLI reference](/docs/cli/).
