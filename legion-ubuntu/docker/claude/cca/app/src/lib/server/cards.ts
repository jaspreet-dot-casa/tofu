/**
 * Deck building. A session serves everything already due, oldest due first, then tops
 * up with cards this profile has never seen — so review always takes precedence over
 * new material, which is the whole point of scheduling.
 *
 * A caller that threads `states` gets ONE read of `card_reviews` for the deck, the
 * per-domain counts and the interval previews — that is what /cards does, and it is
 * why the interval previews are no longer a query per card. Callers that omit it
 * (the layout's due-count) pay for their own read.
 */

import { CARDS, cardsForDomain, type Card } from '$lib/data/cards';
import { DOMAINS, type DomainId } from '$lib/data/domains';
import { all, get, type SqlRow } from './db';
import { previewIntervals, type CardSchedule, type Grade } from './srs';
import { renderInline } from './content';

/** How many unseen cards to introduce in one session when nothing is due. */
const NEW_CARD_LIMIT = 12;

export interface DeckStats {
	due: number;
	unseen: number;
	total: number;
}

interface StateRow extends SqlRow {
	card_id: string;
	due_at: string;
	interval_days: number;
	ease: number;
}

/** Every schedule state this profile has, keyed by card id. One query. */
export function loadStates(profileId: string): ReadonlyMap<string, CardSchedule> {
	const rows = all<StateRow>(
		'SELECT card_id, due_at, interval_days, ease FROM card_reviews WHERE profile_id = ?',
		profileId
	);
	return new Map(rows.map((r) => [r.card_id, r]));
}

function statsFor(cards: readonly Card[], states: ReadonlyMap<string, CardSchedule>, now: number) {
	let due = 0;
	let unseen = 0;

	for (const card of cards) {
		const state = states.get(card.id);
		if (state === undefined) unseen++;
		else if (new Date(state.due_at).getTime() <= now) due++;
	}

	return { due, unseen, total: cards.length };
}

export function deckStats(
	profileId: string,
	domain?: DomainId,
	states = loadStates(profileId)
): DeckStats {
	return statsFor(domain ? cardsForDomain(domain) : CARDS, states, Date.now());
}

/** `?, ?, …` for every authored card, built once. */
const CARD_ID_PLACEHOLDERS = CARDS.map(() => '?').join(', ');
const CARD_IDS: readonly string[] = CARDS.map((c) => c.id);

/**
 * Just the due count, for the status line that every page renders. Deliberately a
 * COUNT rather than `deckStats(...).due`, which would read every schedule row on
 * every request to answer a single number.
 *
 * The `IN` clause matters: a card retired from the deck files leaves its review row
 * behind, and counting that row would advertise cards `/cards` will never serve.
 */
export function dueCardCount(profileId: string): number {
	const row = get<{ n: number }>(
		`SELECT COUNT(*) AS n FROM card_reviews
		  WHERE profile_id = ? AND due_at <= ? AND card_id IN (${CARD_ID_PLACEHOLDERS})`,
		profileId,
		new Date().toISOString(),
		...CARD_IDS
	);
	return row?.n ?? 0;
}

export interface DeckSummary extends DeckStats {
	domain: DomainId;
}

/** Per-domain counts, computed from one already-loaded state map. */
export function deckSummaries(states: ReadonlyMap<string, CardSchedule>): DeckSummary[] {
	const now = Date.now();
	return DOMAINS.map((d) => ({ domain: d.id, ...statsFor(cardsForDomain(d.id), states, now) }));
}

export interface DeckCard {
	id: string;
	domain: DomainId;
	front: string;
	/** Pre-rendered HTML — card backs carry code spans and emphasis. */
	back: string;
	lesson: string | null;
	intervals: Record<Grade, string>;
}

/**
 * The cards to serve this session. Due cards come first in due order; new cards fill
 * the remainder. Grading "again" makes a card due immediately, and the route re-reads
 * the deck after each grade, so lapsed cards come back around without extra plumbing.
 */
export function buildDeck(
	profileId: string,
	domain?: DomainId,
	limit = 20,
	states = loadStates(profileId)
): DeckCard[] {
	const now = Date.now();
	const pool = domain ? cardsForDomain(domain) : CARDS;

	const due = pool
		.filter((c) => {
			const state = states.get(c.id);
			return state !== undefined && new Date(state.due_at).getTime() <= now;
		})
		.sort(
			(a, b) =>
				new Date(states.get(a.id)!.due_at).getTime() - new Date(states.get(b.id)!.due_at).getTime()
		);

	const selected =
		due.length >= limit
			? due.slice(0, limit)
			: [
					...due,
					...pool
						.filter((c) => !states.has(c.id))
						.slice(0, Math.min(NEW_CARD_LIMIT, limit - due.length))
				];

	return selected.map((card) => ({
		id: card.id,
		domain: card.domain,
		front: card.front,
		back: renderInline(card.back),
		lesson: card.lesson ?? null,
		intervals: previewIntervals(states.get(card.id))
	}));
}
