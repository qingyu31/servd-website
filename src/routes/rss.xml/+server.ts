import { SITE_URL, SITE_NAME, SITE_TAGLINE } from '$lib/site';
import { base } from '$app/paths';
import { locales } from '$lib/i18n/locales';
import { listPosts } from '$lib/content/blog';

export const prerender = true;

const esc = (s: string) =>
	s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

export function GET() {
	const items = locales
		.flatMap((lang) =>
			listPosts(lang).map((p) => ({ ...p, lang, url: `${SITE_URL}${base}/${lang}/blog/${p.slug}/` }))
		)
		.sort((a, b) => b.date.localeCompare(a.date));

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_NAME)}</title>
    <link>${SITE_URL}${base}/en/</link>
    <description>${esc(SITE_TAGLINE.en)}</description>
    <language>en</language>
    <atom:link href="${SITE_URL}${base}/rss.xml" rel="self" type="application/rss+xml"/>
${items
	.map(
		(i) => `    <item>
      <title>${esc(i.title)}</title>
      <link>${i.url}</link>
      <guid isPermaLink="true">${i.url}</guid>
      <pubDate>${new Date(`${i.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${esc(i.description)}</description>
    </item>`
	)
	.join('\n')}
  </channel>
</rss>
`;
	return new Response(body, { headers: { 'content-type': 'application/rss+xml; charset=utf-8' } });
}
