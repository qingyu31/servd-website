<script lang="ts">
	import Icon from './Icon.svelte';
	import { t, type Lang } from '$lib/i18n';

	interface Props {
		text: string;
		lang: Lang;
		label?: boolean;
		class?: string;
	}
	let { text, lang, label = true, class: className = '' }: Props = $props();

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			/* clipboard may be unavailable; the text is still selectable */
		}
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 1500);
	}
</script>

<button
	type="button"
	onclick={copy}
	class="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted transition-colors hover:text-fg {className}"
	aria-label={t(lang, 'common.copy')}
>
	<Icon name={copied ? 'check' : 'copy'} size={14} />
	{#if label}
		<span>{copied ? t(lang, 'common.copied') : t(lang, 'common.copy')}</span>
	{/if}
</button>
