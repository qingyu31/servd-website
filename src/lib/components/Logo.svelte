<script lang="ts">
	interface Props {
		withText?: boolean;
	}
	let { withText = true }: Props = $props();
</script>

<span class="inline-flex items-center gap-2 font-semibold">
	<svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
		<rect
			x="2"
			y="3.5"
			width="20"
			height="17"
			rx="4"
			class="text-accent"
			stroke="currentColor"
			stroke-width="1.6"
		/>
		<path
			d="M6.6 9.2l2.6 2.6-2.6 2.6"
			class="text-accent"
			stroke="currentColor"
			stroke-width="1.9"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<circle cx="14.6" cy="14.4" r="1.25" class="text-accent" fill="currentColor" />
	</svg>
	{#if withText}
		<span class="text-lg tracking-tight text-fg">servd</span>
	{/if}
</span>
