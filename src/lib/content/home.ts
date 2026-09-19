import type { Lang } from '$lib/i18n/locales';

export interface Feature {
	icon: string;
	title: string;
	body: string;
}

export interface ComparisonRow {
	capability: string;
	http: string;
	nginx: string;
	servd: string;
	servdWin?: boolean;
}

export interface TermLine {
	type: 'cmd' | 'out' | 'ok' | 'muted';
	text: string;
}

export interface HomeContent {
	badge: string;
	titleTop: string;
	titleAccent: string;
	subtitle: string;
	primaryCta: string;
	secondaryCta: string;
	features: Feature[];
	comparison: ComparisonRow[];
	terminal: TermLine[];
}

// Shared install commands (identical across locales).
export const installCommands = [
	{ id: 'npm', label: 'npm', command: 'npm install --global @qingyu31/servd' },
	{ id: 'pnpm', label: 'pnpm', command: 'pnpm add --global @qingyu31/servd' },
	{ id: 'npx', label: 'npx', command: 'npx @qingyu31/servd' },
	{ id: 'go', label: 'go install', command: 'go install go.qingyu31.com/servd/cmd/servd@latest' }
];

export const home: Record<Lang, HomeContent> = {
	en: {
		badge: 'One binary. Zero runtime dependencies.',
		titleTop: 'Serve static, SPA, proxy and WebSocket —',
		titleAccent: 'from a single binary.',
		subtitle:
			'servd is a self-contained development, testing and lightweight hosting server — a drop-in alternative to http-server with first-class proxies, TLS and a self-supervising daemon.',
		primaryCta: 'Read the docs',
		secondaryCta: 'View use cases',
		features: [
			{
				icon: 'terminal',
				title: 'Zero configuration',
				body: 'No config file and no required flags: run servd and it serves the current directory. Everything else is opt-in per-mount flags.'
			},
			{
				icon: 'layers',
				title: 'Static & SPA',
				body: 'Serve one or more directories at mount prefixes, with content-negotiated SPA fallback to index.html.'
			},
			{
				icon: 'shuffle',
				title: 'HTTP proxy',
				body: 'Forward a mount prefix to an upstream URL with path rewriting. Longest mount wins; proxies beat files.'
			},
			{
				icon: 'plug',
				title: 'WebSocket proxy',
				body: 'Tunnel ws:// and wss:// upstreams through the same port as your static site and API.'
			},
			{
				icon: 'lock',
				title: 'HTTPS & WSS',
				body: 'Terminate TLS 1.2+ from a PEM cert and key. The port serves both HTTPS and WSS over HTTP/1.1.'
			},
			{
				icon: 'shield',
				title: 'CORS & host filters',
				body: 'Allow a wildcard or explicit origins (no credentials), and restrict which Host headers are accepted.'
			},
			{
				icon: 'repeat',
				title: 'Daemon mode',
				body: 'Run detached with a supervisor that restarts a crashed worker using exponential backoff.'
			},
			{
				icon: 'bolt',
				title: 'Zero dependencies',
				body: 'A single static binary distributed via npm as per-platform packages. No Node runtime needed to serve.'
			}
		],
		comparison: [
			{ capability: 'Zero-config start', http: 'Yes (single root)', nginx: 'No (needs a config file)', servd: 'Yes (serves the current directory)', servdWin: true },
			{ capability: 'Config file & reload', http: 'Flags only', nginx: 'nginx.conf + reload', servd: 'None; flags only', servdWin: true },
			{ capability: 'Multiple HTTP proxy mounts', http: 'No (single --proxy fallback)', nginx: 'Yes (location blocks)', servd: 'Yes (--proxy, repeatable)', servdWin: true },
			{ capability: 'Proxy path rewriting', http: 'No', nginx: 'Yes (rewrite)', servd: 'Yes (mount=target)', servdWin: true },
			{ capability: 'WebSocket proxy', http: 'No', nginx: 'Yes (Upgrade headers)', servd: 'Yes (--ws)' },
			{ capability: 'SPA fallback', http: 'Basic', nginx: 'Yes (try_files)', servd: 'Yes (content-negotiated)', servdWin: true },
			{ capability: 'CORS', http: 'Yes', nginx: 'Manual headers', servd: 'Yes (--cors)' },
			{ capability: 'TLS / HTTPS', http: 'Yes', nginx: 'Yes', servd: 'Yes (TLS 1.2+, HTTP/1.1)' },
			{ capability: 'Background daemon with restart', http: 'No', nginx: 'Yes (master/worker)', servd: 'Yes (--daemon)', servdWin: true },
			{ capability: 'Runtime & learning curve', http: 'Node.js; low', nginx: 'Separate server; steep', servd: 'None (single static binary); low', servdWin: true }
		],
		terminal: [
			{
				type: 'cmd',
				text: 'servd --spa=./frontend --proxy=/api/=http://localhost:9000/api/ --ws=/ws=ws://localhost:9000/ws --port=8080'
			},
			{ type: 'ok', text: 'servd 0.1.0 listening on 0.0.0.0:8080 (all IPv4 interfaces)' },
			{ type: 'muted', text: 'Hosts: unrestricted' },
			{ type: 'out', text: '  spa / -> /app/frontend' },
			{ type: 'out', text: '  proxy /api -> http://localhost:9000/api/' },
			{ type: 'out', text: '  proxy /ws -> ws://localhost:9000/ws' }
		]
	},
	zh: {
		badge: '单一二进制，零运行时依赖。',
		titleTop: '静态、SPA、代理与 WebSocket ——',
		titleAccent: '都由单个二进制提供。',
		subtitle:
			'servd 是一个自包含的开发、测试与轻量托管服务器 —— 可作为 http-server 的替代品，并原生支持反向代理、TLS 与自我监督的守护进程。',
		primaryCta: '阅读文档',
		secondaryCta: '查看使用场景',
		features: [
			{
				icon: 'terminal',
				title: '零配置',
				body: '无需配置文件、无需必选参数：直接运行 servd 即托管当前目录，其余能力均为按需的挂载参数。'
			},
			{
				icon: 'layers',
				title: '静态与 SPA',
				body: '将一个或多个目录挂载到路径前缀，并支持基于内容协商的 SPA 回退到 index.html。'
			},
			{
				icon: 'shuffle',
				title: 'HTTP 代理',
				body: '将挂载前缀转发到上游 URL 并重写路径。最长挂载优先，代理优先于同挂载点的文件。'
			},
			{
				icon: 'plug',
				title: 'WebSocket 代理',
				body: '通过与静态站点、API 相同的端口隧道转发 ws:// 与 wss:// 上游。'
			},
			{
				icon: 'lock',
				title: 'HTTPS 与 WSS',
				body: '基于 PEM 证书与密钥终结 TLS 1.2+。同一端口通过 HTTP/1.1 提供 HTTPS 与 WSS。'
			},
			{
				icon: 'shield',
				title: 'CORS 与 Host 过滤',
				body: '允许通配符或显式来源（不含凭证），并可限制接受哪些 Host 请求头。'
			},
			{
				icon: 'repeat',
				title: '守护进程模式',
				body: '以分离方式运行，监督进程使用指数退避重启崩溃的 worker。'
			},
			{
				icon: 'bolt',
				title: '零依赖',
				body: '通过 npm 以各平台包分发的单一静态二进制，托管服务无需 Node 运行时。'
			}
		],
		comparison: [
			{ capability: '零配置启动', http: '是（单一根目录）', nginx: '否（需要配置文件）', servd: '是（托管当前目录）', servdWin: true },
			{ capability: '配置文件与 reload', http: '仅参数', nginx: 'nginx.conf + reload', servd: '无配置文件，仅参数', servdWin: true },
			{ capability: '多个 HTTP 代理挂载', http: '否（仅 --proxy 回退）', nginx: '是（location 块）', servd: '是（--proxy 可重复）', servdWin: true },
			{ capability: '代理路径重写', http: '否', nginx: '是（rewrite）', servd: '是（mount=target）', servdWin: true },
			{ capability: 'WebSocket 代理', http: '否', nginx: '是（Upgrade 头）', servd: '是（--ws）' },
			{ capability: 'SPA 回退', http: '基础', nginx: '是（try_files）', servd: '是（内容协商）', servdWin: true },
			{ capability: 'CORS', http: '是', nginx: '手动加头', servd: '是（--cors）' },
			{ capability: 'TLS / HTTPS', http: '是', nginx: '是', servd: '是（TLS 1.2+，HTTP/1.1）' },
			{ capability: '带重启的后台守护进程', http: '否', nginx: '是（master/worker）', servd: '是（--daemon）', servdWin: true },
			{ capability: '运行时与上手成本', http: 'Node.js；低', nginx: '独立服务器；高', servd: '无（单一静态二进制）；低', servdWin: true }
		],
		terminal: [
			{
				type: 'cmd',
				text: 'servd --spa=./frontend --proxy=/api/=http://localhost:9000/api/ --ws=/ws=ws://localhost:9000/ws --port=8080'
			},
			{ type: 'ok', text: 'servd 0.1.0 listening on 0.0.0.0:8080 (all IPv4 interfaces)' },
			{ type: 'muted', text: 'Hosts: unrestricted' },
			{ type: 'out', text: '  spa / -> /app/frontend' },
			{ type: 'out', text: '  proxy /api -> http://localhost:9000/api/' },
			{ type: 'out', text: '  proxy /ws -> ws://localhost:9000/ws' }
		]
	}
};
