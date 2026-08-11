<script lang="ts">
	import ScoreRail from '$lib/components/ScoreRail.svelte';
	import DomainMeter from '$lib/components/DomainMeter.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import WhyWrong from '$lib/components/WhyWrong.svelte';
	import { OPTION_LETTERS } from '$lib/data/option-index';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	/** The breakdown already carries points and ceiling — the rail needs nothing else. */
	const railDomains = $derived(data.breakdown);

	const delta = $derived(data.previousScore !== null ? data.result.score - data.previousScore : null);
</script>

<svelte:head>
	<title>Result {data.result.score} — CCA Prep</title>
</svelte:head>

<div class="shell stack">
	<header>
		<p class="eyebrow">
			{data.attempt.mode === 'mock' ? 'Mock exam' : `${data.attempt.mode} drill`} · result
		</p>
		<h1 class="page-title">{data.result.passed ? 'Above the line.' : 'Below the line.'}</h1>
	</header>

	<ScoreRail
		score={data.result.score}
		domains={railDomains}
		label="Attempt · scaled score"
		note="Scaled the way the exam reports it — domain-weighted onto 100–1000. Pearson's own scaling is not linear in raw marks, so treat this as a calibrated estimate, not a prediction."
	/>

	<div class="meta">
		<div><span class="mono">{data.result.correct}/{data.result.total}</span> raw</div>
		<div><span class="mono">{data.attempt.elapsed}</span> taken</div>
		{#if delta !== null}
			<div>
				<span class="mono" class:is-up={delta > 0} class:is-down={delta < 0}>
					{delta > 0 ? '▲ +' : delta < 0 ? '▼ ' : ''}{delta}
				</span> vs last {data.attempt.mode}
			</div>
		{/if}
	</div>

	<section>
		<div class="section-head">
			<h2>By domain</h2>
		</div>
		<div class="card">
			{#each data.breakdown as row (row.domain.id)}
				<DomainMeter
					domain={row.domain}
					value={row.total > 0 ? row.correct / row.total : 0}
					href="/domains/{row.domain.slug}"
					stats="{row.correct}/{row.total} correct"
				/>
			{/each}
		</div>
	</section>

	<section>
		<div class="section-head">
			<h2>Review</h2>
			<p class="eyebrow" style="margin:0">Every distractor, and why it fails</p>
		</div>
		<ul class="review list-reset">
			{#each data.review as item, i (item.id)}
				<li>
					<details class="card" open={!item.correct}>
						<summary>
							<span class="review__n mono">Q{i + 1}</span>
							<span class="chip chip--{item.domain.accent}">{item.domain.code}</span>
							{#if item.correct}
								<span class="chip chip--ok"><span aria-hidden="true">✓</span> correct</span>
							{:else}
								<span class="chip chip--err"><span aria-hidden="true">✕</span> missed</span>
							{/if}
							{#if item.flagged}
								<span class="chip chip--flag"><Icon name="flag" size={11} /> flagged</span>
							{/if}
							<span class="review__stem">{item.stem}</span>
						</summary>

						<div class="review__body">
							<p class="review__fullstem">{item.stem}</p>

							<ul class="review__options list-reset">
								{#each item.options as option, oi (oi)}
									<li
										class="ropt"
										class:is-correct={oi === item.answer}
										class:is-incorrect={oi === item.chosen && oi !== item.answer}
									>
										<span class="ropt__key">{OPTION_LETTERS[oi]}</span>
										<span class="ropt__text">{option.text}</span>
										{#if oi === item.answer}
											<span class="ropt__tail"><span aria-hidden="true">✓</span> Correct</span>
										{:else if oi === item.chosen}
											<span class="ropt__tail"><span aria-hidden="true">✕</span> Your answer</span>
										{/if}
									</li>
								{/each}
							</ul>

							<p class="review__explanation">{item.explanation}</p>

							<p class="eyebrow">Why each option lands where it does</p>
							<WhyWrong why={item.options.map((o) => o.why)} />

							{#if item.lesson}
								<a class="btn btn--ghost btn--sm" href="/learn/{item.lesson}">Revise the chapter →</a>
							{/if}
						</div>
					</details>
				</li>
			{/each}
		</ul>
	</section>

	<div class="actions">
		<a class="btn btn--primary" href="/quiz">More practice</a>
		<a class="btn btn--secondary" href="/">Back to readiness</a>
	</div>
</div>

<style>
	.meta {
		display: flex;
		gap: var(--sp-5);
		flex-wrap: wrap;
		font-size: var(--fs-small);
		color: var(--text-2);
	}

	.meta .mono {
		font-weight: 700;
		color: var(--text-1);
	}

	.meta .is-up {
		color: var(--ok);
	}
	.meta .is-down {
		color: var(--err);
	}

	.review {
		display: grid;
		gap: var(--sp-3);
	}

	.review details {
		padding: 0;
	}

	summary {
		display: flex;
		align-items: center;
		gap: var(--sp-3);
		padding: var(--sp-4) var(--sp-5);
		cursor: pointer;
		flex-wrap: wrap;
	}

	.review__n {
		font-size: var(--fs-label);
		font-weight: 700;
		color: var(--text-3);
	}

	.review__stem {
		flex: 1 1 100%;
		font-family: var(--font-prose);
		font-size: var(--fs-small);
		font-weight: 400;
		color: var(--text-2);
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	details[open] .review__stem {
		display: none;
	}

	.review__body {
		padding: 0 var(--sp-5) var(--sp-5);
	}

	.review__fullstem {
		font-family: var(--font-prose);
		font-size: var(--fs-prose);
		font-weight: 400;
		line-height: 1.65;
		margin: 0 0 var(--sp-4);
		max-width: 66ch;
	}

	.review__options {
		display: grid;
		gap: var(--sp-2);
		margin-bottom: var(--sp-5);
	}

	.ropt {
		display: flex;
		align-items: flex-start;
		gap: var(--sp-3);
		border: 1px solid var(--border);
		border-radius: var(--r-ctl);
		padding: var(--sp-3) var(--sp-4);
		font-size: var(--fs-small);
		font-weight: 600;
		line-height: 1.5;
	}

	.ropt.is-correct {
		background: var(--ok-soft);
		border-color: var(--ok);
	}

	.ropt.is-correct .ropt__tail {
		color: var(--ok);
	}

	.ropt.is-incorrect {
		background: var(--err-soft);
		border-color: var(--err);
	}

	.ropt.is-incorrect .ropt__tail {
		color: var(--err);
	}

	.ropt__key {
		font-family: var(--font-mono);
		font-size: var(--fs-label);
		font-weight: 700;
		color: var(--text-3);
		flex: none;
		padding-top: 2px;
	}

	.ropt__text {
		margin-right: auto;
	}

	.ropt__tail {
		font-family: var(--font-mono);
		font-size: var(--fs-label);
		white-space: nowrap;
		flex: none;
		padding-top: 2px;
	}

	.review__explanation {
		font-family: var(--font-prose);
		font-size: var(--fs-small);
		font-weight: 400;
		line-height: 1.7;
		color: var(--text-1);
		margin: 0 0 var(--sp-5);
		max-width: 66ch;
	}


</style>
