export const locales = ['en', 'zh'] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = 'en';

export const langNames: Record<Lang, string> = {
	en: 'English',
	zh: '简体中文'
};

export const langShort: Record<Lang, string> = {
	en: 'EN',
	zh: 'ZH'
};

export function isLang(value: string): value is Lang {
	return (locales as readonly string[]).includes(value);
}
