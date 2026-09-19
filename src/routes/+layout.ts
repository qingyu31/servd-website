// Every route is prerendered to static HTML for SEO and served without a
// runtime server. Directory-style URLs (trailing slash) map cleanly to
// index.html files on static hosts (and on servd --static).
export const prerender = true;
export const ssr = true;
export const trailingSlash = 'always';
