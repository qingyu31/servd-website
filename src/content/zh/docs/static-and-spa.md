---
title: 静态与 SPA
description: 静态文件与单页应用的挂载、目录索引、缓存再验证与内容协商。
group: guides
order: 1
---

## 挂载目录

`--static` 托管一个目录；`--spa` 托管一个目录并带 `index.html` 回退。两者都接受裸目录（挂载在 `/`）或 `mount=directory` 形式，且都可重复：

```bash
servd --static=./dist --static=/assets=./public/assets --spa=/admin=./admin-build
```

- `--static=./dist` 把 `./dist` 挂载在 `/`。
- `--static=/assets=./public/assets` 把该目录挂载在 `/assets`。
- **最长挂载优先：** `/assets/...` 先于 `/` 匹配。
- 你可以把多个目录挂到同一个挂载点；它们按顺序尝试，托管第一个存在的文件（一个简单的叠加/回退链）。

## 目录与索引文件

对目录的请求会重定向（308）到带尾斜杠的形式，随后在存在时托管 `index.html`：

- `GET /docs` -> `301/308` -> `/docs/`
- `GET /docs/` -> 存在时托管 `docs/index.html`

不带尾斜杠但解析到目录的请求会被重定向，从而让相对链接与规范 URL 保持稳定。

## SPA 回退

`--spa` **仅**在以下两点同时成立时才回退到 `index.html`：

1. 请求路径**没有文件扩展名**（是导航，而非资源）。
2. 请求带 `Accept: text/html`。

这意味着像 `/dashboard/settings` 这样的客户端路由会渲染应用，而 `/app.js`、`/styles.css`、`/logo.png` 会作为真实文件托管 —— 真正缺失的资源仍然返回 `404`，而不是 HTML。

## 缓存

- **静态文件**带 `Cache-Control: no-cache` 以及弱 `ETag` 和 `Last-Modified`，因此浏览器会再验证，并在内容未变时拿到快速的 `304 Not Modified` 响应。
- **SPA HTML**（来自 `--spa` 挂载的 `text/html`）带 `Cache-Control: no-store`，因此导航始终看到最新的外壳。
- **错误响应**为 `no-store`，并会剥离实体头部。

`HEAD` 与条件请求（`If-None-Match`、`If-Modified-Since`、`If-Range`）都会被遵守。

## 压缩

`servd` 依据 `Accept-Encoding` 协商 `Content-Encoding`，并加上 `Vary: Accept-Encoding`：

- 如果存在预压缩的同级文件 `file.ext.gz` 或 `file.ext.br`，且不比原文件旧，则直接托管（在被接受时优先 Brotli）。
- 否则，可压缩的文本类型（`text/*`、`application/json`、`application/javascript`、`image/svg+xml`、`application/wasm` 等）会被即时 gzip 压缩。

identity 与预压缩响应都支持 Range 请求；当应用了某种编码时会禁用 multipart range，以保证分帧正确。

## 内容类型

类型来自文件扩展名，经由系统 MIME 表得出；未知类型回退到内容嗅探，默认为 `application/octet-stream`。每个响应都会设置 `X-Content-Type-Options: nosniff`。

## 路径安全

包含 `//`、`.`/`..` 段、反斜杠或 NUL 字节的请求会被以 `400` 拒绝。文件通过操作系统级的 rooted handle 打开，因此请求永远无法逃逸出所挂载的目录。只托管普通文件；逃逸出根目录的符号链接与特殊文件会被拒绝。
