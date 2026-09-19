---
title: Lightweight hosting
description: Host an internal tool, demo, report or small site from a single self-contained binary — no runtime, no config, optionally always-on.
summary: Point one static binary at a folder and keep it served — internal tools, demos, coverage reports or small sites — with optional TLS, host filtering and a self-restarting daemon.
order: 3
tags:
  - hosting
  - daemon
  - static
---

## The scenario

You have something small that needs a URL: an internal dashboard, a demo for a stakeholder, a generated coverage report, a team wiki export, a folder of downloads. Standing up a full web server or a PaaS for that is overkill, and a dev server that dies with your terminal is not hosting.

`servd` is exactly the middle ground: a single static binary with no runtime dependencies and no config file. Point it at a directory and it serves it correctly — directory indexes, `ETag` revalidation, gzip/brotli — then optionally keeps serving it in the background.

## One command

```bash
servd --static=./site --port=8080
```

On startup `servd` prints what it resolved, so you can confirm the right folder is live:

```text
servd 0.1.0 listening on 0.0.0.0:8080 (all IPv4 interfaces)
Hosts: unrestricted
  static / -> /you/site
```

If the output is a single-page app rather than plain files, use [`--spa`](/docs/static-and-spa/) so client-side routes fall back to `index.html`.

## Keep it running

For anything people return to, run it detached under the supervisor. It restarts a crashed worker with exponential backoff and is controlled per port:

```bash
servd --static=./site --port=8080 --daemon
servd --status --port=8080
servd --stop   --port=8080
```

`--daemon` returns only once the worker is actually listening, so it is safe to put in a startup script. See [Daemon mode](/docs/daemon/) for the restart policy and log rotation.

## Put TLS and host filters in front

Expose it as HTTPS and limit which hostnames it answers, so a shared machine does not serve it under unexpected virtual hosts:

```bash
servd --static=./site --port=8443 \
  --tls-cert=./fullchain.pem --tls-key=./privkey.pem \
  --host=tools.example.com
```

Details in [TLS](/docs/tls/) and [CORS & Host filtering](/docs/cors-and-hosts/). Host filtering is a routing guard, not authentication — put real auth in front of anything sensitive.

## In a container

Because the server is one statically-linked binary, the whole host image can be the binary plus your files:

```dockerfile
FROM scratch
COPY --from=build /out/servd /servd
COPY --from=build /out/site /site
EXPOSE 8080
ENTRYPOINT ["/servd"]
CMD ["--static=/site", "--port=8080"]
```

No shell, no package manager, no base-OS patch surface — a few megabytes total.

## When to reach for something bigger

If you need virtual hosting for many domains, complex rewrite rules, or traffic-level load balancing, a full reverse proxy is the right tool. For one folder that needs a reliable URL — internally, for a demo, or as a small public page — `servd` keeps the whole job to a single binary and a couple of flags.
