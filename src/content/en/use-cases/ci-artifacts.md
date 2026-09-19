---
title: CI artifacts & container previews
description: Serve build artifacts and preview deployments from a single static binary with no runtime, in CI or a container.
summary: servd is one self-contained Go binary with no Node or libc runtime needs. Drop it into a scratch/distroless image or a CI job to serve artifacts, preview deployments and smoke-test a build.
order: 6
tags:
  - ci
  - docker
  - artifacts
---

## The scenario

You want to serve build artifacts — a front-end bundle, generated docs, a coverage report, a downloadable release folder — from CI or a tiny container. Pulling in a full Node image just to run `http-server` is hundreds of megabytes and a runtime you then have to patch. You want something **self-contained** that starts fast and has no dependencies.

`servd` is a single statically-linked Go binary (`CGO_ENABLED=0`). It runs `FROM scratch`.

## In a container

Build the artifact in one stage, serve it from a minimal final image:

```dockerfile
# ---- build stage ----
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build   # produces /app/dist

# ---- serve stage ----
FROM golang:1.24 AS servd
RUN CGO_ENABLED=0 go install go.qingyu31.com/servd/cmd/servd@latest

FROM scratch
COPY --from=servd /go/bin/servd /servd
COPY --from=build /app/dist /site
EXPOSE 8080
ENTRYPOINT ["/servd"]
CMD ["--static=/site", "--port=8080"]
```

The final image is just the binary plus your files — a few megabytes, no shell, no package manager, no CVE surface from a base OS.

## In a CI job

Serve the artifacts and smoke-test them before publishing:

```bash
servd --static=./dist --port=8080 --daemon
curl -fsS http://localhost:8080/ >/dev/null        # fail the job if the build is broken
servd --status --port=8080                          # non-zero exit if not running
```

Because `--daemon` returns only after the worker is listening, and `--status` exits non-zero when down, both fit cleanly into a pipeline step.

## Why it fits CI

- **No runtime to install.** One binary; nothing to `apt-get`, no Node version drift.
- **Predictable exits.** `0` success, `1` runtime/start-stop failure, `2` invalid usage — easy to branch on.
- **Correct HTTP semantics.** Directory redirects, `ETag`/`Last-Modified` revalidation, gzip/brotli and `Range` support mean artifacts behave like they will in production.
- **Safe by default.** Rooted file access rejects `..` traversal; `--host` filtering avoids answering unexpected virtual hosts on a shared runner.

## Publish the artifacts

Serve a folder of downloads with directory indexes and let people browse it:

```bash
servd --static=./dist/tarballs --port=8080 --cors=*
```

The `--cors=*` header lets a browser-based tool fetch the artifacts cross-origin. For the container and cross-compilation details, see [npm distribution](/docs/npm-distribution/) and the [CLI reference](/docs/cli/).
