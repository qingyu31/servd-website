import { allFiles, renderMarkdown, type ParsedFile } from './markdown';
import type { Post, PostMeta } from './types';

const postsFiles = allFiles.filter((f) => f.kind === 'blog');

function toMeta(f: ParsedFile): PostMeta {
	const words = (f.content ?? '').trim().split(/\s+/).filter(Boolean).length;
	return {
		slug: f.slug,
		lang: f.lang,
		title: String(f.data.title ?? f.slug),
		description: String(f.data.description ?? ''),
		date: String(f.data.date ?? '1970-01-01'),
		tags: Array.isArray(f.data.tags) ? f.data.tags.map(String) : [],
		readingTime: Number(f.data.readingTime ?? Math.max(1, Math.round(words / 200))),
		author: String(f.data.author ?? 'servd'),
		draft: Boolean(f.data.draft)
	};
}

export function listPosts(lang: string): PostMeta[] {
	return postsFiles
		.filter((f) => f.lang === lang)
		.map(toMeta)
		.filter((p) => !p.draft)
		.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

export function latestPosts(lang: string, n = 3): PostMeta[] {
	return listPosts(lang).slice(0, n);
}

export function allPostSlugs(): string[] {
	return [...new Set(postsFiles.filter((f) => !f.data.draft).map((f) => f.slug))];
}

export async function getPost(lang: string, slug: string): Promise<Post | null> {
	const f = postsFiles.find((x) => x.lang === lang && x.slug === slug && !x.data.draft);
	if (!f) return null;
	const { html, toc } = await renderMarkdown(f.content, lang);
	return { ...toMeta(f), body: html, toc };
}
