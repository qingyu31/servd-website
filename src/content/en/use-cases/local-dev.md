---
title: Preview a local build
description: Serve a static build output exactly as it will be hosted, with directory indexes, caching and compression.
summary: Point servd at dist/, build/ or _site/ to preview a production build in one command — no Node runtime, correct caching and gzip/brotli out of the box.
order: 1
tags:
  - static
  - preview
  - local
---

## The scenario

You generated a static site or a front-end build — Hugo, Jekyll, Eleventy, `vite build`, `create-react-app`, Angular, Astro — and you want to look at the **real output** before shipping it. Opening `index.html` over `file://` breaks absolute paths, routing and fetch calls. A dev server (`vite dev`, `webpack serve`) shows your source, not the artifact you are about to deploy.

`servd` serves the built directory over HTTP, exactly like a static host would.

## One command

```bash
servd --static=./dist --port=3000
```

Open `http://localhost:3000/`. On startup `servd` prints what it resolved, so you can confirm the right folder is mounted:

```text
servd 0.1.0 listening on 0.0.0.0:3000 (all IPv4 interfaces)
Hosts: unrestricted
  static / -> /you/project/dist
```

## What you get for free

- **Directory indexes.** `/docs` redirects to `/docs/` and serves `docs/index.html` when present, so relative links and canonical URLs stay stable.
- **Realistic caching.** Files are served with `Cache-Control: no-cache` plus a weak `ETag` and `Last-Modified`, so repeat loads return fast `304 Not Modified` — the behavior a CDN or origin would give you.
- **Compression.** Pre-compressed `file.gz` / `file.br` siblings are served directly; otherwise compressible text is gzipped on the fly, with a correct `Vary: Accept-Encoding`.
- **Path safety.** `..`, `//`, backslashes and NUL bytes are rejected, and files are opened through a rooted handle, so the server cannot be tricked into reading outside `./dist`.

## Handy variations

Serve several folders and overlay them at one mount (first existing file wins):

```bash
servd --static=./dist --static=/assets=./public/assets --port=3000
```

Restrict which `Host` headers are answered, useful when a preview is reachable from the network:

```bash
servd --static=./dist --host=localhost --port=3000
```

If the output is a single-page app rather than a multi-page site, use [`--spa` instead](/use-cases/spa-with-api/) so client-side routes fall back to `index.html`.
