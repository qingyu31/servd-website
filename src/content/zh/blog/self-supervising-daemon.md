---
title: 单一二进制里的自我监督守护进程
description: servd --daemon 如何分离出一个受监督的 worker、带退避地重启崩溃、并按端口保持可控 —— 无需任何外部进程管理器。
date: 2026-09-18
tags:
  - daemon
  - go
  - reliability
readingTime: 7
author: qingyu31
draft: false
---

「把这个目录挂在 8080 端口，崩溃了就重启，并让我稍后能查看它」—— 这件事不该要求你安装一套进程管理器。`servd --daemon` 用同一个单一二进制、以两进程监督者模型做到了。本文解释它如何工作，以及为何这样设计。

## 命令

```bash
servd --spa=./frontend --port=8080 --daemon
servd --status --port=8080
servd --stop   --port=8080
```

`--daemon` **只在 worker 真正开始监听之后**才返回，并打印监督者/worker 的 PID 与日志路径：

```text
servd 0.1.0 http daemon started on 0.0.0.0:8080 (supervisor pid 41233, worker pid 41240)
log: /Users/you/Library/Caches/servd/8080/servd.log
```

## 两个进程，而非一个

一个自我监督的守护进程无法在硬崩溃后重启自己 —— 那个本该执行重启的东西，正是崩溃了的东西。于是 `servd` 把角色拆开：

- **监督者（supervisor）**持有实例锁、暴露控制端点、管理 worker 生命周期。它不做任何托管。
- **worker** 运行真正的 HTTP 服务器。如果它 panic 或退出，监督者会察觉并重启它。

两者都是*同一个二进制*，只是被以环境中设定的内部角色重新执行；没有第二个程序需要分发。当你运行 `servd --daemon` 时，你所调用的进程会变成一个短命的**启动器（starter）**：它派生一个分离的监督者，等待一次 "ready" 握手，打印横幅，然后退出。监督者与 worker 会比你的 shell 活得更久。

## 重启能熬过 `go run` 与重装

在派生任何东西之前，启动器会把**自身的可执行文件拷贝**到实例目录内一个私有的、按代（generation）划分的文件夹里，监督者运行的是*那个*副本。这是个细节，却有实在的回报：即便原始二进制消失了 —— 因为 `go run` 清理了它的临时构建，或一次 `npm install` 半路替换了启动器的目标 —— 重启依然有效。上一代的副本会在下次启动时被清扫。

## 按用户、按端口，并加锁

状态存放在用户缓存目录下，按端口划分作用域：

```text
<UserCacheDir>/servd/<port>/
  instance.lock   launch.lock   control.json   servd.log   bin-<gen>/servd
```

该目录以 `0700` 创建，若发现更宽松的权限会被重新收紧。两把锁协调访问：`launch.lock` 串行化并发的启动/停止命令，使两个 shell 无法竞态；`instance.lock` 由运行中的监督者持有 —— 这正是 `--status` 在拨号之前就能知道有没有人在家的方式。为一个已被占用的端口启动第二个守护进程，会报告已存在一个，而不是争抢 socket。

## 一个在共享机器上也可信的控制端点

`--status` 与 `--stop` 不去猜 PID。监督者会写一个小小的 `control.json`，内含它的环回控制地址、一个随机的 32 字节令牌，以及端口。一条控制命令必须出示那个令牌，并以**常量时间**比较，且地址在拨号前会被校验为**仅环回**。因此控制平面只能从本机抵达，且只能被某个能读取你 `0700` 实例目录的东西抵达 —— 而不是从你服务器所暴露的网络抵达。

## 重启状态机

监督者在 `starting -> running` 间循环，并在 worker 退出时于 `backoff` 与 `failed` 之间抉择：

- 崩溃会以**指数退避**重启 —— 1s、2s、4s、8s、16s —— 最多**连续五次**。
- 持续存活 **60 秒**的 worker 会重置预算，因此一个每天只打一次嗝的长命服务器永远不会累积「三振」。
- 预算耗尽时，实例进入 `failed` 并**保持**该状态，直到你 `--stop` 它。它刻意不会永远空转、反复锤打一个坏掉的配置。

```text
servd :8080 restarting (restart 2/5, next in 2000ms, last exit: exit status 1)
```

有一个刻意的例外：**首次**启动若从未就绪，会被视为配置错误，立即上报，且*不*重试。如果端口被占用或证书路径写错了，重启五次只会是噪音 —— 你会立刻拿到真正的错误。

## 停止先优雅，后强制

`--stop` 会通过 worker 的管理连接发送一条停止命令，让它干净关闭 —— 排空监听器，并且重要的是，关闭任何打开的 [WebSocket 隧道](/blog/one-port-websocket-proxy/)。如果 worker 在停止超时内没有退出，监督者会杀掉它拥有的进程。无论哪种方式，实例锁都会被释放、`control.json` 被移除，因此立即重启绝不会与正在退出的实例相撞。

## 不吃磁盘的日志

监督者与 worker 的输出共享一个按端口划分的日志文件，在 **5 MiB** 时**轮转**，保留单份备份（`servd.log` 与 `servd.log.1`）。worker 的 stdout/stderr 经监督者管道传输并加前缀，因此一个守护化服务器的日志读起来与前台运行时一致。

## 为什么这很重要

结果是一个表现得像受监督服务的预览服务器 —— 重启、健康状态、干净停止、有界日志 —— 却零外部依赖、单一二进制。运维面见[守护进程模式](/docs/daemon/)；完整示例见[常驻演示用例](/use-cases/demo-daemon/)。
