<script lang="ts">
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import Sidebar from '$lib/components/Sidebar.svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	const currentSlug = $derived.by(() => {
		const parts = page.url.pathname.split('/').filter(Boolean);
		const i = parts.indexOf('docs');
		return i >= 0 ? parts[i + 1] : undefined;
	});
</script>

<div class="container-site grid gap-10 py-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:py-14">
	<aside class="hidden lg:block">
		<div class="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
			<Sidebar lang={data.lang} groups={data.groups} {currentSlug} />
		</div>
	</aside>
	<div class="min-w-0">{@render children()}</div>
</div>
