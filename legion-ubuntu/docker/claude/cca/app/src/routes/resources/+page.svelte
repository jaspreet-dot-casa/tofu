<script lang="ts">
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Resources — CCA Prep</title>
</svelte:head>

<div class="shell stack">
	<header>
		<h1 class="page-title">Resources</h1>
		<p class="lede">
			The official path, in order, plus the 13-hour course broken into jumpable chapters. Step 5 is
			the source of truth — where anything here disagrees with the official exam guide, the guide
			wins.
		</p>
	</header>

	<div class="card facts">
		<div><span class="mono">{data.exam.questionCount}</span> questions</div>
		<div><span class="mono">{data.exam.minutes}</span> minutes</div>
		<div><span class="mono">{data.exam.passScore}</span> / 1000 to pass</div>
		<div>
			<span class="mono">{data.exam.scenariosDrawn} of {data.exam.scenarioPoolSize}</span> scenarios
		</div>
		<div><span class="mono">${data.exam.costUsd}</span> USD</div>
		<div><span class="mono">{data.exam.validityMonths}</span> months valid</div>
	</div>

	<section>
		<div class="section-head">
			<h2>The roadmap</h2>
			<p class="eyebrow" style="margin:0">Seven steps, in order</p>
		</div>
		<ol class="roadmap">
			{#each data.roadmap as step, i (step.id)}
				<li class="card">
					<p class="roadmap__n mono">{String(i + 1).padStart(2, '0')}</p>
					<div>
						<h3>{step.title}</h3>
						<p class="roadmap__body">{step.body}</p>
						<p class="roadmap__links">
							{#each step.links as link (link.href)}
								<a href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a>
							{/each}
						</p>
					</div>
				</li>
			{/each}
		</ol>
	</section>

	<section>
		<div class="section-head">
			<h2>The course, chapter by chapter</h2>
			<a class="btn btn--ghost btn--sm" href={data.course.url} target="_blank" rel="noreferrer"
				>Open on YouTube ↗</a
			>
		</div>
		<p class="course__meta">
			<strong>{data.course.title}</strong> — {data.course.channel}, course by {data.course.author}. {data
				.course.totalHours} hours. Every chapter below jumps straight to its timestamp.
		</p>
		<ul class="chapters">
			{#each data.course.chapters as chapter (chapter.number)}
				<li>
					<a href={chapter.url} target="_blank" rel="noreferrer">
						<span class="chapters__n mono">{String(chapter.number).padStart(2, '0')}</span>
						<span class="chapters__title">{chapter.title}</span>
						{#if chapter.domain}
							<span class="chip chip--{chapter.domain.accent}">{chapter.domain.code}</span>
						{:else}
							<span class="chip chip--neutral">framing</span>
						{/if}
						<span class="chapters__ts mono">{chapter.timestamp}</span>
					</a>
				</li>
			{/each}
		</ul>
	</section>

	<section>
		<div class="section-head">
			<h2>Further reading</h2>
		</div>
		<ul class="extras">
			{#each data.extras as extra (extra.href)}
				<li class="card">
					<a href={extra.href} target="_blank" rel="noreferrer">{extra.label} ↗</a>
					<p>{extra.note}</p>
				</li>
			{/each}
		</ul>
	</section>

	<section class="card disclosure">
		<p class="eyebrow">About this site</p>
		<p>
			The lessons here are a synthesis of the public exam blueprint, the freeCodeCamp course, and
			the Claude and MCP documentation. The questions are written in the exam's style — they are
			practice items, not real exam questions, and this site is not affiliated with Anthropic or
			Pearson VUE. Use it to find your gaps; use the official exam guide to confirm the scope.
		</p>
	</section>
</div>

<style>
	ul,
	ol {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.facts {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
		gap: var(--sp-4);
		font-size: var(--fs-small);
		color: var(--text-2);
	}

	.facts .mono {
		display: block;
		font-size: var(--fs-h3);
		font-weight: 700;
		color: var(--text-1);
	}

	.roadmap {
		display: grid;
		gap: var(--sp-3);
	}

	.roadmap li {
		display: flex;
		gap: var(--sp-4);
		align-items: flex-start;
	}

	.roadmap__n {
		font-size: var(--fs-h3);
		font-weight: 700;
		color: var(--brand);
		margin: 0;
		flex: none;
	}

	.roadmap h3 {
		font-size: var(--fs-h3);
		margin: 0 0 var(--sp-2);
	}

	.roadmap__body {
		font-family: var(--font-prose);
		font-size: var(--fs-small);
		font-weight: 400;
		line-height: 1.7;
		color: var(--text-2);
		margin: 0 0 var(--sp-3);
		max-width: 66ch;
	}

	.roadmap__links {
		display: flex;
		gap: var(--sp-4);
		flex-wrap: wrap;
		margin: 0;
		font-size: var(--fs-small);
	}

	.course__meta {
		font-family: var(--font-prose);
		font-size: var(--fs-small);
		font-weight: 400;
		line-height: 1.7;
		color: var(--text-2);
		max-width: 66ch;
		margin: 0 0 var(--sp-4);
	}

	.chapters {
		border: 1px solid var(--border);
		border-radius: var(--r-card);
		background: var(--bg-1);
		overflow: hidden;
	}

	.chapters li + li {
		border-top: 1px solid var(--border);
	}

	.chapters a {
		display: flex;
		align-items: center;
		gap: var(--sp-3);
		padding: var(--sp-3) var(--sp-5);
		text-decoration: none;
		color: var(--text-1);
		transition: background var(--dur-1) var(--ease-std);
	}

	.chapters a:hover {
		background: var(--bg-2);
		color: var(--text-1);
	}

	.chapters__n {
		font-size: var(--fs-label);
		color: var(--text-3);
		flex: none;
	}

	.chapters__title {
		font-size: var(--fs-small);
		font-weight: 600;
		margin-right: auto;
		min-width: 0;
	}

	.chapters__ts {
		font-size: var(--fs-label);
		color: var(--text-3);
		white-space: nowrap;
	}

	.extras {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--sp-4);
	}

	.extras a {
		font-size: var(--fs-small);
		font-weight: 600;
	}

	.extras p {
		font-family: var(--font-prose);
		font-size: var(--fs-small);
		font-weight: 400;
		line-height: 1.65;
		color: var(--text-2);
		margin: var(--sp-2) 0 0;
	}

	.disclosure p {
		font-family: var(--font-prose);
		font-size: var(--fs-small);
		font-weight: 400;
		line-height: 1.7;
		color: var(--text-2);
		margin: 0;
		max-width: 66ch;
	}
</style>
