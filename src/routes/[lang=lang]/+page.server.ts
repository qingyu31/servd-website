import type { PageServerLoad } from './$types';
import { home } from '$lib/content/home';
import { latestPosts } from '$lib/content/blog';
import { listUseCases } from '$lib/content/usecases';
import type { Lang } from '$lib/i18n/locales';

// Server-only: the content loaders pull in gray-matter/shiki (Node APIs such as
// Buffer) which must never reach the client bundle. Prerendering serializes the
// returned data, so the client only ever sees plain JSON.

// The landing highlights three representative scenarios, in a fixed order.
const FEATURED_USE_CASES = ['local-dev', 'spa-with-api', 'lightweight-hosting'];

export const load: PageServerLoad = ({ params }) => {
	const lang = params.lang as Lang;
	const all = listUseCases(lang);
	return {
		home: home[lang],
		posts: latestPosts(lang, 3),
		useCases: FEATURED_USE_CASES.flatMap((slug) => {
			const found = all.find((u) => u.slug === slug);
			return found ? [found] : [];
		})
	};
};
