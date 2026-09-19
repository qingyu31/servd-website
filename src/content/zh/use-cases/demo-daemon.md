---
title: 常驻的演示或工具
description: 在后台运行演示、kiosk 或内部工具，由监督者在崩溃时重启它。
summary: servd --daemon 分离出一个按用户与端口划分作用域的受监督实例。它带退避地重启崩溃的 worker、把日志写入轮转文件，并用 --status 与 --stop 控制。
order: 5
tags:
  - daemon
  - background
  - reliability
---

## 场景

你想让一个构建产物、演示、kiosk 或小型内部工具**持续提供**服务 —— 熬过你关掉的终端、断开的 SSH 会话，以及偶发的崩溃。前台的 `servd` 会随它的 shell 一起死掉。而为了「就是把这个目录挂在 8080 端口」动用一套进程管理器又太重。

`servd --daemon` 会在一个保持 worker 存活的监督者之下，分离地运行服务器。

## 一条命令

```bash
servd --spa=./frontend --proxy=/api/=http://localhost:9000/api/ --port=8080 --daemon
```

`--daemon` **只在 worker 真正开始监听之后**才返回，因此可以安全地写进脚本、放到健康检查之后：

```text
servd 0.1.0 http daemon started on 0.0.0.0:8080 (supervisor pid 41233, worker pid 41240)
log: /Users/you/Library/Caches/servd/8080/servd.log
```

## 按端口控制

守护进程按**用户与端口**划分作用域，控制参数只接受 `--port`：

```bash
servd --status --port=8080   # running / restarting / failed、PID、重启次数、日志路径
servd --stop   --port=8080   # 停止它；停止一个不存在的守护进程会静默成功
```

`--status` 在实例未运行时以非零码退出，因此可以直接嵌入脚本与 CI 门禁。

## 重启策略

- 崩溃的 worker 会以**指数退避**重启，最多**连续五次**。
- 持续存活的 worker 会重置重启预算。
- 一旦预算耗尽，实例会被标记为 `failed` 并保持该状态，直到你 `--stop` 再重新启动 —— 它不会永远空转。

```text
servd :8080 restarting (restart 2/5, next in 2000ms, last exit: exit status 1)
```

## 日志

监督者与 worker 的输出写入一个按端口划分的日志文件（路径由 `--daemon` 和 `--status` 打印）。日志在 **5 MiB** 时**轮转**，保留一份备份（`servd.log` 与 `servd.log.1`），因此长时间运行的演示不会撑爆磁盘。

## 一个典型流程

```bash
# 启动一个能在崩溃与 shell 退出后仍存活的预览
servd --spa=./frontend --port=8080 --daemon

# 稍后查看它
servd --status --port=8080

# 用完停止
servd --stop --port=8080
```

同一时间只有一个守护进程能占用某端口；为同一端口启动第二个会报告已存在一个。加上 [TLS](/use-cases/https-preview/) 让守护进程通过 HTTPS 提供服务。监督者、锁与控制端点如何工作，见[守护进程模式](/docs/daemon/)。
