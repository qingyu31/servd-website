import type { Handle } from '@sveltejs/kit';

// Bake the correct <html lang> into each prerendered page based on the URL's
// locale segment. adapter-static runs this at build time, so the attribute is
// present in the static HTML (important for SEO and screen readers).
export const handle: Handle = async ({ event, resolve }) => {
	const lang = /(^|\/)zh(\/|$)/.test(event.url.pathname) ? 'zh' : 'en';
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('<html lang="en">', `<html lang="${lang}">`)
	});
};
