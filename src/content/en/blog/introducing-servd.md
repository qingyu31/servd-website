---
title: Introducing servd
description: A single-binary static, SPA, HTTP and WebSocket server for development, testing and light hosting — distributed over npm.
date: 2026-09-15
tags:
  - release
  - go
  - static
readingTime: 5
author: qingyu31
draft: false
---

`servd` is a small server with one job: put a folder on a port, correctly, with no runtime to install. It serves static files and single-page apps, reverse-proxies HTTP and WebSocket upstreams, applies CORS and Host filtering, terminates TLS, and can run as a self-supervising background daemon. It is a single statically-linked Go binary, and it ships over npm so `npx @qingyu31/servd` just works.

## Why another server

Most of us already reach for `http-server` or `python -m http.server` when we need to look at a build. Those tools are fine for "serve this folder," but the moment your front-end needs an API, a WebSocket, real HTTPS, or a preview that survives a closed terminal, you are stitching together proxies, CORS headers and process managers.

`servd` folds those needs into one binary with one mental model: **mounts**. Every route is a prefix mapped to a behavior, and a handful of predictable rules decide what wins.

## The mental model

```bash
servd --spa=./frontend --proxy=/api/=http://localhost:9000/api/ --ws=/ws=ws://localhost:9000/ws
```

- **Longest mount wins.** `/api/...` matches before `/`.
- **Proxies beat files** at the same mount.
- **No routes at all** means "serve the current working directory."

That is the whole routing surface. Once you internalize it, everything else is a flag.

## No runtime, real HTTP

The npm package is only a launcher; the server itself is a Go binary with no dependencies. That is not just a size win — it means the HTTP semantics are stable and predictable across machines, because there is no Node version underneath changing behavior:

- Directory requests redirect to a trailing slash and serve `index.html`.
- Files carry `Cache-Control: no-cache` with a weak `ETag` and `Last-Modified`, so browsers revalidate and get fast `304`s.
- Pre-compressed `.gz` / `.br` siblings are served directly; other compressible text is gzipped on the fly with a correct `Vary`.
- `Range`, `HEAD` and conditional requests are honored.
- Path traversal (`..`, `//`, backslashes, NUL) is rejected, and files open through a rooted handle.

## A safe SPA fallback

The classic footgun of "always return `index.html`" is that a typo'd asset URL silently returns HTML instead of `404`. `servd` only falls back when the path has **no extension** *and* the request sends `Accept: text/html`. So client-side routes render the app, while `/app.js` and `/logo.png` are real files — and a genuinely missing asset is a real `404`.

## Distribution that respects your install

`servd` uses the same pattern as esbuild, SWC and Biome: a tiny main package plus per-platform optional dependencies, each holding one native binary. Your package manager downloads only the binary for your OS and architecture. There is no postinstall script and nothing fetched at install time.

```bash
npm install --global @qingyu31/servd
servd --version
```

## What's next

Read the [introduction](/docs/introduction/) for the tour, jump to the [quick start](/docs/quick-start/), or see how `servd` [compares to http-server](/docs/comparison/). The rest of this blog digs into the two pieces people ask about most: the [one-port WebSocket proxy](/blog/one-port-websocket-proxy/) and the [self-supervising daemon](/blog/self-supervising-daemon/).
