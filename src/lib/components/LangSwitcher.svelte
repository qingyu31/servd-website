<script lang="ts">
	import { locales, langShort, localePath, type Lang } from '$lib/i18n';

	interface Props {
		lang: Lang;
		/** Locale-relative path (starts with "/"), preserved across the switch. */
		relPath: string;
	}
	let { lang, relPath }: Props = $props();
</script>

<div
	class="inline-flex items-center gap-0.5 rounded-lg border border-border p-0.5 text-xs font-semibold"
	role="group"
	aria-label="Language"
>
	{#each locales as l}
		<a
			href={localePath(l, relPath)}
			hreflang={l}
			lang={l}
			aria-current={l === lang ? 'true' : undefined}
			class="rounded-md px-2 py-1 transition-colors {l === lang
				? 'text-accent'
				: 'text-muted hover:text-fg'}"
			>{langShort[l]}</a
		>
	{/each}
</div>
