<script lang="ts">
	import Logo from './Logo.svelte';
	import Icon from './Icon.svelte';
	import { t, localePath, type Lang } from '$lib/i18n';
	import { GITHUB_URL, NPM_PACKAGE, SITE_TAGLINE } from '$lib/site';
	import { base } from '$app/paths';

	interface Props {
		lang: Lang;
	}
	let { lang }: Props = $props();

	const npmUrl = `https://www.npmjs.com/package/${NPM_PACKAGE}`;
	const year = new Date().getFullYear();

	const columns: { title: string; links: { href: string; label: string; external?: boolean }[] }[] =
		$derived([
		{
			title: t(lang, 'footer.product'),
			links: [
				{ href: localePath(lang, '/docs/'), label: t(lang, 'nav.docs') },
				{ href: localePath(lang, '/use-cases/'), label: t(lang, 'nav.useCases') },
				{ href: localePath(lang, '/blog/'), label: t(lang, 'nav.blog') }
			]
		},
		{
			title: t(lang, 'footer.resources'),
			links: [
				{ href: GITHUB_URL, label: t(lang, 'nav.github'), external: true },
				{ href: npmUrl, label: t(lang, 'footer.npm'), external: true },
				{ href: `${base}/rss.xml`, label: 'RSS' }
			]
		}
	]);
</script>

<footer class="mt-20 border-t border-border bg-panel">
	<div class="container-site grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
		<div>
			<Logo />
			<p class="mt-3 max-w-sm text-sm text-muted">{SITE_TAGLINE[lang]}</p>
		</div>
		{#each columns as col}
			<div>
				<h2 class="text-sm font-semibold text-fg">{col.title}</h2>
				<ul class="mt-3 space-y-2">
					{#each col.links as link}
						<li>
							<a
								href={link.href}
								target={link.external ? '_blank' : undefined}
								rel={link.external ? 'noopener noreferrer' : undefined}
								class="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-fg"
							>
								{link.label}
								{#if link.external}<Icon name="external" size={12} />{/if}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
	<div class="border-t border-border">
		<div class="container-site flex flex-col gap-1 py-6 text-xs text-muted sm:flex-row sm:justify-between">
			<span>© {year} servd. {t(lang, 'footer.rights')}</span>
			<span>{t(lang, 'footer.builtWith')}</span>
		</div>
	</div>
</footer>
