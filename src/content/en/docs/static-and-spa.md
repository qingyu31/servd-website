---
title: Static & SPA
description: Mounts, directory indexes, cache revalidation, and content negotiation for static files and single-page apps.
group: guides
order: 1
---

## Mounting directories

`--static` serves a directory; `--spa` serves a directory with an `index.html` fallback. Both accept either a bare directory (mounted at `/`) or a `mount=directory` pair, and both are repeatable:

```bash
servd --static=./dist --static=/assets=./public/assets --spa=/admin=./admin-build
```

- `--static=./dist` mounts `./dist` at `/`.
- `--static=/assets=./public/assets` mounts that folder at `/assets`.
- **Longest mount wins:** `/assets/...` is matched before `/`.
- You can attach multiple directories to the same mount; they are tried in order and the first existing file is served (a simple overlay/fallback chain).

## Directories and index files

A request for a directory redirects (308) to a trailing slash, then serves `index.html` if present:

- `GET /docs` -> `301/308` -> `/docs/`
- `GET /docs/` -> `docs/index.html` when it exists

Requests without a trailing slash that resolve to a directory are redirected so relative links and canonical URLs stay stable.

## SPA fallback

`--spa` falls back to `index.html` **only** when both are true:

1. The request path has **no file extension** (a navigation, not an asset).
2. The request sends `Accept: text/html`.

This means client-side routes like `/dashboard/settings` render the app, while `/app.js`, `/styles.css` and `/logo.png` are served as real files — and a genuinely missing asset still returns `404` instead of HTML.

## Caching

- **Static files** are served with `Cache-Control: no-cache` plus a weak `ETag` and `Last-Modified`, so browsers revalidate and get fast `304 Not Modified` responses when nothing changed.
- **SPA HTML** (`text/html` from a `--spa` mount) is served with `Cache-Control: no-store` so navigation always sees the latest shell.
- **Error responses** are `no-store` and strip entity headers.

`HEAD` and conditional requests (`If-None-Match`, `If-Modified-Since`, `If-Range`) are honored.

## Compression

`servd` negotiates `Content-Encoding` from `Accept-Encoding` and adds `Vary: Accept-Encoding`:

- If a pre-compressed sibling `file.ext.gz` or `file.ext.br` exists and is not older than the original, it is served directly (Brotli preferred when accepted).
- Otherwise, compressible text types (`text/*`, `application/json`, `application/javascript`, `image/svg+xml`, `application/wasm`, ...) are gzipped on the fly.

Range requests are supported for identity and pre-compressed responses; multipart ranges are disabled when an encoding is applied so framing stays correct.

## Content types

The type comes from the file extension via the system MIME table; unknown types fall back to content sniffing, defaulting to `application/octet-stream`. Every response sets `X-Content-Type-Options: nosniff`.

## Path safety

Requests containing `//`, `.`/`..` segments, backslashes or NUL bytes are rejected with `400`. Files are opened through an OS-level rooted handle, so a request can never escape its mounted directory. Only regular files are served; symlinks that escape the root and special files are refused.
