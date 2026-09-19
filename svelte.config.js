import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true
		}),
		// BASE_PATH lets a GitHub Pages project site live under /<repo>/.
		// relative:false keeps `base` absolute at render time, so canonical,
		// hreflang, OG, JSON-LD and sitemap URLs are fully-qualified (the
		// default relative mode rewrites base to "../.." per page depth and
		// would corrupt every absolute URL).
		paths: { base: process.env.BASE_PATH ?? '', relative: false },
		prerender: {
			// Crawl every linked page from /; endpoints are listed explicitly.
			entries: ['/', '/sitemap.xml', '/robots.txt', '/rss.xml'],
			handleHttpError: 'warn',
			handleMissingId: 'warn'
		}
	}
};

export default config;
