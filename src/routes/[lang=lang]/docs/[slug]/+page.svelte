<script lang="ts">
	import type { PageData } from './$types';
	import Seo from '$lib/components/Seo.svelte';
	import Toc from '$lib/components/Toc.svelte';
	import PrevNext from '$lib/components/PrevNext.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import { t, localePath } from '$lib/i18n';
	import { articleLd, breadcrumbLd } from '$lib/seo';

	let { data }: { data: PageData } = $props();

	// $derived (not plain consts) so client-side navigation to another slug
	// re-renders with the new data instead of showing a stale page.
	const lang = $derived(data.lang);
	const doc = $derived(data.doc);
	const relPath = $derived(`/docs/${doc.slug}/`);
	const trail = $derived([
		{ name: t(lang, 'nav.docs'), href: localePath(lang, '/docs/') },
		{ name: doc.title }
	]);
	const jsonLd = $derived([
		articleLd({
			lang,
			type: 'TechArticle',
			title: doc.title,
			description: doc.description,
			relPath
		}),
		breadcrumbLd(lang, [
			{ name: t(lang, 'nav.docs'), relPath: '/docs/' },
			{ name: doc.title, relPath }
		])
	]);
</script>

<Seo
	title={`${doc.title} · servd`}
	description={doc.description}
	{lang}
	{relPath}
	type="article"
	{jsonLd}
/>

<div class="grid gap-10 xl:grid-cols-[minmax(0,1fr)_15rem]">
	<article class="min-w-0">
		<Breadcrumb {trail} />
		<h1 class="text-3xl font-bold tracking-tight text-fg">{doc.title}</h1>
		{#if doc.description}
			<p class="mt-3 text-lg text-muted">{doc.description}</p>
		{/if}
		<div class="prose mt-8 max-w-none">{@html doc.body}</div>
		<PrevNext {lang} prev={data.pager.prev} next={data.pager.next} />
	</article>
	<aside class="hidden xl:block">
		<div class="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
			<Toc items={doc.toc} {lang} />
		</div>
	</aside>
</div>
