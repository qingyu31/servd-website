<script lang="ts">
	import type { PageData } from './$types';
	import Seo from '$lib/components/Seo.svelte';
	import BlogCard from '$lib/components/BlogCard.svelte';
	import { t } from '$lib/i18n';

	let { data }: { data: PageData } = $props();
	const lang = $derived(data.lang);
</script>

<Seo
	title={`${t(lang, 'blog.title')} · servd`}
	description={t(lang, 'blog.subtitle')}
	{lang}
	relPath="/blog/"
/>

<div class="container-site py-12 lg:py-16">
	<h1 class="text-3xl font-bold tracking-tight text-fg sm:text-4xl">{t(lang, 'blog.title')}</h1>
	<p class="mt-3 max-w-2xl text-lg text-muted">{t(lang, 'blog.subtitle')}</p>

	{#if data.posts.length}
		<div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.posts as post}
				<BlogCard {lang} {post} />
			{/each}
		</div>
	{:else}
		<p class="mt-10 text-muted">{t(lang, 'blog.empty')}</p>
	{/if}
</div>
