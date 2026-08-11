<script lang="ts">
	import AttemptHistory from '$lib/components/AttemptHistory.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Practice — CCA Prep</title>
</svelte:head>

<div class="shell stack">
	<header>
		<h1 class="page-title">Practice</h1>
		<p class="lede">
			{data.bankSize} scenario-style questions, one correct answer and three distractors each — the
			exam's own format. Every wrong option comes with a note on why it fails, because the
			distractors are where the learning is.
		</p>
	</header>

	{#if data.openAttempt}
		<div class="card resume">
			<div>
				<p class="eyebrow">Unfinished</p>
				<p class="resume__lead">You have a {data.openAttempt.label} still open.</p>
			</div>
			<a class="btn btn--primary" href="/quiz/{data.openAttempt.id}">Resume</a>
		</div>
	{/if}

	<section>
		<div class="section-head">
			<h2>Full mock exam</h2>
		</div>
		<div class="card mock">
			<div class="mock__facts">
				<div><span class="mono">{data.exam.questionCount}</span> questions</div>
				<div><span class="mono">{data.exam.minutes}</span> minutes</div>
				<div>
					<span class="mono">{data.exam.scenariosDrawn} of {data.exam.scenarioPoolSize}</span> scenarios
				</div>
				<div><span class="mono">{data.exam.passScore}</span> to pass</div>
			</div>
			<p class="mock__note">
				Drawn and timed the way the real paper is. The clock lives in the status line and nothing
				reveals whether you were right until you hand it in.
			</p>
			<form method="POST" action="?/start">
				<input type="hidden" name="mode" value="mock" />
				<button class="btn btn--primary" type="submit">Start the mock</button>
			</form>
		</div>
	</section>

	<section>
		<div class="section-head">
			<h2>Domain drills</h2>
			<p class="eyebrow" style="margin:0">No clock · answers revealed as you go</p>
		</div>
		<ul class="drills">
			{#each data.domains as domain (domain.id)}
				<li>
					<form method="POST" action="?/start" class="drill" style="--dc: var(--{domain.accent})">
						<input type="hidden" name="mode" value="domain" />
						<input type="hidden" name="target" value={domain.id} />
						<div class="drill__body">
							<p class="drill__code">{domain.code} · {domain.weight}%</p>
							<p class="drill__title">{domain.title}</p>
							<p class="drill__meta mono">{domain.available} questions available</p>
						</div>
						<button class="btn btn--secondary btn--sm" type="submit" disabled={domain.available === 0}>
							Drill
						</button>
					</form>
				</li>
			{/each}
		</ul>
	</section>

	<section>
		<div class="section-head">
			<h2>Scenario drills</h2>
			<p class="eyebrow" style="margin:0">One brief at a time</p>
		</div>
		<ul class="drills">
			{#each data.scenarios as scenario (scenario.id)}
				<li>
					<form method="POST" action="?/start" class="drill">
						<input type="hidden" name="mode" value="scenario" />
						<input type="hidden" name="target" value={scenario.id} />
						<div class="drill__body">
							<p class="drill__title">{scenario.title}</p>
							<p class="drill__meta mono">{scenario.available} questions</p>
						</div>
						<button class="btn btn--secondary btn--sm" type="submit" disabled={scenario.available === 0}
							>Drill</button
						>
					</form>
				</li>
			{/each}
		</ul>
	</section>

	{#if data.history.length > 0}
		<section>
			<div class="section-head">
				<h2>History</h2>
			</div>
			<div class="card">
				<AttemptHistory attempts={data.history} />
			</div>
		</section>
	{/if}
</div>

<style>
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.resume {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--sp-4);
		flex-wrap: wrap;
		border-color: var(--brand);
	}

	.resume__lead {
		font-size: var(--fs-h3);
		font-weight: 700;
		margin: 0;
	}

	.mock__facts {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: var(--sp-4);
		padding-bottom: var(--sp-4);
		border-bottom: 1px solid var(--border);
		font-size: var(--fs-small);
		color: var(--text-2);
	}

	.mock__facts .mono {
		display: block;
		font-size: var(--fs-h3);
		font-weight: 700;
		color: var(--text-1);
	}

	.mock__note {
		font-family: var(--font-prose);
		font-size: var(--fs-small);
		font-weight: 400;
		line-height: 1.65;
		color: var(--text-2);
		max-width: 66ch;
		margin: var(--sp-4) 0 var(--sp-5);
	}

	.drills {
		display: grid;
		gap: var(--sp-3);
	}

	.drill {
		display: flex;
		align-items: center;
		gap: var(--sp-4);
		background: var(--bg-1);
		border: 1px solid var(--border);
		border-left: 3px solid var(--dc, var(--border));
		border-radius: var(--r-card);
		padding: var(--sp-4) var(--sp-5);
	}

	.drill__body {
		margin-right: auto;
		min-width: 0;
	}

	.drill__code {
		font-family: var(--font-mono);
		font-size: var(--fs-label);
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--dc);
		margin: 0 0 var(--sp-1);
	}

	.drill__title {
		font-size: var(--fs-ui);
		font-weight: 600;
		margin: 0;
	}

	.drill__meta {
		font-size: var(--fs-label);
		color: var(--text-3);
		margin: var(--sp-1) 0 0;
	}

</style>
