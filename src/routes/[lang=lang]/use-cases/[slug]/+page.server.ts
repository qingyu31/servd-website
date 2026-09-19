import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getUseCase } from '$lib/content/usecases';
import type { Lang } from '$lib/i18n/locales';

// Server-only: keeps the markdown/frontmatter toolchain out of the client bundle.
export const load: PageServerLoad = async ({ params }) => {
	const item = await getUseCase(params.lang as Lang, params.slug);
	if (!item) throw error(404, 'Use case not found');
	return { item };
};
