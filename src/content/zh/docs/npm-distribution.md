---
title: npm 分发
description: servd 如何以「单个启动器 + 各平台二进制」的形式发布，以及启动器如何解析它们。
group: reference
order: 2
---

## 包的形态

已发布的 `@qingyu31/servd` 包**只含一个很小的 Node 启动器**（`npm/bin/servd.cjs`）。真正的服务器是一组按平台划分的包，每个包内含一个原生二进制：

```
@qingyu31/servd              -> 仅启动器（极小）
@qingyu31/servd-darwin-x64   -> bin/servd
@qingyu31/servd-darwin-arm64 -> bin/servd
@qingyu31/servd-linux-x64    -> bin/servd
@qingyu31/servd-linux-arm64  -> bin/servd
@qingyu31/servd-win32-x64    -> bin/servd.exe
@qingyu31/servd-win32-arm64  -> bin/servd.exe
```

这些平台包被声明为主包的**可选依赖**，并带 `os` 与 `cpu` 限制，因此包管理器只会下载与当前机器匹配的那一个。这与 esbuild、SWC、Biome 等工具采用的模式相同：没有 postinstall 下载，没有安装脚本。

## 启动器做了什么

每次调用时，启动器会：

1. 把 `process.platform` + `process.arch` 映射到一个包名（例如 `linux-arm64` -> `@qingyu31/servd-linux-arm64`）。
2. 用 `require.resolve` 解析该包的二进制。
3. 以 `stdio: 'inherit'` 派生它，原样转发所有参数。
4. 转发信号（SIGINT/SIGTERM 等，以及 Windows 控制台事件），并保留子进程的退出码或终止信号。
5. 如果启动器自身退出，就杀掉子进程，因此分离的服务器永远不会变成孤儿。

在 POSIX 上，子进程运行在自己的会话中，因此终端信号不会被投递两次。

## 二进制缺失

如果匹配的可选包不存在（例如可选依赖被禁用），启动器会以清晰、可操作的信息失败，而不是静默地什么都不做：

```
servd: Missing optional package @qingyu31/servd-linux-arm64 or its binary.
Reinstall @qingyu31/servd with optional dependencies enabled: npm install --include=optional @qingyu31/servd
```

## 构建这些包

仓库会从源码构建每个平台并打出 tarball：

```bash
pnpm run build              # 交叉编译全部六个平台到 dist/npm
pnpm run build -- --platform=darwin-arm64
pnpm run pack               # 构建 + npm pack 到 dist/tarballs
```

每个二进制都以 `CGO_ENABLED=0`、`-trimpath` 和 `-ldflags "-s -w -X go.qingyu31.com/servd/internal/app.Version=<version>"` 编译，因此 `servd --version` 报告的版本与 npm 版本一致。仓库 README 记录了完整的发布流程（`pnpm run release`）。
