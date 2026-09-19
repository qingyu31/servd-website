<script lang="ts">
	import type { PageData } from './$types';
	import Seo from '$lib/components/Seo.svelte';
	import Toc from '$lib/components/Toc.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import { t, localePath } from '$lib/i18n';
	import { articleLd, breadcrumbLd } from '$lib/seo';

	let { data }: { data: PageData } = $props();

	// $derived so client-side navigation to another case re-renders fresh.
	const lang = $derived(data.lang);
	const item = $derived(data.item);
	const relPath = $derived(`/use-cases/${item.slug}/`);
	const trail = $derived([
		{ name: t(lang, 'usecases.title'), href: localePath(lang, '/use-cases/') },
		{ name: item.title }
	]);
	const jsonLd = $derived([
		articleLd({
			lang,
			type: 'Article',
			title: item.title,
			description: item.description,
			relPath
		}),
		breadcrumbLd(lang, [
			{ name: t(lang, 'usecases.title'), relPath: '/use-cases/' },
			{ name: item.title, relPath }
		])
	]);
</script>

<Seo
	title={`${item.title} · servd`}
	description={item.description}
	{lang}
	{relPath}
	type="article"
	{jsonLd}
/>

<div class="container-site grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_15rem] lg:py-16">
	<article class="min-w-0">
		<Breadcrumb {trail} />
		<h1 class="text-3xl font-bold tracking-tight text-fg sm:text-4xl">{item.title}</h1>
		{#if item.tags.length}
			<div class="mt-4 flex flex-wrap gap-1.5">
				{#each item.tags as tag}
					<span class="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted"
						>{tag}</span
					>
				{/each}
			</div>
		{/if}
		<div class="prose mt-8 max-w-none">{@html item.body}</div>
	</article>
	<aside class="hidden lg:block">
		<div class="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
			<Toc items={item.toc} {lang} />
		</div>
	</aside>
</div>
