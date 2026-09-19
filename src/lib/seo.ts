import { base } from '$app/paths';
import { SITE_URL, SITE_NAME, GITHUB_URL } from './site';
import { locales, type Lang } from '$lib/i18n/locales';

/** Prefix an app-absolute path with the configured base (for project sites). */
export function withBase(path: string): string {
	const p = path.startsWith('/') ? path : `/${path}`;
	return `${base}${p}`;
}

/** Fully-qualified URL for an app-absolute path, including base. */
export function absoluteUrl(path: string): string {
	return `${SITE_URL}${withBase(path)}`;
}

/** hreflang alternates (plus x-default) for a locale-relative path. */
export function alternates(relPath: string): { lang: string; href: string }[] {
	const rel = relPath.startsWith('/') ? relPath : `/${relPath}`;
	const list: { lang: string; href: string }[] = locales.map((lang) => ({
		lang,
		href: absoluteUrl(`/${lang}${rel}`)
	}));
	list.push({ lang: 'x-default', href: absoluteUrl(`/en${rel}`) });
	return list;
}

/** Escape a JSON-LD object for safe embedding inside a <script> tag. */
export function jsonLdScript(data: unknown): string {
	const json = JSON.stringify(data).replace(/</g, '\\u003c');
	return `<script type="application/ld+json">${json}</script>`;
}

export function websiteLd(lang: Lang) {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: SITE_NAME,
		url: absoluteUrl(`/${lang}/`),
		inLanguage: lang === 'zh' ? 'zh-CN' : 'en',
		publisher: { '@type': 'Organization', name: SITE_NAME, url: GITHUB_URL }
	};
}

export function breadcrumbLd(lang: Lang, trail: { name: string; relPath: string }[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: trail.map((crumb, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: crumb.name,
			item: absoluteUrl(`/${lang}${crumb.relPath}`)
		}))
	};
}

export function articleLd(opts: {
	lang: Lang;
	type: 'TechArticle' | 'BlogPosting' | 'Article';
	title: string;
	description: string;
	relPath: string;
	datePublished?: string;
	dateModified?: string;
	image?: string;
}) {
	return {
		'@context': 'https://schema.org',
		'@type': opts.type,
		headline: opts.title,
		description: opts.description,
		inLanguage: opts.lang === 'zh' ? 'zh-CN' : 'en',
		url: absoluteUrl(`/${opts.lang}${opts.relPath}`),
		image: absoluteUrl(opts.image ?? '/og.png'),
		...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
		...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
		publisher: { '@type': 'Organization', name: SITE_NAME, url: GITHUB_URL }
	};
}
