---
title: 守护进程模式
description: 以分离方式运行 servd，由监督者在 worker 崩溃时重启它，并按端口控制。
group: guides
order: 5
---

## 后台实例

`--daemon` 会在一个监督者（supervisor）之下于后台启动 `servd`，由监督者保持 worker 存活。守护进程按**用户与端口**划分作用域。

```bash
servd --static=./dist --port=8080 --daemon
```

`--daemon` **只在 worker 真正开始监听之后**才返回，因此可以安全地写进脚本：

```text
servd 0.1.0 http daemon started on 0.0.0.0:8080 (supervisor pid 41233, worker pid 41240)
log: /Users/you/Library/Caches/servd/8080/servd.log
```

## 查看与停止

```bash
servd --status --port=8080
servd --stop   --port=8080
```

- `--status` 打印状态（`running`、`restarting` 或 `failed`）、监督者/worker 的 PID、重启次数以及日志路径。未运行时以非零码退出，因此可用于脚本。
- `--stop` 终止实例；停止一个不存在的守护进程会静默成功。
- `--status` 与 `--stop` **只**接受 `--port`。

## 重启策略

- 崩溃的 worker 会以**指数退避**重启，最多**连续五次**。
- 持续存活的 worker 会重置重启预算。
- 一旦预算耗尽，实例会被标记为 `failed` 并保持该状态，直到你 `--stop` 它，然后重新启动。

```text
servd :8080 restarting (restart 2/5, next in 2000ms, last exit: exit status 1)
```

## 日志

监督者与 worker 的输出会写入一个按端口划分的日志文件，其路径由 `--daemon` 和 `--status` 打印。日志在 **5 MiB** 时**轮转**，保留一份备份（`servd.log` 与 `servd.log.1`）。

## 工作原理

`servd` 会把自身二进制复制到一个私有的、按用户划分的实例目录，然后派生一个分离的监督者。监督者持有实例锁，暴露一个经认证的环回控制端点（供 `--status`/`--stop` 使用），并管理 worker 生命周期。内部握手仅在环回接口上以令牌认证。

## 一个典型流程

```bash
# 启动一个能在崩溃、以及控制它的 shell 退出后仍存活的预览
servd --spa=./frontend --proxy=/api/=http://localhost:9000/api/ --port=8080 --daemon

# 稍后查看它
servd --status --port=8080

# 用完停止
servd --stop --port=8080
```

同一时间只有一个守护进程能占用某端口；为同一端口启动第二个会报告已存在守护进程。
