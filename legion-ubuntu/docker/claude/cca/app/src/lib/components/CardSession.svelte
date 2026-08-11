<script lang="ts">
	/**
	 * One flashcard session over a deck.
	 *
	 * The session queue is client-owned on purpose: grading posts with
	 * `invalidateAll: false`, so the server deck is NOT re-read between cards and a
	 * lapsed card cannot come back on its own. Grading "again" therefore re-queues
	 * the card here — that is what makes "it comes back in the same session" true
	 * rather than merely intended.
	 *
	 * Owning `index`/`flipped`/`queue` in a component is also what lets the parent
	 * reset a session with {#key}: keying a plain markup block would not reset state
	 * declared in the parent's own script.
	 */
	import { untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import { isTypingTarget } from '$lib/keys';
	import type { Grade } from '$lib/types';

	interface DeckCard {
		id: string;
		domain: { code: string; accent: string };
		front: string;
		back: string;
		lesson: string | null;
		intervals: Record<Grade, string>;
	}

	interface Props {
		cards: readonly DeckCard[];
	}

	let { cards }: Props = $props();

	const GRADES = [
		{ id: 'again', label: 'Again', key: '1', accent: 'err' },
		{ id: 'hard', label: 'Hard', key: '2', accent: 'flag' },
		{ id: 'good', label: 'Good', key: '3', accent: 'ok' },
		{ id: 'easy', label: 'Easy', key: '4', accent: 'info' }
	] as const;

	// A one-time copy: this is the session's own queue from here on.
	let queue = $state<DeckCard[]>(untrack(() => [...cards]));
	let index = $state(0);
	let flipped = $state(false);

	const card = $derived(queue[index] ?? null);
	const done = $derived(index >= queue.length);

	let gradesEl = $state<HTMLElement | null>(null);

	/** Grade buttons are real submit buttons, so grading is just clicking one. */
	function grade(position: number) {
		if (!flipped) return;
		gradesEl?.querySelectorAll('button')[position]?.click();
	}

	function onKey(event: KeyboardEvent) {
		if (isTypingTarget(event) || done) return;

		if (event.key === ' ' || event.key === 'Enter') {
			flipped = !flipped;
			event.preventDefault();
		} else if (flipped && '1234'.includes(event.key)) {
			grade(Number(event.key) - 1);
			event.preventDefault();
		}
	}
</script>

<svelte:window onkeydown={onKey} />

{#if done}
	<div class="card empty">
		<h2>Deck clear.</h2>
		<p>
			Nothing else is due right now. Cards resurface on their own schedule — come back tomorrow, or
			drill some questions instead.
		</p>
		<div class="actions" style="justify-content: center">
			<a class="btn btn--primary" href="/quiz">Run a drill</a>
			<a class="btn btn--ghost" href="/">Back to readiness</a>
		</div>
	</div>
{:else if card}
	<p class="counter mono">Card {index + 1} / {queue.length}</p>

	<div class="flashcard" class:is-flipped={flipped}>
		<button
			class="flashcard__inner"
			type="button"
			onclick={() => (flipped = !flipped)}
			aria-label={flipped ? 'Show prompt' : 'Show answer'}
		>
			<div class="face face--front">
				<p class="face__eyebrow eyebrow">
					<span class="chip chip--{card.domain.accent}">{card.domain.code}</span> Prompt
				</p>
				<p class="face__body">{card.front}</p>
				<p class="face__hint mono">Space to flip</p>
			</div>
			<div class="face face--back">
				<p class="face__eyebrow eyebrow">Answer</p>
				<!-- Rendered server-side by lib/server/cards.ts with the app's markdown-it. -->
				<p class="face__body">{@html card.back}</p>
			</div>
		</button>
	</div>

	<form
		method="POST"
		action="?/grade"
		use:enhance={({ formData }) => {
			// "Again" means not learned — put it back at the end of this session.
			const graded = formData.get('grade') === 'again' ? card : null;
			const requeuedAt = graded ? queue.push({ ...graded }) - 1 : -1;

			index += 1;
			flipped = false;

			return async ({ update, result }) => {
				// Its interval hints were computed from the pre-grade schedule, so they do
				// not yet carry the ease penalty. The action returns the refreshed set.
				if (graded && result.type === 'success') {
					const payload = result.data as { intervals?: Record<Grade, string> } | undefined;
					if (payload?.intervals) {
						queue[requeuedAt] = { ...graded, intervals: payload.intervals };
					}
				}
				await update({ reset: false, invalidateAll: false });
			};
		}}
	>
		<input type="hidden" name="cardId" value={card.id} />
		<div class="grades" aria-hidden={!flipped} bind:this={gradesEl}>
			{#each GRADES as g (g.id)}
				<button
					class="btn btn--secondary grade grade--{g.accent}"
					type="submit"
					name="grade"
					value={g.id}
					disabled={!flipped}
				>
					<span class="grade__label">{g.label}</span>
					<span class="grade__interval mono">{card.intervals[g.id]}</span>
					<span class="grade__key mono">{g.key}</span>
				</button>
			{/each}
		</div>
	</form>

	{#if !flipped}
		<p class="hint mono">Grade buttons unlock once you have seen the answer.</p>
	{:else if card.lesson}
		<p class="hint"><a href="/learn/{card.lesson}">Read the chapter this came from →</a></p>
	{/if}
{/if}

<style>
	.counter {
		font-size: var(--fs-label);
		color: var(--text-3);
		text-align: center;
		margin: 0;
	}

	.flashcard {
		max-width: 560px;
		margin: 0 auto;
		perspective: 1200px;
	}

	.flashcard__inner {
		position: relative;
		display: block;
		width: 100%;
		min-height: 320px;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		transform-style: preserve-3d;
		transition: transform var(--dur-3) var(--ease-pop);
		text-align: left;
	}

	.flashcard.is-flipped .flashcard__inner {
		transform: rotateY(180deg);
	}

	.face {
		position: absolute;
		inset: 0;
		backface-visibility: hidden;
		background: var(--bg-1);
		border: 1px solid var(--border);
		border-radius: var(--r-card);
		box-shadow: var(--shadow-1);
		padding: var(--sp-6);
		display: flex;
		flex-direction: column;
	}

	.face--back {
		transform: rotateY(180deg);
	}

	.face__eyebrow {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		margin-bottom: var(--sp-5);
	}

	.face__body {
		font-family: var(--font-prose);
		font-size: var(--fs-prose);
		font-weight: 400;
		line-height: 1.65;
		color: var(--text-1);
		margin: 0;
		flex: 1;
	}

	.face__hint {
		font-size: var(--fs-label);
		color: var(--text-3);
		margin: var(--sp-4) 0 0;
	}

	.grades {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--sp-3);
		max-width: 560px;
		margin: var(--sp-5) auto 0;
		transition: opacity var(--dur-1) var(--ease-std);
	}

	.grades[aria-hidden='true'] {
		opacity: 0.4;
	}

	.grade {
		flex-direction: column;
		gap: 2px;
		padding: var(--sp-3) var(--sp-2);
		border-top-width: 3px;
	}

	.grade--err {
		border-top-color: var(--err);
	}
	.grade--flag {
		border-top-color: var(--flag);
	}
	.grade--ok {
		border-top-color: var(--ok);
	}
	.grade--info {
		border-top-color: var(--info);
	}

	.grade__label {
		font-size: var(--fs-small);
	}

	.grade__interval {
		font-size: var(--fs-label);
		color: var(--text-3);
	}

	.grade__key {
		font-size: 10px;
		color: var(--text-3);
	}

	.hint {
		text-align: center;
		font-size: var(--fs-label);
		color: var(--text-3);
		margin: var(--sp-4) 0 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.flashcard__inner {
			transform-style: flat;
		}
		.flashcard.is-flipped .flashcard__inner {
			transform: none;
		}
		.face--back {
			transform: none;
			opacity: 0;
			pointer-events: none;
		}
		.flashcard.is-flipped .face--front {
			opacity: 0;
		}
		.flashcard.is-flipped .face--back {
			opacity: 1;
			pointer-events: auto;
		}
	}

	@media (max-width: 560px) {
		.grades {
			grid-template-columns: repeat(2, 1fr);
		}
		.face {
			padding: var(--sp-5);
		}
	}
</style>
