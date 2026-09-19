import { base } from '$app/paths';
import type { Lang } from './locales';
import { defaultLang } from './locales';

export * from './locales';
export * from './ui';

/** Build an app path for a locale, e.g. localePath('zh', '/docs/cli/') -> /zh/docs/cli/. */
export function localePath(lang: Lang, relPath = '/'): string {
	const rel = relPath.startsWith('/') ? relPath : `/${relPath}`;
	return `${base}/${lang}${rel}`;
}

/** Strip the locale prefix from a pathname, returning the locale-relative path. */
export function relPathOf(pathname: string): string {
	const withoutBase = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
	const parts = withoutBase.split('/').filter(Boolean);
	if (parts.length && (parts[0] === 'en' || parts[0] === 'zh')) parts.shift();
	return '/' + parts.join('/') + (withoutBase.endsWith('/') || parts.length === 0 ? '' : '');
}

/** The "other" locale, for the language switcher. */
export function otherLang(lang: Lang): Lang {
	return lang === 'en' ? 'zh' : defaultLang;
}
