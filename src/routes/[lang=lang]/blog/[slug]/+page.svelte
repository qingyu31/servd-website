<script lang="ts">
	import type { PageData } from './$types';
	import Seo from '$lib/components/Seo.svelte';
	import Toc from '$lib/components/Toc.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { t, localePath } from '$lib/i18n';
	import { fmtDate } from '$lib/format';
	import { articleLd, breadcrumbLd } from '$lib/seo';

	let { data }: { data: PageData } = $props();

	// $derived so client-side navigation to another post re-renders fresh.
	const lang = $derived(data.lang);
	const post = $derived(data.post);
	const relPath = $derived(`/blog/${post.slug}/`);
	const trail = $derived([
		{ name: t(lang, 'blog.title'), href: localePath(lang, '/blog/') },
		{ name: post.title }
	]);
	const jsonLd = $derived([
		articleLd({
			lang,
			type: 'BlogPosting',
			title: post.title,
			description: post.description,
			relPath,
			datePublished: post.date,
			dateModified: post.date
		}),
		breadcrumbLd(lang, [
			{ name: t(lang, 'blog.title'), relPath: '/blog/' },
			{ name: post.title, relPath }
		])
	]);
</script>

<Seo
	title={`${post.title} · servd`}
	description={post.description}
	{lang}
	{relPath}
	type="article"
	{jsonLd}
/>

<div class="container-site grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_15rem] lg:py-16">
	<article class="min-w-0">
		<Breadcrumb {trail} />
		<h1 class="text-3xl font-bold tracking-tight text-fg sm:text-4xl">{post.title}</h1>
		<div class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
			<time datetime={post.date}>{fmtDate(post.date, lang)}</time>
			<span aria-hidden="true">·</span>
			<span>{t(lang, 'blog.readingTime', { n: post.readingTime })}</span>
			<span aria-hidden="true">·</span>
			<span>{post.author}</span>
		</div>
		{#if post.tags.length}
			<div class="mt-4 flex flex-wrap gap-1.5">
				{#each post.tags as tag}
					<span class="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted"
						>{tag}</span
					>
				{/each}
			</div>
		{/if}
		<div class="prose mt-8 max-w-none">{@html post.body}</div>
		<a
			href={localePath(lang, '/blog/')}
			class="mt-10 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
		>
			<Icon name="arrow-left" size={14} /> {t(lang, 'blog.title')}
		</a>
	</article>
	<aside class="hidden lg:block">
		<div class="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
			<Toc items={post.toc} {lang} />
		</div>
	</aside>
</div>
