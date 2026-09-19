// Central site constants. Public env vars (PUBLIC_*) may override at build time.
// SvelteKit exposes PUBLIC_* through $env (not import.meta.env, whose prefix is
// VITE_); dynamic/public yields undefined for unset keys, so defaults apply.
import { env } from '$env/dynamic/public';

export const SITE_URL = (env.PUBLIC_SITE_URL ?? 'https://servd.qingyu31.dev').replace(/\/+$/, '');
export const SITE_NAME = 'servd';
export const GITHUB_URL = env.PUBLIC_GITHUB_URL ?? 'https://github.com/qingyu31/servd';
export const NPM_PACKAGE = '@qingyu31/servd';

// Short, per-locale marketing strings reused by the landing page and metadata.
export const SITE_TAGLINE = {
	en: 'A tiny static, SPA, HTTP and WebSocket server in one Go binary.',
	zh: '一个由单个 Go 二进制提供的轻量静态、SPA、HTTP 与 WebSocket 服务器。'
} as const;
