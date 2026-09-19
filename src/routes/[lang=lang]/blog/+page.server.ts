import type { PageServerLoad } from './$types';
import { listPosts } from '$lib/content/blog';
import type { Lang } from '$lib/i18n/locales';

// Server-only: keeps the markdown/frontmatter toolchain out of the client bundle.
export const load: PageServerLoad = ({ params }) => ({
	posts: listPosts(params.lang as Lang)
});
