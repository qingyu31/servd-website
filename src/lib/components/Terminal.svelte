<script lang="ts">
	import CopyButton from './CopyButton.svelte';
	import type { TermLine } from '$lib/content/home';
	import type { Lang } from '$lib/i18n';

	interface Props {
		lines: TermLine[];
		lang: Lang;
		title?: string;
	}
	let { lines, lang, title = 'servd' }: Props = $props();

	const command = $derived(lines.find((l) => l.type === 'cmd')?.text ?? '');
	const color: Record<TermLine['type'], string> = {
		cmd: 'text-fg',
		ok: 'text-accent',
		muted: 'text-muted',
		out: 'text-fg/85'
	};
</script>

<div class="card overflow-hidden shadow-xl shadow-black/5">
	<div class="flex items-center gap-2 border-b border-border px-4 py-2.5">
		<span class="h-3 w-3 rounded-full bg-[#ff5f56]"></span>
		<span class="h-3 w-3 rounded-full bg-[#ffbd2e]"></span>
		<span class="h-3 w-3 rounded-full bg-[#27c93f]"></span>
		<span class="ml-2 font-mono text-xs text-muted">{title}</span>
		<span class="ml-auto"><CopyButton text={command} {lang} label={false} /></span>
	</div>
	<pre class="overflow-x-auto bg-code-bg px-4 py-4"><code
			class="font-mono text-[13px] leading-relaxed">{#each lines as line}<span
				class="block {color[line.type]}">{line.type === 'cmd' ? '$ ' : ''}{line.text}</span>{/each}<span
				class="cursor block text-accent">▋</span></code></pre>
</div>

<style>
	.cursor {
		animation: blink 1.1s steps(1) infinite;
	}
	@keyframes blink {
		50% {
			opacity: 0;
		}
	}
</style>
