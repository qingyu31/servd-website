import { allFiles, renderMarkdown, type ParsedFile } from './markdown';
import type { UseCase, UseCaseMeta } from './types';

const caseFiles = allFiles.filter((f) => f.kind === 'use-cases');

function toMeta(f: ParsedFile): UseCaseMeta {
	return {
		slug: f.slug,
		lang: f.lang,
		title: String(f.data.title ?? f.slug),
		description: String(f.data.description ?? ''),
		summary: String(f.data.summary ?? f.data.description ?? ''),
		order: Number(f.data.order ?? 100),
		tags: Array.isArray(f.data.tags) ? f.data.tags.map(String) : []
	};
}

export function listUseCases(lang: string): UseCaseMeta[] {
	return caseFiles
		.filter((f) => f.lang === lang)
		.map(toMeta)
		.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export function allUseCaseSlugs(): string[] {
	return [...new Set(caseFiles.map((f) => f.slug))];
}

export async function getUseCase(lang: string, slug: string): Promise<UseCase | null> {
	const f = caseFiles.find((x) => x.lang === lang && x.slug === slug);
	if (!f) return null;
	const { html, toc } = await renderMarkdown(f.content, lang);
	return { ...toMeta(f), body: html, toc };
}
