<script lang="ts">
	import { page } from '$app/state';
	import Logo from './Logo.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import LangSwitcher from './LangSwitcher.svelte';
	import Icon from './Icon.svelte';
	import { t, localePath, relPathOf, type Lang } from '$lib/i18n';
	import { GITHUB_URL, SITE_NAME } from '$lib/site';

	interface Props {
		lang: Lang;
	}
	let { lang }: Props = $props();

	let open = $state(false);
	const path = $derived(page.url.pathname);
	const relPath = $derived(relPathOf(path));
	const nav = $derived([
		{ href: localePath(lang, '/'), label: t(lang, 'nav.home'), match: '/' },
		{ href: localePath(lang, '/docs/'), label: t(lang, 'nav.docs'), match: '/docs' },
		{ href: localePath(lang, '/use-cases/'), label: t(lang, 'nav.useCases'), match: '/use-cases' },
		{ href: localePath(lang, '/blog/'), label: t(lang, 'nav.blog'), match: '/blog' }
	]);
	// The home entry must match exactly, otherwise "/" would highlight everywhere.
	const isActive = (match: string) => (match === '/' ? relPath === '/' : relPath.startsWith(match));

	// Collapse the mobile menu whenever the route changes.
	$effect(() => {
		path;
		open = false;
	});
</script>

<header
	class="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur supports-[backdrop-filter]:bg-bg/70"
>
	<div class="container-site flex h-16 items-center justify-between gap-4">
		<a href={localePath(lang, '/')} class="flex items-center" aria-label={SITE_NAME}>
			<Logo />
		</a>

		<nav class="hidden items-center gap-2 md:flex" aria-label="Main">
			{#each nav as item}
				<a
					href={item.href}
					class="rounded-md px-3 py-2 text-sm transition-colors {isActive(item.match)
						? 'font-medium text-accent'
						: 'text-muted hover:text-fg'}">{item.label}</a
				>
			{/each}
		</nav>

		<div class="flex items-center gap-2">
			<LangSwitcher {lang} {relPath} />
			<ThemeToggle {lang} />
			<a
				href={GITHUB_URL}
				target="_blank"
				rel="noopener noreferrer"
				class="hidden h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:text-fg sm:inline-flex"
				aria-label={t(lang, 'nav.github')}
			>
				<Icon name="github" size={18} />
			</a>
			<button
				type="button"
				class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted md:hidden"
				onclick={() => (open = !open)}
				aria-label={t(lang, 'common.menu')}
				aria-expanded={open}
			>
				<Icon name={open ? 'close' : 'menu'} size={18} />
			</button>
		</div>
	</div>

	{#if open}
		<nav class="border-t border-border md:hidden" aria-label="Mobile">
			<div class="container-site flex flex-col py-2">
				{#each nav as item}
					<a href={item.href} class="rounded-md px-3 py-2 text-sm text-muted hover:text-fg"
						>{item.label}</a
					>
				{/each}
				<a
					href={GITHUB_URL}
					target="_blank"
					rel="noopener noreferrer"
					class="rounded-md px-3 py-2 text-sm text-muted hover:text-fg"
					>{t(lang, 'nav.github')}</a
				>
			</div>
		</nav>
	{/if}
</header>
