<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		type?: 'note' | 'tip' | 'warn';
		title?: string;
		children: Snippet;
	}
	let { type = 'note', title, children }: Props = $props();

	const tone: Record<string, string> = {
		note: 'border-accent-2/40 bg-accent-2/5',
		tip: 'border-accent/40 bg-accent/5',
		warn: 'border-[#d29922]/50 bg-[#d29922]/5'
	};
</script>

<div class="my-5 rounded-lg border px-4 py-3 text-sm {tone[type]}">
	{#if title}
		<p class="mb-1 font-semibold text-fg">{title}</p>
	{/if}
	<div class="text-muted [&_a]:text-accent-2 [&_a]:underline">
		{@render children()}
	</div>
</div>
