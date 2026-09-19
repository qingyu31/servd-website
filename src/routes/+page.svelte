<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import Seo from '$lib/components/Seo.svelte';
	import Logo from '$lib/components/Logo.svelte';

	// Default to English; only an explicitly saved preference overrides it.
	// The meta refresh below covers no-JS and gives crawlers a deterministic
	// default (English).
	onMount(() => {
		let target = 'en';
		try {
			const saved = localStorage.getItem('servd-lang');
			if (saved === 'zh' || saved === 'en') target = saved;
			localStorage.setItem('servd-lang', target);
		} catch {
			/* storage may be unavailable */
		}
		location.replace(`${base}/${target}/`);
	});
</script>

<Seo
	title="servd — a single-binary static, SPA, proxy & WebSocket server"
	description="servd is a self-contained development, testing and lightweight hosting server: static files, SPA fallback, HTTP and WebSocket proxies, CORS, TLS and a self-supervising daemon."
	lang="en"
	relPath="/"
	noindex={true}
/>

<svelte:head>
	<meta http-equiv="refresh" content="0;url={base}/en/" />
</svelte:head>

<div class="grid min-h-screen place-items-center px-6">
	<div class="text-center">
		<div class="flex justify-center"><Logo /></div>
		<p class="mt-4 text-sm text-muted">Choose your language / 选择语言</p>
		<div class="mt-3 flex items-center justify-center gap-4 text-sm font-medium">
			<a href="{base}/en/" class="text-accent hover:underline">English</a>
			<span class="text-muted" aria-hidden="true">·</span>
			<a href="{base}/zh/" class="text-accent hover:underline">简体中文</a>
		</div>
	</div>
</div>
