---
title: CI 产物与容器预览
description: 在 CI 或容器中，用单个无运行时的静态二进制托管构建产物与预览部署。
summary: servd 是一个自包含的 Go 二进制，无需 Node 或 libc 运行时。把它放进 scratch/distroless 镜像或 CI 任务，用来托管产物、预览部署并对构建做冒烟测试。
order: 6
tags:
  - ci
  - docker
  - artifacts
---

## 场景

你想托管构建产物 —— 前端包、生成的文档、覆盖率报告、可下载的发布目录 —— 从 CI 或一个极小的容器里。仅仅为了跑 `http-server` 就拉进一个完整的 Node 镜像，意味着数百兆体积和一个你随后得打补丁的运行时。你想要的是**自包含**、启动快、没有依赖的东西。

`servd` 是单一的静态链接 Go 二进制（`CGO_ENABLED=0`）。它能 `FROM scratch` 运行。

## 在容器中

在一个阶段构建产物，从最小化的最终镜像里托管它：

```dockerfile
# ---- 构建阶段 ----
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build   # 产出 /app/dist

# ---- 托管阶段 ----
FROM golang:1.24 AS servd
RUN CGO_ENABLED=0 go install go.qingyu31.com/servd/cmd/servd@latest

FROM scratch
COPY --from=servd /go/bin/servd /servd
COPY --from=build /app/dist /site
EXPOSE 8080
ENTRYPOINT ["/servd"]
CMD ["--static=/site", "--port=8080"]
```

最终镜像只有二进制加上你的文件 —— 几兆大小，没有 shell、没有包管理器、没有来自基础 OS 的 CVE 面。

## 在 CI 任务中

托管产物，并在发布前对其做冒烟测试：

```bash
servd --static=./dist --port=8080 --daemon
curl -fsS http://localhost:8080/ >/dev/null        # 构建坏了就让任务失败
servd --status --port=8080                          # 未运行时以非零码退出
```

因为 `--daemon` 只在 worker 开始监听后才返回，而 `--status` 在实例挂掉时以非零码退出，两者都能干净地嵌入流水线步骤。

## 为什么它适合 CI

- **无需安装运行时。** 单个二进制；不用 `apt-get`，没有 Node 版本漂移。
- **可预测的退出码。** `0` 成功、`1` 运行时/启停失败、`2` 非法用法 —— 便于分支判断。
- **正确的 HTTP 语义。** 目录重定向、`ETag`/`Last-Modified` 再验证、gzip/brotli 与 `Range` 支持，意味着产物的行为与生产一致。
- **默认安全。** rooted 文件访问拒绝 `..` 穿越；`--host` 过滤避免在共享 runner 上应答意外的虚拟主机。

## 发布产物

带目录索引托管一个下载目录，让人们浏览它：

```bash
servd --static=./dist/tarballs --port=8080 --cors=*
```

`--cors=*` 头部让基于浏览器的工具能跨源拉取产物。容器与交叉编译细节见 [npm 分发](/docs/npm-distribution/)与 [CLI 参考](/docs/cli/)。
