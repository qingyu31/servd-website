---
title: Replacing http-server with servd
description: A practical migration from npm's http-server to servd — equivalent commands, what changes, and what you gain.
date: 2026-09-16
tags:
  - migration
  - http-server
  - static
readingTime: 6
author: qingyu31
draft: false
---

`http-server` has been the default "serve this folder" tool in the Node ecosystem for years. `servd` aims to cover its common uses while removing the Node runtime requirement and adding first-class proxies, WebSocket tunneling, Host filtering and a background daemon. This post is a practical migration guide.

## The one-liner you actually use

Most `http-server` invocations look like this:

```bash
http-server ./dist -p 3000
```

The `servd` equivalent:

```bash
servd --static=./dist --port=3000
```

Both serve `./dist` on port 3000. The difference is that `servd` is a single Go binary — there is no Node process, no `node_modules` resolution at request time, and the behavior does not shift with the installed Node version.

## Command cheat sheet

| Task | `http-server` | `servd` |
| --- | --- | --- |
| Serve a folder | `http-server ./dist` | `servd --static=./dist` |
| Custom port | `-p 8080` | `--port=8080` |
| SPA fallback | `--proxy` trick or `-P` | `--spa=./dist` |
| Proxy a path | `--proxy=http://...` (fallback only) | `--proxy=/api/=http://...` |
| WebSocket proxy | not supported | `--ws=/ws=ws://...` |
| CORS | `--cors` | `--cors=*` or `--cors=<origin>` |
| HTTPS | `--cert`/`--key` | `--tls-cert`/`--tls-key` |
| Host filtering | not supported | `--host=example.com` |
| Background + restart | not supported | `--daemon` |

## Where the models differ

**Single root vs. mounts.** `http-server` serves one root and offers a single `--proxy` fallback for anything it cannot find on disk. `servd` is mount-based: you can attach several static/SPA roots *and* several proxies at different prefixes in one process, and the longest matching mount wins. This is what lets one port hold a front-end, an API and a WebSocket without a separate reverse proxy.

**SPA fallback semantics.** A common `http-server` SPA workaround proxies unmatched requests to `index.html`, which also swallows genuine `404`s for missing assets. `servd --spa` only falls back for extensionless navigations that send `Accept: text/html`, so a missing `/app.js` is still a real `404`.

**Compression.** `http-server` serves pre-compressed `.gz` when present. `servd` serves `.gz` *and* `.br`, prefers Brotli when the client accepts it, and gzips compressible text on the fly otherwise.

## CORS behaves the same, minus the surprises

```bash
servd --static=./dist --cors=*
```

Like `http-server --cors`, this adds `Access-Control-Allow-Origin`. Two deliberate differences: `servd` **never** sends `Access-Control-Allow-Credentials` (so you cannot accidentally expose credentialed cross-origin requests), and when a route is a proxy it strips upstream `Access-Control-*` headers so they are not duplicated.

## Keeping what you like

If your workflow only needs "serve one folder" and Node is already present, `http-server` remains perfectly good — there is no rush. `servd` earns its keep when you want:

- a front-end, an API and a WebSocket behind **one origin** in development;
- a **self-contained binary** for containers, CI artifacts or a quick internal host;
- a preview that **keeps running** in the background and restarts on crashes.

## Migrating a real setup

A `package.json` script that served an SPA with a proxied API:

```json
{
  "scripts": {
    "serve": "http-server ./dist -p 8080 --proxy http://localhost:9000?"
  }
}
```

becomes:

```json
{
  "scripts": {
    "serve": "servd --spa=./dist --proxy=/api/=http://localhost:9000/api/ --port=8080"
  }
}
```

Note the proxy is now scoped to `/api/` instead of being a catch-all fallback, which is usually what you wanted anyway. For the full flag surface see the [CLI reference](/docs/cli/), and for a feature-by-feature breakdown see the [comparison](/docs/comparison/).
