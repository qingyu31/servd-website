---
title: Daemon mode
description: Run servd detached with a supervisor that restarts a crashed worker, and control it per port.
group: guides
order: 5
---

## Background instances

`--daemon` starts `servd` in the background under a supervisor that keeps a worker alive. Daemons are scoped **per user and per port**.

```bash
servd --static=./dist --port=8080 --daemon
```

`--daemon` returns **only after the worker is actually listening**, so it is safe to script:

```text
servd 0.1.0 http daemon started on 0.0.0.0:8080 (supervisor pid 41233, worker pid 41240)
log: /Users/you/Library/Caches/servd/8080/servd.log
```

## Inspect and stop

```bash
servd --status --port=8080
servd --stop   --port=8080
```

- `--status` prints the state (`running`, `restarting`, or `failed`), the supervisor/worker PIDs, the restart count, and the log path. It exits non-zero when not running, so it works in scripts.
- `--stop` terminates the instance; stopping an absent daemon succeeds quietly.
- `--status` and `--stop` accept **only** `--port`.

## Restart policy

- A crashed worker restarts with **exponential backoff**, up to **five consecutive** times.
- A worker that stays up resets the restart budget.
- Once the budget is exhausted the instance is marked `failed` and holds until you `--stop` it, then start again.

```text
servd :8080 restarting (restart 2/5, next in 2000ms, last exit: exit status 1)
```

## Logs

Supervisor and worker output is written to a per-port log file whose path is printed by `--daemon` and `--status`. Logs **rotate at 5 MiB** with one backup (`servd.log` and `servd.log.1`).

## How it works

`servd` copies its own binary into a private, per-user instance directory, then spawns a detached supervisor. The supervisor holds an instance lock, exposes an authenticated loopback control endpoint (used by `--status`/`--stop`), and manages the worker lifecycle. Internal handshakes are token-authenticated over loopback only.

## A typical flow

```bash
# start a preview that survives crashes and logouts of the controlling shell
servd --spa=./frontend --proxy=/api/=http://localhost:9000/api/ --port=8080 --daemon

# check on it later
servd --status --port=8080

# stop when done
servd --stop --port=8080
```

Only one daemon can hold a port at a time; starting a second one for the same port reports that a daemon already exists.
