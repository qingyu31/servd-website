<script lang="ts">
	import type { PageData } from './$types';
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Terminal from '$lib/components/Terminal.svelte';
	import InstallTabs from '$lib/components/InstallTabs.svelte';
	import FeatureCard from '$lib/components/FeatureCard.svelte';
	import ComparisonTable from '$lib/components/ComparisonTable.svelte';
	import BlogCard from '$lib/components/BlogCard.svelte';
	import UseCaseCard from '$lib/components/UseCaseCard.svelte';
	import { t, localePath } from '$lib/i18n';
	import { websiteLd } from '$lib/seo';

	let { data }: { data: PageData } = $props();

	const lang = $derived(data.lang);
	const title = $derived(
		lang === 'zh'
			? 'servd — 单个二进制的静态 / SPA / 代理服务器'
			: 'servd — a single-binary static, SPA & proxy server'
	);
</script>

<Seo
	{title}
	description={data.home.subtitle}
	{lang}
	relPath="/"
	jsonLd={[websiteLd(lang)]}
/>

<!-- Hero -->
<section class="border-b border-border bg-panel/40">
	<div class="container-site grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
		<div>
			<span
				class="inline-flex items-center gap-2 rounded-full border border-border bg-bg px-3 py-1 font-mono text-xs text-accent"
			>
				<Icon name="bolt" size={13} /> {data.home.badge}
			</span>
			<h1 class="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-fg sm:text-5xl">
				{data.home.titleTop}
				<span class="text-accent">{data.home.titleAccent}</span>
			</h1>
			<p class="mt-5 max-w-xl text-lg text-muted">{data.home.subtitle}</p>
			<div class="mt-8 flex flex-wrap items-center gap-3">
				<a
					href={localePath(lang, '/docs/quick-start/')}
					class="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
				>
					{data.home.primaryCta} <Icon name="arrow-right" size={16} />
				</a>
				<a
					href={localePath(lang, '/use-cases/')}
					class="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-fg transition-colors hover:border-accent hover:text-accent"
				>
					{data.home.secondaryCta}
				</a>
			</div>
			<div class="mt-8 max-w-md">
				<p class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
					{t(lang, 'home.installTitle')}
				</p>
				<InstallTabs {lang} />
			</div>
		</div>
		<div>
			<Terminal lines={data.home.terminal} {lang} />
		</div>
	</div>
</section>

<!-- Features -->
<section class="container-site py-16">
	<h2 class="text-2xl font-bold tracking-tight text-fg sm:text-3xl">{t(lang, 'home.featuresTitle')}</h2>
	<div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
		{#each data.home.features as feature}
			<FeatureCard {feature} />
		{/each}
	</div>
</section>

<!-- Comparison -->
<section class="container-site py-8">
	<h2 class="text-2xl font-bold tracking-tight text-fg sm:text-3xl">
		{t(lang, 'home.comparisonTitle')}
	</h2>
	<div class="mt-8">
		<ComparisonTable rows={data.home.comparison} {lang} />
	</div>
</section>

<!-- Use cases -->
<section class="container-site py-16">
	<div class="flex items-end justify-between gap-4">
		<h2 class="text-2xl font-bold tracking-tight text-fg sm:text-3xl">
			{t(lang, 'home.useCasesTitle')}
		</h2>
		<a
			href={localePath(lang, '/use-cases/')}
			class="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
		>
			{t(lang, 'common.viewAll')} <Icon name="arrow-right" size={14} />
		</a>
	</div>
	<div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.useCases as item}
			<UseCaseCard {lang} {item} />
		{/each}
	</div>
</section>

<!-- Blog -->
<section class="container-site py-8 pb-20">
	<div class="flex items-end justify-between gap-4">
		<h2 class="text-2xl font-bold tracking-tight text-fg sm:text-3xl">{t(lang, 'home.blogTitle')}</h2>
		<a
			href={localePath(lang, '/blog/')}
			class="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
		>
			{t(lang, 'common.viewAll')} <Icon name="arrow-right" size={14} />
		</a>
	</div>
	<div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.posts as post}
			<BlogCard {lang} {post} />
		{/each}
	</div>
</section>
