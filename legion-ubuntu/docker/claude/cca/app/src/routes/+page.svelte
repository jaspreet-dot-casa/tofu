<script lang="ts">
	import ScoreRail from '$lib/components/ScoreRail.svelte';
	import DomainMeter from '$lib/components/DomainMeter.svelte';
	import Streak from '$lib/components/Streak.svelte';
	import AttemptHistory from '$lib/components/AttemptHistory.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const weakest = $derived(data.readiness.weakest);
</script>

<svelte:head>
	<title>Readiness — CCA Prep</title>
	<meta
		name="description"
		content="Readiness instrument for the Claude Certified Architect – Foundations exam."
	/>
</svelte:head>

<div class="shell stack">
	<ScoreRail
		score={data.readiness.score}
		domains={data.readiness.domains}
		label="Readiness · projected scaled score"
	/>

	<div class="strip3">
		<div class="card">
			<p class="eyebrow">Continue</p>
			{#if data.openAttempt}
				<p class="strip3__lead">You have a paper open.</p>
				<p class="strip3__meta">{data.openAttempt.label} — unfinished</p>
				<a class="btn btn--primary btn--sm" href="/quiz/{data.openAttempt.id}">Resume it</a>
			{:else if data.nextLesson}
				<p class="strip3__lead">{data.nextLesson.title}</p>
				<p class="strip3__meta">{data.nextLesson.minutes} min read</p>
				<a class="btn btn--primary btn--sm" href="/learn/{data.nextLesson.slug}">Read it</a>
			{:else}
				<p class="strip3__lead">Every chapter is done.</p>
				<p class="strip3__meta">Keep the score honest with drills.</p>
				<a class="btn btn--primary btn--sm" href="/quiz">Run a mock</a>
			{/if}
		</div>

		<div class="card">
			<p class="eyebrow">Streak</p>
			<Streak streak={data.streak} activity={data.activity} />
		</div>

		<div class="card">
			<p class="eyebrow">Next up</p>
			{#if weakest}
				<p class="strip3__lead">Drill {weakest.code}</p>
				<p class="strip3__meta">
					Weakest domain, {weakest.weight}% of the exam
				</p>
				<form method="POST" action="/quiz?/start">
					<input type="hidden" name="mode" value="domain" />
					<input type="hidden" name="target" value={weakest.id} />
					<button class="btn btn--secondary btn--sm" type="submit">Start drill</button>
				</form>
			{:else}
				<p class="strip3__lead">All domains at ceiling.</p>
				<p class="strip3__meta">Sit a full mock to confirm.</p>
				<a class="btn btn--secondary btn--sm" href="/quiz">Full mock</a>
			{/if}
			{#if data.cardsDue > 0}
				<p class="strip3__aside">
					<a href="/cards">{data.cardsDue} card{data.cardsDue === 1 ? '' : 's'} due</a>
				</p>
			{/if}
		</div>
	</div>

	<section>
		<div class="section-head">
			<h2>Domains</h2>
			<p class="eyebrow" style="margin:0">Track width = exam weight</p>
		</div>
		<div class="card">
			{#each data.readiness.domains as entry (entry.domain.id)}
				<DomainMeter
					domain={entry.domain}
					value={entry.proficiency}
					href="/domains/{entry.domain.slug}"
					stats="{entry.lessonsCompleted}/{entry.lessonsTotal} chapters · {entry.accuracy !== null
						? `${entry.accuracy}% recent accuracy`
						: 'no drills yet'} · {entry.points}/{entry.ceiling} pts"
				/>
			{/each}
		</div>
	</section>

	{#if data.history.length > 0}
		<section>
			<div class="section-head">
				<h2>Recent attempts</h2>
				<a class="btn btn--ghost btn--sm" href="/quiz">All practice</a>
			</div>
			<div class="card">
				<AttemptHistory attempts={data.history} />
			</div>
		</section>
	{/if}
</div>

<style>
	.strip3 {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--sp-4);
	}

	.strip3 .card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.strip3__lead {
		font-size: var(--fs-h3);
		font-weight: 700;
		line-height: 1.25;
		margin: 0 0 var(--sp-2);
	}

	.strip3__meta {
		font-family: var(--font-mono);
		font-size: var(--fs-label);
		color: var(--text-3);
		margin: 0 0 var(--sp-4);
	}

	.strip3__aside {
		margin: var(--sp-3) 0 0;
		font-size: var(--fs-small);
	}


	@media (max-width: 860px) {
		.strip3 {
			grid-template-columns: 1fr;
		}
	}
</style>
