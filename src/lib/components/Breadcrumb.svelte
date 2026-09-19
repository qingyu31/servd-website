<script lang="ts">
	import Icon from './Icon.svelte';

	interface Crumb {
		name: string;
		href?: string;
	}
	interface Props {
		trail: Crumb[];
	}
	let { trail }: Props = $props();
</script>

<nav aria-label="Breadcrumb" class="mb-6">
	<ol class="flex flex-wrap items-center gap-1.5 text-sm text-muted">
		{#each trail as crumb, i}
			<li class="inline-flex items-center gap-1.5">
				{#if crumb.href && i < trail.length - 1}
					<a href={crumb.href} class="hover:text-fg">{crumb.name}</a>
				{:else}
					<span class="text-fg">{crumb.name}</span>
				{/if}
				{#if i < trail.length - 1}
					<Icon name="chevron-right" size={13} />
				{/if}
			</li>
		{/each}
	</ol>
</nav>
