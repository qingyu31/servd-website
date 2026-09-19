---
title: Quick start
description: Serve a directory in seconds, add an SPA and an API proxy, and confirm what is being served.
group: start
order: 3
---

## Serve the current directory

With no routes, `servd` serves the current working directory on port `8080`:

```bash
servd
```

You should see the resolved configuration printed on startup:

```text
servd 0.1.0 listening on 0.0.0.0:8080 (all IPv4 interfaces)
Hosts: unrestricted
  static / -> /current/working/dir
```

`servd` always listens on all IPv4 interfaces (`0.0.0.0`). Open `http://localhost:8080/`.

## Serve a specific folder on a custom port

```bash
servd --static=./dist --port=3000
```

## Serve a single-page app

Use `--spa` so client-side routes fall back to `index.html`:

```bash
servd --spa=./frontend --port=8080
```

The fallback only triggers for extensionless navigations that send `Accept: text/html`, so asset requests (`.js`, `.css`, `.png`, ...) are served normally and missing assets still return `404`.

## Add an API and a WebSocket proxy

Serve the front-end and proxy the back-end through one origin:

```bash
servd \
  --spa=./frontend \
  --proxy=/api/=http://localhost:9000/api/ \
  --ws=/ws=ws://localhost:9000/ws \
  --port=8080
```

Now `GET /api/users` is forwarded to `http://localhost:9000/api/users`, and `/ws` tunnels to the upstream WebSocket — no CORS juggling in development.

## Stop it

Press `Ctrl+C`. `servd` shuts down gracefully. To keep it running in the background with automatic restarts, see [Daemon mode](/docs/daemon/).

## Where to go next

- [Static & SPA](/docs/static-and-spa/) — mounts, indexes, caching, compression.
- [Proxying](/docs/proxying/) — HTTP and WebSocket upstreams.
- [CLI reference](/docs/cli/) — every flag.
