<script lang="ts">
	import DomainMeter from '$lib/components/DomainMeter.svelte';
	import Streak from '$lib/components/Streak.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const remaining = $derived(data.overall.total - data.overall.done);

	// Built here rather than in the template: a `{#if}` inside the markup swallows the
	// whitespace around the separator, so the two clauses run together.
	const summary = $derived(
		remaining > 0
			? `${data.overall.percent}% complete · ${remaining} to go`
			: 'Every chapter read'
	);
</script>

<svelte:head>
	<title>Progress — CCA Prep</title>
	<meta
		name="description"
		content="Study tracker for the Claude Certified Architect – Foundations exam."
	/>
</svelte:head>

<div class="shell stack">
	<section class="hero card">
		<p class="eyebrow">Curriculum progress</p>
		<p class="hero__count">
			<span class="hero__done">{data.overall.done}</span><span class="hero__of"
				>/{data.overall.total}</span
			>
			<span class="hero__unit">chapters read</span>
		</p>
		<div class="hero__track">
			<div class="hero__fill" style="width: {data.overall.percent}%"></div>
		</div>
		<p class="hero__meta">{summary}</p>
	</section>

	<div class="strip2">
		<div class="card">
			<p class="eyebrow">Continue</p>
			{#if data.nextLesson}
				<p class="strip2__lead">{data.nextLesson.title}</p>
				<p class="strip2__meta">{data.nextLesson.minutes} min read</p>
				<a class="btn btn--primary btn--sm" href="/learn/{data.nextLesson.slug}">Read it</a>
			{:else}
				<p class="strip2__lead">Every chapter is done.</p>
				<p class="strip2__meta">Revisit a scenario, or work the official guide.</p>
				<a class="btn btn--primary btn--sm" href="/curriculum">Back to the curriculum</a>
			{/if}
		</div>

		<div class="card">
			<p class="eyebrow">Streak</p>
			<Streak streak={data.streak} activity={data.activity} />
		</div>
	</div>

	<section>
		<div class="section-head">
			<h2>Domains</h2>
			<p class="eyebrow" style="margin:0">Track width = exam weight</p>
		</div>
		<div class="card">
			{#each data.domains as entry (entry.domain.id)}
				<DomainMeter
					domain={entry.domain}
					value={entry.total === 0 ? 0 : entry.done / entry.total}
					href="/domains/{entry.domain.slug}"
					stats="{entry.done}/{entry.total} chapters · {entry.percent}%"
				/>
			{/each}
		</div>
	</section>
</div>

<style>
	.hero {
		text-align: center;
	}

	.hero__count {
		margin: var(--sp-3) 0 var(--sp-4);
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
		line-height: 1;
	}

	.hero__done {
		font-size: var(--fs-score);
		font-weight: 800;
		color: var(--text-1);
	}

	.hero__of {
		font-size: var(--fs-h2);
		font-weight: 700;
		color: var(--text-3);
	}

	.hero__unit {
		display: block;
		margin-top: var(--sp-3);
		font-size: var(--fs-label);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-3);
	}

	.hero__track {
		height: 12px;
		border-radius: var(--r-pill);
		background: var(--track);
		border: 1px solid var(--border);
		overflow: hidden;
	}

	.hero__fill {
		height: 100%;
		background: var(--brand);
		border-radius: var(--r-pill);
		transition: width var(--dur-rail) var(--ease-std);
	}

	.hero__meta {
		margin: var(--sp-3) 0 0;
		font-family: var(--font-mono);
		font-size: var(--fs-label);
		color: var(--text-3);
	}

	.strip2 {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--sp-4);
	}

	.strip2 .card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.strip2__lead {
		font-size: var(--fs-h3);
		font-weight: 700;
		line-height: 1.25;
		margin: 0 0 var(--sp-2);
	}

	.strip2__meta {
		font-family: var(--font-mono);
		font-size: var(--fs-label);
		color: var(--text-3);
		margin: 0 0 var(--sp-4);
	}

	@media (max-width: 860px) {
		.strip2 {
			grid-template-columns: 1fr;
		}
	}
</style>
