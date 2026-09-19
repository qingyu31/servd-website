---
title: Installation
description: Install servd from npm, run it without installing, or build the single Go binary from source.
group: start
order: 2
---

## From npm

`servd` is published as a tiny launcher plus per-platform native binaries. The correct binary for your OS and architecture is pulled in automatically as an optional dependency.

```bash
npm install --global @qingyu31/servd
```

The package is scoped, but the command it installs is simply `servd`:

```bash
servd --version
```

Requires Node.js >= 18, used only by the launcher.

## Without installing

Run it on demand with `npx` (or `pnpm dlx`):

```bash
npx @qingyu31/servd --static=./dist --port=3000
```

## Supported platforms

Native binaries are published for:

- `darwin-x64`, `darwin-arm64` (macOS)
- `linux-x64`, `linux-arm64`
- `win32-x64`, `win32-arm64` (Windows)

## If optional dependencies were skipped

Some package managers or CI configurations skip optional dependencies. Reinstall with them enabled:

```bash
npm install --include=optional @qingyu31/servd
```

If the launcher cannot find the binary it prints an actionable error naming the missing platform package, for example `@qingyu31/servd-linux-arm64`.

## From source

`servd` is a standard Go program (Go 1.24+). Clone the repository and build:

```bash
go build -o bin/servd ./cmd/servd
./bin/servd --help
```

Cross-compile for another target the usual way:

```bash
CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -o servd ./cmd/servd
```

## Next

Head to the [Quick start](/docs/quick-start/) to serve your first directory.
