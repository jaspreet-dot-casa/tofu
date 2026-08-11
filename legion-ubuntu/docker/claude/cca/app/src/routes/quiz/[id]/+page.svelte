<script lang="ts">
	import { untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import { quizClock } from '$lib/state/quizClock.svelte';
	import { isTypingTarget } from '$lib/keys';
	import { OPTION_LETTERS } from '$lib/data/option-index';
	import Icon from '$lib/components/Icon.svelte';
	import WhyWrong from '$lib/components/WhyWrong.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	interface Reveal {
		correct: boolean;
		answer: number | null;
		explanation: string;
		why: string[];
		lesson: string | null;
	}

	const isMock = $derived(data.attempt.mode === 'mock');

	let index = $state(0);
	// Deliberately a one-time snapshot: the paper is frozen for the life of the
	// attempt, and answer/flag actions run with invalidateAll off, so these arrays
	// are the client's own record from here on.
	let chosen = $state<(number | null)[]>(untrack(() => data.questions.map((q) => q.chosen)));
	let flagged = $state<boolean[]>(untrack(() => data.questions.map((q) => q.flagged)));
	/** Per-question reveal, drill mode only — arrives from the answer action. */
	let reveals = $state<Record<string, Reveal>>({});

	const current = $derived(data.questions[index]);
	const reveal = $derived(current ? (reveals[current.id] ?? null) : null);
	const answeredCount = $derived(chosen.filter((c) => c !== null).length);

	// The clock only exists in mock mode. Drill mode never starts it.
	$effect(() => {
		if (isMock && data.attempt.deadlineAt) quizClock.start(new Date(data.attempt.deadlineAt));
		else quizClock.stop();
		return () => quizClock.stop();
	});

	let finishForm = $state<HTMLFormElement | null>(null);
	let flagForm = $state<HTMLFormElement | null>(null);
	let optionsEl = $state<HTMLElement | null>(null);

	// Hand the paper in automatically when a mock runs out of time.
	$effect(() => {
		if (isMock && quizClock.expired) finishForm?.requestSubmit();
	});

	function go(next: number) {
		index = Math.max(0, Math.min(data.questions.length - 1, next));
	}

	/** Options are real submit buttons, so selecting is just clicking one. */
	function select(option: number) {
		if (reveal) return;
		optionsEl?.querySelectorAll('button')[option]?.click();
	}

	function onKey(event: KeyboardEvent) {
		if (isTypingTarget(event)) return;

		const key = event.key.toLowerCase();

		if (key === 'arrowleft') go(index - 1);
		else if (key === 'arrowright') go(index + 1);
		else if (key === 'f') flagForm?.requestSubmit();
		else if ('abcd'.includes(key)) select('abcd'.indexOf(key));
		else if ('1234'.includes(key)) select(Number(key) - 1);
		else return;

		event.preventDefault();
	}
</script>

<svelte:head>
	<title>{isMock ? 'Mock exam' : 'Drill'} — CCA Prep</title>
</svelte:head>

<svelte:window onkeydown={onKey} />

{#if current}
	<div class="runner shell">
		<div class="runner__main">
			<div class="runner__bar">
				<p class="eyebrow" style="margin:0">
					Question {index + 1} / {data.questions.length}
					{isMock ? '· mock exam' : '· drill'}
				</p>
				<p class="runner__progress mono">{answeredCount} answered</p>
			</div>

			{#if current.scenario}
				<details class="scenario">
					<summary>
						<span class="eyebrow" style="margin:0">Scenario</span>
						<span class="scenario__name">{current.scenario.title}</span>
						<span class="chip chip--{current.domain.accent}"
							>{current.domain.code} · {current.domain.weight}%</span
						>
					</summary>
					<p class="scenario__premise prose-note">{current.scenario.premise}</p>
				</details>
			{/if}

			<div class="card question">
				<p class="question__stem">{current.stem}</p>

				<form
					method="POST"
					action="?/answer"
					use:enhance={({ formData }) => {
						const picked = Number(formData.get('chosen'));
						chosen[index] = picked;
						return async ({ result, update }) => {
							if (result.type === 'success' && result.data) {
								const payload = result.data as { questionId: string; reveal?: Reveal };
								if (payload.reveal) reveals[payload.questionId] = payload.reveal;
							}
							await update({ reset: false, invalidateAll: false });
						};
					}}
				>
					<input type="hidden" name="questionId" value={current.id} />

					<ul class="options list-reset" bind:this={optionsEl}>
						{#each current.options as option, i (i)}
							{@const isChosen = chosen[index] === i}
							{@const isAnswer = reveal !== null && reveal.answer === i}
							<li>
								<button
									type="submit"
									name="chosen"
									value={i}
									class="option"
									class:is-selected={isChosen && !reveal}
									class:is-correct={reveal && isAnswer}
									class:is-incorrect={reveal && isChosen && !isAnswer}
									aria-pressed={isChosen}
									disabled={!!reveal}
								>
									<span class="option__key">{OPTION_LETTERS[i]}</span>
									<span class="option__text">{option}</span>
									{#if reveal && isAnswer}
										<span class="option__tail"><span aria-hidden="true">✓</span> Correct</span>
									{:else if reveal && isChosen}
										<span class="option__tail"><span aria-hidden="true">✕</span> Your answer</span>
									{/if}
								</button>
							</li>
						{/each}
					</ul>
				</form>

				{#if reveal}
					<div class="reveal">
						<p class="reveal__verdict eyebrow" style="--eyebrow-ink: var(--{reveal.correct ? 'ok' : 'err'})">
							{reveal.correct ? 'Correct.' : 'Not quite.'}
						</p>
						<p class="reveal__explanation prose-note">{reveal.explanation}</p>
						<p class="eyebrow">Why the others fail</p>
						<WhyWrong why={reveal.why} skip={reveal.answer} />
						{#if reveal.lesson}
							<a class="btn btn--ghost btn--sm reveal__revise" href="/learn/{reveal.lesson}"
								>Revise the chapter →</a
							>
						{/if}
					</div>
				{/if}
			</div>

			<div class="runner__controls">
				<button
					class="btn btn--secondary btn--sm"
					type="button"
					onclick={() => go(index - 1)}
					disabled={index === 0}
				>
					← Previous
				</button>

				<form
					method="POST"
					action="?/flag"
					bind:this={flagForm}
					use:enhance={() => {
						flagged[index] = !flagged[index];
						return async ({ update }) => update({ reset: false, invalidateAll: false });
					}}
				>
					<input type="hidden" name="questionId" value={current.id} />
					<input type="hidden" name="flagged" value={String(!flagged[index])} />
					<button
						class="btn btn--ghost btn--sm flagbtn"
						class:is-flagged={flagged[index]}
						type="submit"
					>
						<Icon name="flag" />
						{flagged[index] ? 'Flagged' : 'Flag'}
					</button>
				</form>

				{#if index < data.questions.length - 1}
					<button class="btn btn--secondary btn--sm" type="button" onclick={() => go(index + 1)}>
						Next →
					</button>
				{:else}
					<span></span>
				{/if}
			</div>

			<form method="POST" action="?/finish" bind:this={finishForm} class="runner__finish">
				<button class="btn btn--primary" type="submit">
					{isMock ? 'Hand in the paper' : 'Finish and score'}
				</button>
				{#if answeredCount < data.questions.length}
					<p class="runner__warn mono">
						{data.questions.length - answeredCount} unanswered — there is no penalty for guessing.
					</p>
				{/if}
			</form>

			<p class="runner__keys mono">
				<kbd>A</kbd>–<kbd>D</kbd> select · <kbd>←</kbd><kbd>→</kbd> navigate · <kbd>F</kbd> flag
			</p>
		</div>

		<aside class="runner__palette">
			<p class="eyebrow">Questions</p>
			<ol class="palette list-reset">
				{#each data.questions as question, i (question.id)}
					<li>
						<button
							type="button"
							class="palette__cell"
							class:is-current={i === index}
							class:is-answered={chosen[i] !== null}
							class:is-flagged={flagged[i]}
							onclick={() => go(i)}
							aria-label="Question {i + 1}{chosen[i] !== null ? ', answered' : ''}{flagged[i]
								? ', flagged'
								: ''}"
							aria-current={i === index ? 'true' : undefined}
						>
							{i + 1}
							{#if flagged[i]}<span class="palette__flag"><Icon name="flag" size={9} /></span>{/if}
						</button>
					</li>
				{/each}
			</ol>
		</aside>
	</div>
{/if}

<style>
	.runner {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 200px;
		gap: var(--sp-7);
		align-items: start;
	}

	.runner__main {
		min-width: 0;
	}

	.runner__bar {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--sp-4);
		margin-bottom: var(--sp-4);
	}

	.runner__progress {
		font-size: var(--fs-label);
		color: var(--text-3);
		margin: 0;
	}

	.scenario {
		background: var(--bg-1);
		border: 1px solid var(--border);
		border-radius: var(--r-card);
		margin-bottom: var(--sp-4);
	}

	.scenario summary {
		display: flex;
		align-items: center;
		gap: var(--sp-3);
		padding: var(--sp-3) var(--sp-4);
		cursor: pointer;
		flex-wrap: wrap;
	}

	.scenario__name {
		font-size: var(--fs-small);
		font-weight: 600;
		margin-right: auto;
	}

	.scenario__premise {
		margin: 0;
		padding: 0 var(--sp-4) var(--sp-4);
	}

	.question__stem {
		font-family: var(--font-prose);
		font-size: var(--fs-prose);
		font-weight: 400;
		line-height: 1.65;
		margin: 0 0 var(--sp-5);
		max-width: 66ch;
	}

	.options {
		display: grid;
		gap: var(--sp-3);
	}

	.option {
		display: flex;
		align-items: flex-start;
		gap: var(--sp-3);
		width: 100%;
		text-align: left;
		background: var(--bg-1);
		border: 1px solid var(--border);
		border-radius: var(--r-ctl);
		padding: var(--sp-3) var(--sp-4);
		cursor: pointer;
		transition:
			background var(--dur-1) var(--ease-std),
			border-color var(--dur-1) var(--ease-std);
	}

	.option:hover:not(:disabled) {
		background: var(--bg-2);
		border-color: var(--border-strong);
	}

	.option:disabled {
		cursor: default;
	}

	.option__key {
		font-family: var(--font-mono);
		font-size: var(--fs-label);
		font-weight: 700;
		background: var(--bg-2);
		border: 1px solid var(--border);
		border-radius: 4px;
		width: 22px;
		height: 22px;
		display: grid;
		place-items: center;
		flex: none;
		margin-top: 2px;
	}

	.option__text {
		font-size: var(--fs-small);
		font-weight: 600;
		line-height: 1.5;
		margin-right: auto;
	}

	.option__tail {
		font-family: var(--font-mono);
		font-size: var(--fs-label);
		white-space: nowrap;
		flex: none;
		margin-top: 3px;
	}

	.option.is-selected {
		background: var(--brand-soft);
		border-color: var(--brand);
	}

	.option.is-selected .option__key {
		background: var(--brand);
		border-color: var(--brand);
		color: var(--brand-ink);
	}

	.option.is-correct {
		background: var(--ok-soft);
		border-color: var(--ok);
		opacity: 1;
	}

	.option.is-correct .option__tail {
		color: var(--ok);
	}

	.option.is-incorrect {
		background: var(--err-soft);
		border-color: var(--err);
		opacity: 1;
	}

	.option.is-incorrect .option__tail {
		color: var(--err);
	}

	.option:disabled:not(.is-correct):not(.is-incorrect) {
		opacity: 0.45;
	}

	.reveal {
		margin-top: var(--sp-5);
		padding-top: var(--sp-5);
		border-top: 1px solid var(--border);
	}

	.reveal__verdict {
		margin-bottom: var(--sp-3);
	}

	.reveal__explanation {
		color: var(--text-1);
		margin: 0 0 var(--sp-5);
	}

	.reveal__revise {
		margin-top: var(--sp-4);
		padding-left: 0;
	}

	.runner__controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--sp-3);
		margin-top: var(--sp-4);
	}

	.flagbtn.is-flagged {
		background: var(--flag-soft);
		color: var(--flag-ink);
	}

	.runner__finish {
		margin-top: var(--sp-6);
		padding-top: var(--sp-5);
		border-top: 1px solid var(--border);
	}

	.runner__warn {
		font-size: var(--fs-label);
		color: var(--text-3);
		margin: var(--sp-3) 0 0;
	}

	.runner__keys {
		font-size: var(--fs-label);
		color: var(--text-3);
		margin-top: var(--sp-5);
	}

	kbd {
		font-family: var(--font-mono);
		font-size: 0.9em;
		background: var(--bg-2);
		border: 1px solid var(--border);
		border-radius: 3px;
		padding: 1px 5px;
	}

	.runner__palette {
		position: sticky;
		top: 72px;
	}

	.palette {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(34px, 1fr));
		gap: var(--sp-2);
	}

	.palette__cell {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		font-family: var(--font-mono);
		font-size: var(--fs-label);
		font-variant-numeric: tabular-nums;
		background: var(--bg-1);
		border: 1px solid var(--border);
		border-radius: var(--r-ctl);
		color: var(--text-3);
		cursor: pointer;
		transition:
			background var(--dur-1) var(--ease-std),
			border-color var(--dur-1) var(--ease-std);
	}

	.palette__cell:hover {
		border-color: var(--border-strong);
	}

	.palette__cell.is-answered {
		background: var(--track);
		color: var(--text-1);
	}

	.palette__cell.is-current {
		border: 2px solid var(--brand);
		color: var(--text-1);
	}

	.palette__cell.is-flagged {
		color: var(--flag-ink);
	}

	.palette__flag {
		position: absolute;
		top: 1px;
		right: 2px;
		color: var(--flag);
		line-height: 0;
	}

	@media (max-width: 880px) {
		.runner {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--sp-5);
		}

		.runner__palette {
			position: static;
			order: -1;
		}

		.palette {
			display: flex;
			overflow-x: auto;
			padding-bottom: var(--sp-2);
		}

		.palette li {
			flex: none;
		}

		.palette__cell {
			width: 34px;
		}

		.runner__keys {
			display: none;
		}
	}
</style>
