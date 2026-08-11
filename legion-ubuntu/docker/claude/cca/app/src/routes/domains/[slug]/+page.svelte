<script lang="ts">
	import DomainMeter from '$lib/components/DomainMeter.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const accuracy = $derived(data.readiness.accuracy);
</script>

<svelte:head>
	<title>{data.domain.title} — CCA Prep</title>
</svelte:head>

<div class="shell stack" style="--dc: var(--{data.domain.accent})">
	<header>
		<p class="domain__code">{data.domain.code} · {data.domain.weight}% of the exam</p>
		<h1 class="page-title">{data.domain.title}</h1>
		<p class="lede">{data.domain.blurb}</p>
	</header>

	<div class="card">
		<DomainMeter
			domain={data.domain}
			value={data.readiness.proficiency}
			stats="{data.readiness.points}/{data.readiness.ceiling} scaled points · {accuracy !== null
				? `${accuracy}% recent accuracy over ${data.readiness.questionsAnswered} answers`
				: 'no drills yet'}"
		/>
	</div>

	<div class="facts">
		<div class="fact">
			<p class="fact__n">~{data.questionShare}</p>
			<p class="fact__l">questions on the paper</p>
		</div>
		<div class="fact">
			<p class="fact__n">{data.readiness.ceiling}</p>
			<p class="fact__l">scaled points at stake</p>
		</div>
		<div class="fact">
			<p class="fact__n">{data.questionCount}</p>
			<p class="fact__l">practice questions here</p>
		</div>
		<div class="fact">
			<p class="fact__n">{data.cardCount}</p>
			<p class="fact__l">flashcards</p>
		</div>
	</div>

	<div class="actions">
		<a class="btn btn--primary" href="/quiz?domain={data.domain.id}">Drill this domain</a>
		<a class="btn btn--secondary" href="/cards?domain={data.domain.id}">Review the deck</a>
	</div>

	<section>
		<div class="section-head">
			<h2>Chapters</h2>
			<p class="eyebrow" style="margin:0">
				{data.lessons.filter((l) => l.complete).length}/{data.lessons.length} complete
			</p>
		</div>
		<ol class="lessons">
			{#each data.lessons as lesson, i (lesson.slug)}
				<li>
					<a href="/learn/{lesson.slug}">
						<span class="lessons__n">{String(i + 1).padStart(2, '0')}</span>
						<span class="lessons__body">
							<span class="lessons__title">{lesson.title}</span>
							<span class="lessons__summary">{lesson.summary}</span>
						</span>
						<span class="lessons__tail">
							{#if lesson.complete}
								<span class="chip chip--ok">done</span>
							{:else}
								<span class="mono">{lesson.minutes} min</span>
							{/if}
						</span>
					</a>
				</li>
			{/each}
		</ol>
	</section>

	{#if data.scenarios.length > 0}
		<section>
			<div class="section-head">
				<h2>Where this shows up</h2>
			</div>
			<ul class="scenlist">
				{#each data.scenarios as scenario (scenario.slug)}
					<li><a href="/scenarios/{scenario.slug}">{scenario.title}</a></li>
				{/each}
			</ul>
		</section>
	{/if}
</div>

<style>
	.domain__code {
		font-family: var(--font-mono);
		font-size: var(--fs-label);
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dc);
		margin: 0 0 var(--sp-2);
	}

	.facts {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: var(--sp-4);
	}

	.fact {
		background: var(--bg-1);
		border: 1px solid var(--border);
		border-radius: var(--r-card);
		padding: var(--sp-4);
	}

	.fact__n {
		font-family: var(--font-mono);
		font-size: var(--fs-h2);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		color: var(--dc);
		margin: 0;
		line-height: 1.1;
	}

	.fact__l {
		font-size: var(--fs-small);
		color: var(--text-2);
		margin: var(--sp-2) 0 0;
	}

	.actions {
		display: flex;
		gap: var(--sp-3);
		flex-wrap: wrap;
	}

	.lessons,
	.scenlist {
		list-style: none;
		margin: 0;
		padding: 0;
		border: 1px solid var(--border);
		border-radius: var(--r-card);
		background: var(--bg-1);
		overflow: hidden;
	}

	.lessons li + li,
	.scenlist li + li {
		border-top: 1px solid var(--border);
	}

	.lessons a {
		display: flex;
		align-items: flex-start;
		gap: var(--sp-4);
		padding: var(--sp-4) var(--sp-5);
		text-decoration: none;
		color: var(--text-1);
		transition: background var(--dur-1) var(--ease-std);
	}

	.lessons a:hover {
		background: var(--bg-2);
		color: var(--text-1);
	}

	.lessons__n {
		font-family: var(--font-mono);
		font-size: var(--fs-label);
		font-weight: 700;
		color: var(--dc);
		padding-top: 3px;
	}

	.lessons__body {
		display: block;
		margin-right: auto;
		min-width: 0;
	}

	.lessons__title {
		display: block;
		font-size: var(--fs-ui);
		font-weight: 600;
	}

	.lessons__summary {
		display: block;
		font-family: var(--font-prose);
		font-size: var(--fs-small);
		font-weight: 400;
		line-height: 1.6;
		color: var(--text-2);
		margin-top: var(--sp-1);
		max-width: 66ch;
	}

	.lessons__tail {
		font-family: var(--font-mono);
		font-size: var(--fs-label);
		color: var(--text-3);
		white-space: nowrap;
		padding-top: 3px;
	}

	.scenlist a {
		display: block;
		padding: var(--sp-3) var(--sp-5);
		text-decoration: none;
		color: var(--text-1);
		font-size: var(--fs-small);
	}

	.scenlist a:hover {
		background: var(--bg-2);
		color: var(--brand);
	}

	@media (max-width: 560px) {
		.lessons__summary {
			display: none;
		}
	}
</style>
