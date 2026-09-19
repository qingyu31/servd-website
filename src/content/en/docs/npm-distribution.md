---
title: npm distribution
description: How servd ships a single launcher plus per-platform binaries, and how the launcher resolves them.
group: reference
order: 2
---

## The shape of the package

The published `@qingyu31/servd` package contains **only a small Node launcher** (`npm/bin/servd.cjs`). The actual server is a set of platform-specific packages, each holding one native binary:

```
@qingyu31/servd              -> launcher only (tiny)
@qingyu31/servd-darwin-x64   -> bin/servd
@qingyu31/servd-darwin-arm64 -> bin/servd
@qingyu31/servd-linux-x64    -> bin/servd
@qingyu31/servd-linux-arm64  -> bin/servd
@qingyu31/servd-win32-x64    -> bin/servd.exe
@qingyu31/servd-win32-arm64  -> bin/servd.exe
```

The platform packages are declared as **optional dependencies** of the main package with `os` and `cpu` restrictions, so a package manager downloads only the one that matches the current machine. This is the same pattern used by esbuild, SWC, Biome and similar tools: no postinstall downloads, no install scripts.

## What the launcher does

On every invocation the launcher:

1. Maps `process.platform` + `process.arch` to a package name (for example `linux-arm64` -> `@qingyu31/servd-linux-arm64`).
2. Resolves that package's binary with `require.resolve`.
3. Spawns it with `stdio: 'inherit'`, forwarding all arguments unchanged.
4. Forwards signals (SIGINT/SIGTERM/... and Windows console events) and preserves the child's exit code or terminating signal.
5. Kills the child if the launcher itself exits, so a detached server is never orphaned.

On POSIX the child runs in its own session so terminal signals are not delivered twice.

## Missing binary

If the matching optional package is absent (for example optional dependencies were disabled), the launcher fails with a clear, actionable message rather than silently doing nothing:

```
servd: Missing optional package @qingyu31/servd-linux-arm64 or its binary.
Reinstall @qingyu31/servd with optional dependencies enabled: npm install --include=optional @qingyu31/servd
```

## Building the packages

The repository builds every platform from source and packs the tarballs:

```bash
pnpm run build              # cross-compile all six platforms into dist/npm
pnpm run build -- --platform=darwin-arm64
pnpm run pack               # build + npm pack into dist/tarballs
```

Each binary is compiled with `CGO_ENABLED=0`, `-trimpath`, and `-ldflags "-s -w -X go.qingyu31.com/servd/internal/app.Version=<version>"`, so the version reported by `servd --version` matches the npm version. The repository README documents the full release flow (`pnpm run release`).
