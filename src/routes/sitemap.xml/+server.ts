import { SITE_URL } from '$lib/site';
import { base } from '$app/paths';
import { locales } from '$lib/i18n/locales';
import { listDocs } from '$lib/content/docs';
import { listPosts } from '$lib/content/blog';
import { listUseCases } from '$lib/content/usecases';

export const prerender = true;

const escapeXml = (s: string) =>
	s.replace(/[&<>"']/g, (c) =>
		({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c] as string
	);

export function GET() {
	const urls: string[] = [];
	const push = (p: string) => urls.push(`${SITE_URL}${base}${p}`);
	for (const lang of locales) {
		push(`/${lang}/`);
		push(`/${lang}/docs/`);
		push(`/${lang}/use-cases/`);
		push(`/${lang}/blog/`);
		for (const d of listDocs(lang)) push(`/${lang}/docs/${d.slug}/`);
		for (const u of listUseCases(lang)) push(`/${lang}/use-cases/${u.slug}/`);
		for (const p of listPosts(lang)) push(`/${lang}/blog/${p.slug}/`);
	}
	const body =
		'<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
		urls.map((u) => `  <url><loc>${escapeXml(u)}</loc></url>`).join('\n') +
		'\n</urlset>\n';
	return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
