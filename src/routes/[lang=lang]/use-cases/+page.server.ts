import type { PageServerLoad } from './$types';
import { listUseCases } from '$lib/content/usecases';
import type { Lang } from '$lib/i18n/locales';

// Server-only: keeps the markdown/frontmatter toolchain out of the client bundle.
export const load: PageServerLoad = ({ params }) => ({
	items: listUseCases(params.lang as Lang)
});
