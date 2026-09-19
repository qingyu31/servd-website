<script lang="ts">
	import { SITE_NAME } from '$lib/site';
	import { absoluteUrl, alternates, jsonLdScript } from '$lib/seo';
	import type { Lang } from '$lib/i18n/locales';

	interface Props {
		title: string;
		description: string;
		lang: Lang;
		/** Locale-relative path, starting with "/", e.g. "/docs/cli/" or "/". */
		relPath: string;
		type?: 'website' | 'article';
		image?: string;
		noindex?: boolean;
		jsonLd?: unknown[];
	}

	let {
		title,
		description,
		lang,
		relPath,
		type = 'website',
		image = '/og.png',
		noindex = false,
		jsonLd = []
	}: Props = $props();

	const canonical = $derived(absoluteUrl(`/${lang}${relPath}`));
	const alts = $derived(alternates(relPath));
	const ogImage = $derived(absoluteUrl(image));
	const ld = $derived(jsonLd.map((item) => jsonLdScript(item)).join(''));
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta
		name="robots"
		content={noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large'}
	/>
	<link rel="canonical" href={canonical} />
	{#each alts as alt}
		<link rel="alternate" hreflang={alt.lang} href={alt.href} />
	{/each}

	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content={type} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:locale" content={lang === 'zh' ? 'zh_CN' : 'en_US'} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />

	{#if ld}
		{@html ld}
	{/if}
</svelte:head>
