---
title: CORS & Host filtering
description: Allow cross-origin requests with CORS and restrict which Host headers servd accepts.
group: guides
order: 3
---

## CORS

`--cors` enables Cross-Origin Resource Sharing. Pass `*` to allow any origin, or list explicit origins (repeatable):

```bash
servd --static=./dist --cors=*
servd --static=./dist --cors=https://app.example.com --cors=https://admin.example.com
```

Behavior:

- With `*`, every response gets `Access-Control-Allow-Origin: *`.
- With explicit origins, the request `Origin` is normalized and echoed back only when it matches, and `Vary: Origin` is added.
- **Credentials are never enabled.** `servd` does not send `Access-Control-Allow-Credentials`, so cookies and HTTP auth are not shared cross-origin.
- Preflight (`OPTIONS`) requests are answered with `204` and the allowed method/headers. For a static mount only `GET`/`HEAD` are allowed; proxied mounts allow the requested method.
- When CORS is enabled and a route is a proxy, any `Access-Control-*` headers coming from the upstream are stripped so `servd` stays authoritative and headers are not duplicated.

An `Origin` of `null` (for example from a `file://` page or a sandboxed iframe) is only allowed under `--cors=*`.

## Host filtering

`--host` restricts which `Host` request headers are accepted (repeatable):

```bash
servd --static=./dist --host=localhost --host=app.example.com
```

- A request whose `Host` is not in the list gets `403 Forbidden`.
- Values are normalized (lowercased, trailing dot removed, IPv6 unwrapped). A host entry must not include a port.
- With no `--host`, all hosts are accepted (`Hosts: unrestricted` in the startup output).

> Host filtering is a routing/guard convenience. It does **not** configure DNS and provides **no authentication** — anyone who can reach the port can send a matching `Host` header. Use it to avoid serving content for unexpected virtual hosts, not as a security boundary.

## Combining both

```bash
servd \
  --spa=./frontend \
  --proxy=/api/=http://localhost:9000/api/ \
  --host=localhost \
  --cors=http://localhost:5173
```

This serves the app, proxies the API, only answers requests addressed to `localhost`, and allows the Vite dev origin to call it cross-origin during development.
