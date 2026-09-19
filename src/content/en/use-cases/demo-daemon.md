---
title: An always-on demo or tool
description: Run a demo, kiosk or internal tool in the background with a supervisor that restarts it on crashes.
summary: servd --daemon detaches a supervised instance scoped per user and port. It restarts a crashed worker with backoff, logs to a rotating file, and is controlled with --status and --stop.
order: 5
tags:
  - daemon
  - background
  - reliability
---

## The scenario

You want a build, a demo, a kiosk, or a small internal tool to **keep serving** — through a terminal you close, an SSH session that drops, or the occasional crash. A foreground `servd` dies with its shell. A process manager is heavyweight for "just keep this folder on port 8080."

`servd --daemon` runs the server detached under a supervisor that keeps a worker alive.

## One command

```bash
servd --spa=./frontend --proxy=/api/=http://localhost:9000/api/ --port=8080 --daemon
```

`--daemon` returns **only after the worker is actually listening**, so it is safe to script and to put behind a health check:

```text
servd 0.1.0 http daemon started on 0.0.0.0:8080 (supervisor pid 41233, worker pid 41240)
log: /Users/you/Library/Caches/servd/8080/servd.log
```

## Control it per port

Daemons are scoped **per user and per port**, and the control flags take only `--port`:

```bash
servd --status --port=8080   # running / restarting / failed, PIDs, restart count, log path
servd --stop   --port=8080   # stop it; stopping an absent daemon succeeds quietly
```

`--status` exits non-zero when the instance is not running, so it slots straight into scripts and CI gates.

## Restart policy

- A crashed worker restarts with **exponential backoff**, up to **five consecutive** times.
- A worker that stays up resets the restart budget.
- Once the budget is exhausted the instance is marked `failed` and holds until you `--stop` and start again — it will not spin forever.

```text
servd :8080 restarting (restart 2/5, next in 2000ms, last exit: exit status 1)
```

## Logs

Supervisor and worker output go to a per-port log file (path printed by `--daemon` and `--status`). Logs **rotate at 5 MiB** with one backup (`servd.log` and `servd.log.1`), so a long-running demo will not fill the disk.

## A typical flow

```bash
# start a preview that survives crashes and shell logouts
servd --spa=./frontend --port=8080 --daemon

# check on it later
servd --status --port=8080

# stop when done
servd --stop --port=8080
```

Only one daemon can hold a port at a time; starting a second for the same port reports that one already exists. Add [TLS](/use-cases/https-preview/) to serve the daemon over HTTPS. See [Daemon mode](/docs/daemon/) for how the supervisor, lock and control endpoint work.
