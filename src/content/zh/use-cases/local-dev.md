---
title: 预览本地构建产物
description: 按真实托管的样子提供静态构建产物，带目录索引、缓存与压缩。
summary: 把 servd 指向 dist/、build/ 或 _site/，一条命令预览生产构建 —— 无 Node 运行时，开箱即得正确的缓存与 gzip/brotli。
order: 1
tags:
  - static
  - preview
  - local
---

## 场景

你生成了一个静态站点或前端构建产物 —— Hugo、Jekyll、Eleventy、`vite build`、`create-react-app`、Angular、Astro —— 并想在发布前查看**真实产物**。用 `file://` 打开 `index.html` 会破坏绝对路径、路由与 fetch 调用。而开发服务器（`vite dev`、`webpack serve`）展示的是你的源码，不是你即将部署的产物。

`servd` 通过 HTTP 托管构建目录，正如静态托管服务会做的那样。

## 一条命令

```bash
servd --static=./dist --port=3000
```

打开 `http://localhost:3000/`。启动时 `servd` 会打印它解析出的内容，方便你确认挂载了正确的目录：

```text
servd 0.1.0 listening on 0.0.0.0:3000 (all IPv4 interfaces)
Hosts: unrestricted
  static / -> /you/project/dist
```

## 免费获得的能力

- **目录索引。** `/docs` 重定向到 `/docs/`，并在存在时托管 `docs/index.html`，因此相对链接与规范 URL 保持稳定。
- **贴近真实的缓存。** 文件带 `Cache-Control: no-cache` 以及弱 `ETag` 和 `Last-Modified`，因此重复加载会返回快速的 `304 Not Modified` —— 正是 CDN 或源站会给你的行为。
- **压缩。** 预压缩的 `file.gz` / `file.br` 同级文件会被直接托管；否则可压缩文本会被即时 gzip，并带上正确的 `Vary: Accept-Encoding`。
- **路径安全。** `..`、`//`、反斜杠与 NUL 字节会被拒绝，文件通过 rooted handle 打开，因此服务器无法被诱骗去读取 `./dist` 之外的内容。

## 实用变体

托管多个目录并在同一挂载点叠加它们（第一个存在的文件胜出）：

```bash
servd --static=./dist --static=/assets=./public/assets --port=3000
```

限制应答哪些 `Host` 头，当预览可从网络访问时很有用：

```bash
servd --static=./dist --host=localhost --port=3000
```

如果产物是单页应用而非多页站点，改用 [`--spa`](/use-cases/spa-with-api/)，让客户端路由回退到 `index.html`。
