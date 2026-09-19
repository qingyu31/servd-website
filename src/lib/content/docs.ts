import { allFiles, renderMarkdown, type ParsedFile } from './markdown';
import type { Doc, DocMeta } from './types';

const GROUP_RANK: Record<string, number> = { start: 0, guides: 1, reference: 2 };
export const GROUPS = ['start', 'guides', 'reference'] as const;

const docsFiles = allFiles.filter((f) => f.kind === 'docs');

function toMeta(f: ParsedFile): DocMeta {
	return {
		slug: f.slug,
		lang: f.lang,
		title: String(f.data.title ?? f.slug),
		description: String(f.data.description ?? ''),
		group: String(f.data.group ?? 'guides'),
		order: Number(f.data.order ?? 100)
	};
}

export function listDocs(lang: string): DocMeta[] {
	return docsFiles
		.filter((f) => f.lang === lang)
		.map(toMeta)
		.sort(
			(a, b) =>
				(GROUP_RANK[a.group] ?? 9) - (GROUP_RANK[b.group] ?? 9) ||
				a.order - b.order ||
				a.title.localeCompare(b.title)
		);
}

export function docGroups(lang: string): { group: string; items: DocMeta[] }[] {
	const groups: { group: string; items: DocMeta[] }[] = [];
	for (const item of listDocs(lang)) {
		let group = groups.find((g) => g.group === item.group);
		if (!group) {
			group = { group: item.group, items: [] };
			groups.push(group);
		}
		group.items.push(item);
	}
	return groups;
}

export function allDocSlugs(): string[] {
	return [...new Set(docsFiles.map((f) => f.slug))];
}

export async function getDoc(lang: string, slug: string): Promise<Doc | null> {
	const f = docsFiles.find((x) => x.lang === lang && x.slug === slug);
	if (!f) return null;
	const { html, toc } = await renderMarkdown(f.content, lang);
	return { ...toMeta(f), body: html, toc };
}

export function prevNext(lang: string, slug: string): { prev: DocMeta | null; next: DocMeta | null } {
	const items = listDocs(lang);
	const i = items.findIndex((x) => x.slug === slug);
	if (i < 0) return { prev: null, next: null };
	return { prev: i > 0 ? items[i - 1] : null, next: i < items.length - 1 ? items[i + 1] : null };
}
