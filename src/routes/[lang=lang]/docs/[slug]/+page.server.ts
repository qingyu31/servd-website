import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getDoc, prevNext } from '$lib/content/docs';
import type { Lang } from '$lib/i18n/locales';

// Server-only: keeps the markdown/frontmatter toolchain out of the client bundle.
export const load: PageServerLoad = async ({ params }) => {
	const lang = params.lang as Lang;
	const doc = await getDoc(lang, params.slug);
	if (!doc) throw error(404, 'Document not found');
	return { doc, pager: prevNext(lang, params.slug) };
};
