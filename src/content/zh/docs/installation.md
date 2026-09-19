---
title: 安装
description: 从 npm 安装 servd、免安装直接运行，或从源码构建这个单一的 Go 二进制。
group: start
order: 2
---

## 从 npm 安装

`servd` 以「极小启动器 + 各平台原生二进制」的形式发布。与你的操作系统和架构匹配的二进制会作为可选依赖自动拉取。

```bash
npm install --global @qingyu31/servd
```

该包带作用域，但它安装的命令就是 `servd`：

```bash
servd --version
```

需要 Node.js >= 18，且仅供启动器使用。

## 免安装运行

用 `npx`（或 `pnpm dlx`）按需运行：

```bash
npx @qingyu31/servd --static=./dist --port=3000
```

## 支持的平台

已发布原生二进制的平台：

- `darwin-x64`、`darwin-arm64`（macOS）
- `linux-x64`、`linux-arm64`
- `win32-x64`、`win32-arm64`（Windows）

## 如果可选依赖被跳过

某些包管理器或 CI 配置会跳过可选依赖。请启用它们后重新安装：

```bash
npm install --include=optional @qingyu31/servd
```

如果启动器找不到二进制，它会打印可操作的错误并指出缺失的平台包，例如 `@qingyu31/servd-linux-arm64`。

## 从源码构建

`servd` 是标准的 Go 程序（Go 1.24+）。克隆仓库并构建：

```bash
go build -o bin/servd ./cmd/servd
./bin/servd --help
```

按常规方式交叉编译到其它目标：

```bash
CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -o servd ./cmd/servd
```

## 下一步

前往[快速开始](/docs/quick-start/)托管你的第一个目录。
