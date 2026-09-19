<script lang="ts">
	import type { ComparisonRow } from '$lib/content/home';
	import type { Lang } from '$lib/i18n';

	interface Props {
		rows: ComparisonRow[];
		lang: Lang;
	}
	let { rows, lang }: Props = $props();

	const head = $derived(lang === 'zh' ? { cap: '能力' } : { cap: 'Capability' });
</script>

<div class="card overflow-x-auto">
	<table class="w-full min-w-[640px] border-collapse text-sm">
		<thead>
			<tr class="border-b border-border bg-panel text-left">
				<th class="px-4 py-3 font-semibold text-fg">{head.cap}</th>
				<th class="px-4 py-3 font-medium text-muted">http-server</th>
				<th class="px-4 py-3 font-medium text-muted">nginx</th>
				<th class="px-4 py-3 font-semibold text-accent">servd</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row}
				<tr class="border-b border-border last:border-0">
					<td class="px-4 py-2.5 font-medium text-fg">{row.capability}</td>
					<td class="px-4 py-2.5 text-muted">{row.http}</td>
					<td class="px-4 py-2.5 text-muted">{row.nginx}</td>
					<td class="px-4 py-2.5 {row.servdWin ? 'font-medium text-accent' : 'text-fg'}">
						{row.servd}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
