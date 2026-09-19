<script lang="ts">
	import { t, localePath, type Lang } from '$lib/i18n';
	import type { DocMeta } from '$lib/content/types';

	interface Props {
		lang: Lang;
		groups: { group: string; items: DocMeta[] }[];
		currentSlug?: string;
	}
	let { lang, groups, currentSlug }: Props = $props();
</script>

<nav aria-label={t(lang, 'docs.title')} class="space-y-6">
	{#each groups as group}
		<div>
			<h2 class="text-xs font-semibold uppercase tracking-wider text-muted">
				{t(lang, `docs.group.${group.group}`)}
			</h2>
			<ul class="mt-2 space-y-0.5">
				{#each group.items as item}
					<li>
						<a
							href={localePath(lang, `/docs/${item.slug}/`)}
							aria-current={item.slug === currentSlug ? 'page' : undefined}
							class="block rounded-md px-2.5 py-1.5 text-sm transition-colors {item.slug ===
							currentSlug
								? 'bg-accent/10 font-medium text-accent'
								: 'text-muted hover:bg-panel hover:text-fg'}">{item.title}</a
						>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</nav>
