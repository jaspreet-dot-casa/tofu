<script lang="ts">
	import ProgressRing from '$lib/components/ProgressRing.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Curriculum — CCA Prep</title>
</svelte:head>

<div class="shell stack">
	<header>
		<h1 class="page-title">Curriculum</h1>
		<p class="lede">
			Thirty-two chapters mapped onto the exam's own five weighted domains, plus a playbook for
			each of the six production scenarios the paper draws from.
		</p>
	</header>

	{#if data.orientation.length > 0}
		<section>
			<div class="section-head">
				<h2>Start here</h2>
			</div>
			<ul class="orient">
				{#each data.orientation as lesson (lesson.slug)}
					<li>
						<a class="card card--link" href="/learn/{lesson.slug}">
							<div class="orient__head">
								<h3>{lesson.title}</h3>
								{#if lesson.complete}
									<span class="chip chip--ok">done</span>
								{:else}
									<span class="chip chip--neutral">{lesson.minutes} min</span>
								{/if}
							</div>
							<p class="orient__summary">{lesson.summary}</p>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<section>
		<div class="section-head">
			<h2>The five domains</h2>
			<p class="eyebrow" style="margin:0">Weighted as the exam weights them</p>
		</div>
		<ul class="domains">
			{#each data.domains as domain (domain.id)}
				<li>
					<a
						class="card card--link card--domain"
						href="/domains/{domain.slug}"
						style="--dc: var(--{domain.accent})"
					>
						<div class="domain__head">
							<div>
								<p class="domain__code">{domain.code}</p>
								<h3>{domain.title}</h3>
							</div>
							<ProgressRing
								value={domain.lessonsTotal > 0 ? domain.lessonsDone / domain.lessonsTotal : 0}
								accent={domain.accent}
							/>
						</div>
						<p class="domain__blurb">{domain.blurb}</p>
						<p class="domain__meta">
							<span class="chip chip--{domain.accent}">{domain.weight}% · ~{domain.questionShare} q</span
							>
							<span class="mono">{domain.lessonsDone}/{domain.lessonsTotal} chapters</span>
						</p>
					</a>
				</li>
			{/each}
		</ul>
	</section>

	<section>
		<div class="section-head">
			<h2>Scenario briefings</h2>
			<p class="eyebrow" style="margin:0">
				The exam draws {data.exam.scenariosDrawn} of {data.exam.scenarioPoolSize}, ~15 questions each
			</p>
		</div>
		<ul class="scenarios">
			{#each data.scenarios as scenario (scenario.slug)}
				<li>
					<a class="card card--link" href="/scenarios/{scenario.slug}">
						<h3>{scenario.title}</h3>
						<p class="scenario__premise">{scenario.premise}</p>
						<p class="scenario__meta">
							{#each scenario.domains as id (id)}
								<span class="chip chip--{id}">{id.toUpperCase()}</span>
							{/each}
							<span class="mono">{scenario.questionCount} questions</span>
						</p>
					</a>
				</li>
			{/each}
		</ul>
	</section>
</div>

<style>
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.orient,
	.domains,
	.scenarios {
		display: grid;
		gap: var(--sp-4);
	}

	.orient {
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	}

	.domains {
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
	}

	.scenarios {
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	}

	h3 {
		font-size: var(--fs-h3);
		margin: 0;
		line-height: 1.25;
	}

	.orient__head,
	.domain__head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--sp-4);
		margin-bottom: var(--sp-3);
	}

	.domain__code {
		font-family: var(--font-mono);
		font-size: var(--fs-label);
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--dc);
		margin: 0 0 var(--sp-1);
	}

	.orient__summary,
	.domain__blurb,
	.scenario__premise {
		font-family: var(--font-prose);
		font-size: var(--fs-small);
		font-weight: 400;
		line-height: 1.65;
		color: var(--text-2);
		margin: 0 0 var(--sp-4);
	}

	.scenario__premise {
		margin-top: var(--sp-3);
	}

	.domain__meta,
	.scenario__meta {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		flex-wrap: wrap;
		margin: 0;
		font-size: var(--fs-label);
		color: var(--text-3);
	}
</style>
