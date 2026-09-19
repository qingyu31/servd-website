<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import { base } from '$app/paths';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	// Keep <html lang> in sync during client-side (SPA) language switches; the
	// prerendered value is baked server-side by hooks.server.ts.
	$effect(() => {
		document.documentElement.lang = data.lang;
	});
</script>

<svelte:head>
	<link rel="alternate" type="application/rss+xml" title="servd blog" href="{base}/rss.xml" />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<Header lang={data.lang} />
	<main class="flex-1">{@render children()}</main>
	<Footer lang={data.lang} />
</div>
