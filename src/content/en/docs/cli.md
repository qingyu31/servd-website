---
title: CLI reference
description: Every servd flag, its arguments, and the rules that govern routing and precedence.
group: reference
order: 1
---

## Synopsis

```text
servd [options]
```

`servd` listens on all IPv4 interfaces (`0.0.0.0`). With no routes it serves the current working directory.

## Flags

| Flag | Argument | Description |
| --- | --- | --- |
| `--static` | `./dir` or `/mount=./dir` | Static root; repeatable. |
| `--spa` | `./dir` or `/mount=./dir` | SPA root with `index.html` fallback; repeatable. |
| `--proxy` | `/mount=http://host/path` | HTTP reverse proxy with prefix rewriting; repeatable. |
| `--ws` | `/mount=ws://host/path` | WebSocket proxy; repeatable. |
| `--port` | `1`-`65535` | TCP port; specify once (default `8080`). |
| `--host` | `example.org` or IP | Allowed request `Host`; repeatable. No port allowed. |
| `--cors` | `*` or an Origin | Allowed origin; repeatable. Never sends credentials. |
| `--tls-cert` | `./fullchain.pem` | TLS certificate (PEM); pair with `--tls-key`. |
| `--tls-key` | `./privkey.pem` | TLS private key (PEM); enables HTTPS and WSS. |
| `--daemon` | — | Run in the background and restart on crashes. |
| `--status` | — | Show the background instance status for a port. |
| `--stop` | — | Stop the background instance for a port. |
| `--help`, `-h` | — | Show help. |
| `--version` | — | Show version. |

## Routing rules

- **Longest mount wins.** More specific prefixes match before shorter ones.
- **Proxies take precedence over files** at the same mount point.
- Mounts are normalized: they must start with `/`, may not contain `//`, `.`, `..`, `\`, `%`, `?`, `#`, whitespace or control characters.
- `--proxy` and `--ws` require the `mount=target` form; a duplicate mount for the same flag is rejected.
- Multiple directories on the same mount are tried in order; the first existing file wins.

## Mutual exclusions and validation

- `--daemon`, `--status` and `--stop` are mutually exclusive.
- `--status` and `--stop` accept only `--port`.
- `--tls-cert` and `--tls-key` must be used together, each at most once.
- `--port` may be specified only once and must be `1`-`65535`.
- Empty arguments and unexpected positional arguments are rejected.

## Exit codes

- `0` — success (for `--status`, the instance is running).
- `1` — runtime or start/stop failure (for `--status`, not running).
- `2` — invalid usage/arguments.

## Examples

```bash
# current directory on :8080
servd

# a build output on :3000
servd --static=./dist --port=3000

# SPA + API + WebSocket on one origin
servd --spa=./frontend \
  --proxy=/api/=http://localhost:9000/api/ \
  --ws=/ws=ws://localhost:9000/ws

# HTTPS preview
servd --static=./dist --tls-cert=./fullchain.pem --tls-key=./privkey.pem --port=8443

# background with restarts
servd --static=./dist --port=8080 --daemon
```
