<script lang="ts">
	import Icon from './Icon.svelte';
	import { t, localePath, type Lang } from '$lib/i18n';
	import type { DocMeta } from '$lib/content/types';

	interface Props {
		lang: Lang;
		prev: DocMeta | null;
		next: DocMeta | null;
	}
	let { lang, prev, next }: Props = $props();
</script>

{#if prev || next}
	<div class="mt-12 grid gap-4 sm:grid-cols-2">
		{#if prev}
			<a
				href={localePath(lang, `/docs/${prev.slug}/`)}
				class="card flex flex-col gap-1 p-4 transition-colors hover:border-accent"
			>
				<span class="inline-flex items-center gap-1 text-xs text-muted">
					<Icon name="arrow-left" size={13} /> {t(lang, 'common.prev')}
				</span>
				<span class="font-medium text-fg">{prev.title}</span>
			</a>
		{:else}
			<span class="hidden sm:block"></span>
		{/if}
		{#if next}
			<a
				href={localePath(lang, `/docs/${next.slug}/`)}
				class="card flex flex-col gap-1 p-4 text-right transition-colors hover:border-accent sm:col-start-2"
			>
				<span class="inline-flex items-center justify-end gap-1 text-xs text-muted">
					{t(lang, 'common.next')} <Icon name="arrow-right" size={13} />
				</span>
				<span class="font-medium text-fg">{next.title}</span>
			</a>
		{/if}
	</div>
{/if}
