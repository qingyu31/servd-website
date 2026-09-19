<script lang="ts">
	import Icon from './Icon.svelte';
	import type { Feature } from '$lib/content/home';

	interface Props {
		feature: Feature;
	}
	let { feature }: Props = $props();
</script>

<div class="card p-5">
	<span class="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
		<Icon name={feature.icon} size={20} />
	</span>
	<h3 class="mt-4 text-base font-semibold text-fg">{feature.title}</h3>
	<p class="mt-1.5 text-sm text-muted">{feature.body}</p>
</div>
