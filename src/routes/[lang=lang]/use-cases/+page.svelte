<script lang="ts">
	import type { PageData } from './$types';
	import Seo from '$lib/components/Seo.svelte';
	import UseCaseCard from '$lib/components/UseCaseCard.svelte';
	import { t } from '$lib/i18n';

	let { data }: { data: PageData } = $props();
	const lang = $derived(data.lang);
</script>

<Seo
	title={`${t(lang, 'usecases.title')} · servd`}
	description={t(lang, 'usecases.subtitle')}
	{lang}
	relPath="/use-cases/"
/>

<div class="container-site py-12 lg:py-16">
	<h1 class="text-3xl font-bold tracking-tight text-fg sm:text-4xl">{t(lang, 'usecases.title')}</h1>
	<p class="mt-3 max-w-2xl text-lg text-muted">{t(lang, 'usecases.subtitle')}</p>

	<div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.items as item}
			<UseCaseCard {lang} {item} />
		{/each}
	</div>
</div>
