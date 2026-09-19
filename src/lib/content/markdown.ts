import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import Shiki from '@shikijs/markdown-it';
import type { BundledLanguage } from 'shiki';
import { base } from '$app/paths';
import type { TocItem } from './types';

// Every markdown file's raw source, inlined at build time.
const modules = import.meta.glob('/src/content/**/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

export interface ParsedFile {
	lang: string;
	kind: string; // 'docs' | 'use-cases' | 'blog'
	slug: string;
	data: Record<string, unknown>;
	content: string;
}

export function slugify(text: string): string {
	return text
		.trim()
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\s-]/gu, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

// Path shape: /src/content/{lang}/{kind}/{slug}.md
export function parseAll(): ParsedFile[] {
	return Object.entries(modules).map(([path, raw]) => {
		const parts = path.split('/');
		const slug = (parts[parts.length - 1] ?? '').replace(/\.md$/, '');
		const idx = parts.indexOf('content');
		const parsed = matter(raw);
		return {
			lang: parts[idx + 1] ?? 'en',
			kind: parts[idx + 2] ?? 'docs',
			slug,
			data: parsed.data as Record<string, unknown>,
			content: parsed.content
		};
	});
}

export const allFiles = parseAll();

// Bundled grammar ids. 'text'/'plaintext' are shiki built-ins (always
// available, nothing to load) so they are not listed here.
const SHIKI_LANGS: BundledLanguage[] = [
	'bash',
	'shell',
	'sh',
	'json',
	'javascript',
	'typescript',
	'go',
	'html',
	'css',
	'yaml',
	'toml',
	'http',
	'diff',
	'nginx',
	'dockerfile',
	'ini'
];

// 'plaintext' is a shiki built-in but is not part of the BundledLanguage union,
// so it needs a cast to serve as the unknown-language fallback.
const PLAIN_TEXT = 'plaintext' as unknown as BundledLanguage;

let shikiPromise: Promise<any> | null = null;
function getShiki(): Promise<any> {
	if (!shikiPromise) {
		shikiPromise = Shiki({
			themes: { light: 'github-light', dark: 'github-dark' },
			langs: SHIKI_LANGS,
			// Any fence whose language is not bundled above degrades to plain
			// text instead of throwing and failing the prerender.
			fallbackLanguage: PLAIN_TEXT
		});
	}
	return shikiPromise;
}

// Root-relative links that point at localized site sections. These are
// rewritten to include the base path and current locale; other root-relative
// links (e.g. /og.png, /images/...) are left untouched.
const SECTION = /^\/(docs|use-cases|blog)(\/|$)/;

/** Render markdown to HTML with syntax highlighting and a collected TOC (h2/h3). */
export async function renderMarkdown(
	source: string,
	lang: string
): Promise<{ html: string; toc: TocItem[] }> {
	const shiki = await getShiki();
	const toc: TocItem[] = [];
	const md = new MarkdownIt({ html: false, linkify: true, typographer: false, breaks: false });
	md.use(shiki);

	md.renderer.rules.heading_open = (tokens, idx, options, _env, self) => {
		const token = tokens[idx];
		const text = tokens[idx + 1]?.content ?? '';
		const id = slugify(text) || `section-${idx}`;
		token.attrSet('id', id);
		const level = Number(token.tag.slice(1));
		if (level === 2 || level === 3) toc.push({ level, id, text });
		return self.renderToken(tokens, idx, options);
	};

	const defaultLinkOpen =
		md.renderer.rules.link_open ?? ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));
	md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
		const href = tokens[idx].attrGet('href') ?? '';
		if (/^https?:\/\//.test(href)) {
			tokens[idx].attrSet('target', '_blank');
			tokens[idx].attrSet('rel', 'noopener noreferrer');
		} else if (href === '/' || SECTION.test(href)) {
			tokens[idx].attrSet('href', `${base}/${lang}${href}`);
		}
		return defaultLinkOpen(tokens, idx, options, env, self);
	};

	return { html: md.render(source), toc };
}
