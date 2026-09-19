import type { LayoutServerLoad } from './$types';
import { docGroups } from '$lib/content/docs';
import type { Lang } from '$lib/i18n/locales';

// Server-only: keeps the markdown/frontmatter toolchain out of the client bundle.
export const load: LayoutServerLoad = ({ params }) => ({
	groups: docGroups(params.lang as Lang)
});
