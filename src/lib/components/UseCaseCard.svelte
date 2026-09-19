<script lang="ts">
	import Icon from './Icon.svelte';
	import { t, localePath, type Lang } from '$lib/i18n';
	import type { UseCaseMeta } from '$lib/content/types';

	interface Props {
		lang: Lang;
		item: UseCaseMeta;
	}
	let { lang, item }: Props = $props();
</script>

<a
	href={localePath(lang, `/use-cases/${item.slug}/`)}
	class="card flex h-full flex-col p-5 transition-colors hover:border-accent"
>
	<span class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
		<Icon name="grid" size={18} />
	</span>
	<h3 class="mt-3 text-base font-semibold text-fg">{item.title}</h3>
	<p class="mt-1.5 flex-1 text-sm text-muted">{item.summary}</p>
	{#if item.tags.length}
		<div class="mt-4 flex flex-wrap gap-1.5">
			{#each item.tags as tag}
				<span class="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted"
					>{tag}</span
				>
			{/each}
		</div>
	{/if}
	<span class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
		{t(lang, 'common.readMore')} <Icon name="arrow-right" size={14} />
	</span>
</a>
