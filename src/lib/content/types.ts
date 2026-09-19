export type Kind = 'docs' | 'use-cases' | 'blog';

export interface TocItem {
	level: number;
	id: string;
	text: string;
}

export interface DocMeta {
	slug: string;
	lang: string;
	title: string;
	description: string;
	group: string; // 'start' | 'guides' | 'reference'
	order: number;
}

export interface Doc extends DocMeta {
	body: string;
	toc: TocItem[];
}

export interface UseCaseMeta {
	slug: string;
	lang: string;
	title: string;
	description: string;
	summary: string;
	order: number;
	tags: string[];
}

export interface UseCase extends UseCaseMeta {
	body: string;
	toc: TocItem[];
}

export interface PostMeta {
	slug: string;
	lang: string;
	title: string;
	description: string;
	date: string; // ISO yyyy-mm-dd
	tags: string[];
	readingTime: number; // minutes
	author: string;
	draft: boolean;
}

export interface Post extends PostMeta {
	body: string;
	toc: TocItem[];
}
