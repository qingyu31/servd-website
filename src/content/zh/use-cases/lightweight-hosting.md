---
title: 轻量级托管
description: 用单个自包含二进制托管内部工具、演示、报告或小型站点 —— 无运行时、无配置，可选常驻。
summary: 把一个静态二进制指向某个目录并持续托管 —— 内部工具、演示、覆盖率报告或小型站点 —— 可选 TLS、Host 过滤与自我重启的守护进程。
order: 3
tags:
  - hosting
  - daemon
  - static
---

## 场景

你有一些小东西需要一个 URL：一个内部看板、给利益相关方的演示、生成的覆盖率报告、团队 wiki 导出、一个下载目录。为它搭一整套 web 服务器或 PaaS 太重，而一个随终端关闭就消失的开发服务器又算不上托管。

`servd` 正是中间档：单一的静态二进制，没有运行时依赖，也没有配置文件。把它指向一个目录，它就能正确地托管 —— 目录索引、`ETag` 再验证、gzip/brotli —— 并且可以选择在后台持续托管。

## 一条命令

```bash
servd --static=./site --port=8080
```

启动时 `servd` 会打印它解析出的内容，方便你确认上线的是正确的目录：

```text
servd 0.1.0 listening on 0.0.0.0:8080 (all IPv4 interfaces)
Hosts: unrestricted
  static / -> /you/site
```

如果产物是单页应用而非普通文件，改用 [`--spa`](/docs/static-and-spa/)，让客户端路由回退到 `index.html`。

## 让它常驻

对于人们会反复访问的内容，用监督者以分离方式运行。它会以指数退避重启崩溃的 worker，并按端口控制：

```bash
servd --static=./site --port=8080 --daemon
servd --status --port=8080
servd --stop   --port=8080
```

`--daemon` 只在 worker 真正开始监听后才返回，因此可以安全地写进启动脚本。重启策略与日志轮转见[守护进程模式](/docs/daemon/)。

## 加上 TLS 与 Host 过滤

以 HTTPS 暴露它，并限制它应答哪些主机名，避免共享机器在意外的虚拟主机下提供它：

```bash
servd --static=./site --port=8443 \
  --tls-cert=./fullchain.pem --tls-key=./privkey.pem \
  --host=tools.example.com
```

细节见 [TLS](/docs/tls/) 与 [CORS 与 Host 过滤](/docs/cors-and-hosts/)。Host 过滤是路由守卫而非认证 —— 任何敏感内容都应在前面放真正的认证。

## 在容器中

由于服务器是单个静态链接二进制，整个托管镜像可以只是二进制加上你的文件：

```dockerfile
FROM scratch
COPY --from=build /out/servd /servd
COPY --from=build /out/site /site
EXPOSE 8080
ENTRYPOINT ["/servd"]
CMD ["--static=/site", "--port=8080"]
```

没有 shell、没有包管理器、没有基础 OS 的补丁面 —— 总共几兆。

## 何时该用更大的工具

如果你需要为多个域名做虚拟主机、复杂的重写规则或流量级负载均衡，完整的反向代理才是合适的工具。而对于「一个需要可靠 URL 的目录」—— 内部使用、演示或一个小型公开页面 —— `servd` 把整件事收敛为单个二进制加几个参数。
