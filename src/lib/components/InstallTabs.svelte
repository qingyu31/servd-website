<script lang="ts">
	import { installCommands } from '$lib/content/home';
	import CopyButton from './CopyButton.svelte';
	import type { Lang } from '$lib/i18n';

	interface Props {
		lang: Lang;
	}
	let { lang }: Props = $props();

	let active = $state(installCommands[0].id);
	const current = $derived(installCommands.find((c) => c.id === active) ?? installCommands[0]);
</script>

<div class="card p-1.5">
	<div class="flex flex-wrap gap-1" role="tablist" aria-label="Install">
		{#each installCommands as c}
			<button
				type="button"
				role="tab"
				aria-selected={active === c.id}
				onclick={() => (active = c.id)}
				class="rounded-md px-3 py-1.5 font-mono text-xs transition-colors {active === c.id
					? 'bg-accent/15 text-accent'
					: 'text-muted hover:text-fg'}">{c.label}</button
			>
		{/each}
	</div>
	<div class="mt-1.5 flex items-center justify-between gap-3 rounded-md bg-code-bg px-3 py-2.5">
		<code class="overflow-x-auto font-mono text-sm text-fg">{current.command}</code>
		<CopyButton text={current.command} {lang} label={false} />
	</div>
</div>
