import type { Lang } from '$lib/i18n/locales';

/** Format an ISO date (yyyy-mm-dd) for the given locale, in UTC to stay stable. */
export function fmtDate(iso: string, lang: Lang): string {
	const normalized = iso.length === 10 ? `${iso}T00:00:00Z` : iso;
	const date = new Date(normalized);
	if (Number.isNaN(date.getTime())) return iso;
	return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		timeZone: 'UTC'
	}).format(date);
}
