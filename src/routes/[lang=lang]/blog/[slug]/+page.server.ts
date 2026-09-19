import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getPost } from '$lib/content/blog';
import type { Lang } from '$lib/i18n/locales';

// Server-only: keeps the markdown/frontmatter toolchain out of the client bundle.
export const load: PageServerLoad = async ({ params }) => {
	const post = await getPost(params.lang as Lang, params.slug);
	if (!post) throw error(404, 'Post not found');
	return { post };
};
