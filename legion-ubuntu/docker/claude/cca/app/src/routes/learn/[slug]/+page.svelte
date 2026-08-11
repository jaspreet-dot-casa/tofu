<script lang="ts">
	import { enhance } from '$app/forms';
	import Toc from '$lib/components/Toc.svelte';
	import CourseChapterLink from '$lib/components/CourseChapterLink.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// The action re-runs `load`, so the server value is the only state there is.
	const complete = $derived(data.complete);
</script>

<svelte:head>
	<title>{data.lesson.title} — CCA Prep</title>
	<meta name="description" content={data.lesson.summary} />
</svelte:head>

<div class="reader shell" style={data.domain ? `--dc: var(--${data.domain.accent})` : ''}>
	<article class="reader__main">
		<nav class="crumbs" aria-label="Breadcrumb">
			<a href="/curriculum">Curriculum</a>
			<span aria-hidden="true">›</span>
			{#if data.domain}
				<a href="/domains/{data.domain.slug}">{data.domain.code} {data.domain.title}</a>
			{:else}
				<span>Start here</span>
			{/if}
		</nav>

		<header class="reader__head">
			<h1 class="page-title">{data.lesson.title}</h1>
			<p class="reader__meta">
				{#if data.domain}
					<span class="chip chip--{data.domain.accent}"
						>{data.domain.code} · {data.domain.weight}%</span
					>
				{:else}
					<span class="chip chip--neutral">orientation</span>
				{/if}
				<span class="mono">{data.lesson.minutes} min</span>
			</p>
			{#if data.lesson.summary}
				<p class="lede">{data.lesson.summary}</p>
			{/if}
		</header>

		{#if data.chapter}
			<div class="reader__video">
				<CourseChapterLink
					title={data.chapter.title}
					timestamp={data.chapter.timestamp}
					url={data.chapter.url}
					number={data.chapter.number}
				/>
			</div>
		{/if}

		<!-- Rendered once at server boot by src/lib/server/content.ts; not user input. -->
		<div class="prose">{@html data.lesson.html}</div>

		<footer class="reader__foot">
			<form
				method="POST"
				action="?/toggleComplete"
				use:enhance={() => async ({ update }) => update({ reset: false })}
			>
				<input type="hidden" name="complete" value={String(!complete)} />
				<button class="btn {complete ? 'btn--secondary' : 'btn--primary'}" type="submit">
					{#if complete}
						<span aria-hidden="true">✓</span> Completed — undo
					{:else}
						Mark complete
					{/if}
				</button>
			</form>

			<nav class="pager" aria-label="Chapter navigation">
				{#if data.prev}
					<a class="pager__link" href="/learn/{data.prev.slug}">
						<span class="pager__dir">← Previous</span>
						<span class="pager__title">{data.prev.title}</span>
					</a>
				{:else}
					<span></span>
				{/if}
				{#if data.next}
					<a class="pager__link pager__link--next" href="/learn/{data.next.slug}">
						<span class="pager__dir">Next →</span>
						<span class="pager__title">{data.next.title}</span>
					</a>
				{/if}
			</nav>
		</footer>
	</article>

	<aside class="reader__aside">
		<Toc entries={data.lesson.toc} />
	</aside>
</div>

<style>
	.reader__video {
		max-width: 66ch;
		margin-bottom: var(--sp-6);
	}

	.pager {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--sp-4);
		margin-top: var(--sp-5);
	}

	.pager__link {
		display: block;
		padding: var(--sp-3) var(--sp-4);
		border: 1px solid var(--border);
		border-radius: var(--r-card);
		text-decoration: none;
		color: var(--text-1);
		transition: border-color var(--dur-1) var(--ease-std);
	}

	.pager__link:hover {
		border-color: var(--border-strong);
		color: var(--text-1);
	}

	.pager__link--next {
		text-align: right;
	}

	.pager__dir {
		display: block;
		font-family: var(--font-mono);
		font-size: var(--fs-label);
		color: var(--text-3);
		margin-bottom: var(--sp-1);
	}

	.pager__title {
		display: block;
		font-size: var(--fs-small);
		font-weight: 600;
		line-height: 1.35;
	}

	@media (max-width: 640px) {
		.pager {
			grid-template-columns: 1fr;
		}
		.pager__link--next {
			text-align: left;
		}
	}
</style>
