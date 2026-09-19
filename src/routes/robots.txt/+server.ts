import { SITE_URL } from '$lib/site';
import { base } from '$app/paths';

export const prerender = true;

export function GET() {
	const body = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}${base}/sitemap.xml\n`;
	return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
