<script lang="ts">
	import Toc from '$lib/components/Toc.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>{data.scenario.title} — CCA Prep</title>
	<meta name="description" content={data.scenario.premise} />
</svelte:head>

<div class="reader shell">
	<article class="reader__main">
		<nav class="crumbs" aria-label="Breadcrumb">
			<a href="/curriculum">Curriculum</a>
			<span aria-hidden="true">›</span>
			<span>Scenario briefing</span>
		</nav>

		<header class="reader__head">
			<h1 class="page-title">{data.scenario.title}</h1>
			<p class="reader__meta">
				{#each data.domains as domain (domain.id)}
					<span class="chip chip--{domain.accent}">{domain.code} · {domain.weight}%</span>
				{/each}
				<span class="mono">{data.questionCount} questions</span>
			</p>
			<p class="lede">{data.scenario.premise}</p>
		</header>

		<div class="card tests">
			<p class="eyebrow">What this scenario is really testing</p>
			<ul>
				{#each data.scenario.tests as test (test)}
					<li>{test}</li>
				{/each}
			</ul>
		</div>

		{#if data.html}
			<!-- Rendered at server boot from src/content/scenarios; not user input. -->
			<div class="prose">{@html data.html}</div>
		{/if}

		<footer class="reader__foot">
			<form method="POST" action="/quiz?/start">
				<input type="hidden" name="mode" value="scenario" />
				<input type="hidden" name="target" value={data.scenario.id} />
				<button class="btn btn--primary" type="submit">Drill this scenario</button>
			</form>
		</footer>
	</article>

	<aside class="reader__aside">
		<Toc entries={data.toc} />
	</aside>
</div>

<style>
	.tests {
		max-width: 66ch;
		margin-bottom: var(--sp-6);
	}

	.tests ul {
		margin: 0;
		padding-left: 1.2em;
		font-family: var(--font-prose);
		font-size: var(--fs-small);
		font-weight: 400;
		line-height: 1.65;
		color: var(--text-2);
	}

	.tests li + li {
		margin-top: var(--sp-2);
	}

</style>
