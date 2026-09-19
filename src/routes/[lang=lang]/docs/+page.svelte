<script lang="ts">
	import type { PageData } from './$types';
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { t, localePath } from '$lib/i18n';

	let { data }: { data: PageData } = $props();
	const lang = $derived(data.lang);
</script>

<Seo
	title={t(lang, 'docs.indexTitle')}
	description={t(lang, 'docs.indexSubtitle')}
	{lang}
	relPath="/docs/"
/>

<h1 class="text-3xl font-bold tracking-tight text-fg">{t(lang, 'docs.indexTitle')}</h1>
<p class="mt-3 max-w-2xl text-lg text-muted">{t(lang, 'docs.indexSubtitle')}</p>

<div class="mt-10 grid gap-10 sm:grid-cols-2">
	{#each data.groups as group}
		<div>
			<h2 class="text-sm font-semibold uppercase tracking-wider text-accent">
				{t(lang, `docs.group.${group.group}`)}
			</h2>
			<ul class="mt-4 space-y-3">
				{#each group.items as item}
					<li>
						<a
							href={localePath(lang, `/docs/${item.slug}/`)}
							class="card group flex flex-col gap-1 p-4 transition-colors hover:border-accent"
						>
							<span class="inline-flex items-center gap-1.5 font-medium text-fg">
								{item.title}
								<Icon
									name="arrow-right"
									size={14}
									class="text-muted transition-transform group-hover:translate-x-0.5"
								/>
							</span>
							{#if item.description}
								<span class="text-sm text-muted">{item.description}</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</div>
