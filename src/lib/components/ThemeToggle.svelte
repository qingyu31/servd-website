<script lang="ts">
	import Icon from './Icon.svelte';
	import { t, type Lang } from '$lib/i18n';

	interface Props {
		lang: Lang;
	}
	let { lang }: Props = $props();

	let dark = $state(false);
	let mounted = $state(false);

	$effect(() => {
		dark = document.documentElement.classList.contains('dark');
		mounted = true;
	});

	function toggle() {
		dark = !dark;
		document.documentElement.classList.toggle('dark', dark);
		try {
			localStorage.setItem('servd-theme', dark ? 'dark' : 'light');
		} catch {
			/* ignore private-mode storage errors */
		}
	}
</script>

<button
	type="button"
	onclick={toggle}
	class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:text-fg"
	aria-label={t(lang, 'common.theme')}
	title={dark ? t(lang, 'common.light') : t(lang, 'common.dark')}
>
	{#if mounted && dark}
		<Icon name="sun" size={18} />
	{:else}
		<Icon name="moon" size={18} />
	{/if}
</button>
