---
title: A self-supervising daemon in one binary
description: How servd --daemon detaches a supervised worker, restarts crashes with backoff, and stays controllable per port — with no external process manager.
date: 2026-09-18
tags:
  - daemon
  - go
  - reliability
readingTime: 7
author: qingyu31
draft: false
---

"Keep this folder served on port 8080, restart it if it crashes, and let me check on it later" should not require installing a process manager. `servd --daemon` does it in the same single binary, with a two-process supervisor model. This post explains how it works and why it is built the way it is.

## The command

```bash
servd --spa=./frontend --port=8080 --daemon
servd --status --port=8080
servd --stop   --port=8080
```

`--daemon` returns **only after the worker is actually listening**, and prints the supervisor/worker PIDs and the log path:

```text
servd 0.1.0 http daemon started on 0.0.0.0:8080 (supervisor pid 41233, worker pid 41240)
log: /Users/you/Library/Caches/servd/8080/servd.log
```

## Two processes, not one

A daemon that supervises itself cannot restart itself after a hard crash — the thing that would do the restarting is the thing that crashed. So `servd` splits the role:

- The **supervisor** holds the instance lock, exposes the control endpoint, and manages the worker lifecycle. It does no serving.
- The **worker** runs the actual HTTP server. If it panics or exits, the supervisor notices and restarts it.

Both are the *same binary* re-executed with an internal role set in the environment; there is no second program to ship. When you run `servd --daemon`, the process you invoked becomes a short-lived **starter**: it spawns a detached supervisor, waits for a "ready" handshake, prints the banner, and exits. The supervisor and worker outlive your shell.

## Restarts survive `go run` and reinstalls

Before spawning anything, the starter **copies its own executable** into a private per-generation folder inside the instance directory, and the supervisor runs *that* copy. This is a small detail with a real payoff: a restart keeps working even if the original binary disappears — because `go run` cleaned up its temp build, or an `npm install` replaced the launcher's target mid-flight. Previous-generation copies are swept on the next start.

## Per user, per port, and locked

State lives under the user cache directory, scoped by port:

```text
<UserCacheDir>/servd/<port>/
  instance.lock   launch.lock   control.json   servd.log   bin-<gen>/servd
```

The directory is created `0700` and re-tightened if anything looser is found. Two locks coordinate access: `launch.lock` serializes concurrent start/stop commands so two shells cannot race, and `instance.lock` is held by the running supervisor — which is how `--status` knows whether anything is home before it even dials. Starting a second daemon for a port that is already held reports that one exists instead of fighting over the socket.

## A control endpoint you can trust on a shared machine

`--status` and `--stop` do not guess a PID. The supervisor writes a small `control.json` with its loopback control address, a random 32-byte token, and the port. A control command must present that token, compared in **constant time**, and the address is validated to be **loopback-only** before dialing. So the control plane is reachable only from the local machine and only by something that can read your `0700` instance directory — not from the network your server is exposing.

## The restart state machine

The supervisor loops through `starting -> running`, and on a worker exit decides between `backoff` and `failed`:

- A crash restarts with **exponential backoff** — 1s, 2s, 4s, 8s, 16s — up to **five consecutive** restarts.
- A worker that stays up for **60 seconds** resets the budget, so a long-lived server that hiccups once a day never accumulates strikes.
- When the budget is exhausted the instance goes to `failed` and **holds** until you `--stop` it. It deliberately does not spin forever hammering a broken config.

```text
servd :8080 restarting (restart 2/5, next in 2000ms, last exit: exit status 1)
```

One deliberate exception: a **first** start that never becomes ready is treated as a configuration error, reported immediately, and *not* retried. If the port is taken or the certificate path is wrong, restarting five times would just be noise — you get the real error right away.

## Stopping is graceful, then forceful

`--stop` sends a stop command over the worker's management connection so it can shut down cleanly — draining listeners and, importantly, closing any open [WebSocket tunnels](/blog/one-port-websocket-proxy/). If the worker does not exit within the stop timeout, the supervisor kills the process it owns. Either way the instance lock is released and `control.json` removed, so an immediate restart never collides with the outgoing instance.

## Logs that do not eat the disk

Supervisor and worker output share one per-port log file, **rotating at 5 MiB** with a single backup (`servd.log` and `servd.log.1`). Worker stdout/stderr is piped through the supervisor and prefixed, so a daemonized server's logs read the same as a foreground one.

## Why this matters

The result is a preview server that behaves like a supervised service — restarts, health status, clean stops, bounded logs — with zero external dependencies and one binary. For the operational surface see [Daemon mode](/docs/daemon/); for a worked example see the [always-on demo use case](/use-cases/demo-daemon/).
