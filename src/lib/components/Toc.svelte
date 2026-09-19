<script lang="ts">
	import { t, type Lang } from '$lib/i18n';
	import type { TocItem } from '$lib/content/types';

	interface Props {
		items: TocItem[];
		lang: Lang;
	}
	let { items, lang }: Props = $props();
</script>

{#if items.length}
	<nav aria-label={t(lang, 'common.toc')} class="text-sm">
		<h2 class="text-xs font-semibold uppercase tracking-wider text-muted">
			{t(lang, 'common.toc')}
		</h2>
		<ul class="mt-3 space-y-1.5 border-l border-border">
			{#each items as item}
				<li>
					<a
						href="#{item.id}"
						class="-ml-px block border-l-2 border-transparent pl-3 text-muted transition-colors hover:border-accent hover:text-accent {item.level ===
						3
							? 'pl-6'
							: ''}">{item.text}</a
					>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
