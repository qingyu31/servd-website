<script lang="ts">
	import { t, localePath, type Lang } from '$lib/i18n';
	import { fmtDate } from '$lib/format';
	import type { PostMeta } from '$lib/content/types';

	interface Props {
		lang: Lang;
		post: PostMeta;
	}
	let { lang, post }: Props = $props();
</script>

<a
	href={localePath(lang, `/blog/${post.slug}/`)}
	class="card flex h-full flex-col p-5 transition-colors hover:border-accent"
>
	<div class="flex flex-wrap items-center gap-2 text-xs text-muted">
		<time datetime={post.date}>{fmtDate(post.date, lang)}</time>
		<span aria-hidden="true">·</span>
		<span>{t(lang, 'blog.readingTime', { n: post.readingTime })}</span>
	</div>
	<h3 class="mt-2 text-lg font-semibold text-fg">{post.title}</h3>
	<p class="mt-1.5 flex-1 text-sm text-muted">{post.description}</p>
	{#if post.tags.length}
		<div class="mt-4 flex flex-wrap gap-1.5">
			{#each post.tags as tag}
				<span class="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted"
					>{tag}</span
				>
			{/each}
		</div>
	{/if}
</a>
