import type { ParamMatcher } from '@sveltejs/kit';

// Restricts [lang] to the two supported locales so unknown prefixes 404.
export const match: ParamMatcher = (param) => param === 'en' || param === 'zh';
