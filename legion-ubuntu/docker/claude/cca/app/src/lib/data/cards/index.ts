/**
 * Flashcard decks, one module per domain. These carry the high-density recall items —
 * the numbers, flags, field names and precedence rules that scenario reasoning cannot
 * rescue you from if you simply do not know them.
 */

import type { DomainId } from '../domains';

import { d1Cards } from './d1';
import { d2Cards } from './d2';
import { d3Cards } from './d3';
import { d4Cards } from './d4';
import { d5Cards } from './d5';

export interface Card {
	id: string;
	domain: DomainId;
	front: string;
	back: string;
	/** Lesson slug to revise if the card keeps lapsing. */
	lesson?: string;
}

export function defineCards(domain: DomainId, cards: readonly Omit<Card, 'domain'>[]): Card[] {
	const seen = new Set<string>();
	return cards.map((c) => {
		if (seen.has(c.id)) throw new Error(`duplicate card id "${c.id}" in ${domain}`);
		seen.add(c.id);
		return { ...c, domain };
	});
}

export const CARDS: readonly Card[] = [...d1Cards, ...d2Cards, ...d3Cards, ...d4Cards, ...d5Cards];

export const CARD_BY_ID: ReadonlyMap<string, Card> = new Map(CARDS.map((c) => [c.id, c]));

const BY_DOMAIN: ReadonlyMap<DomainId, readonly Card[]> = (() => {
	const groups = new Map<DomainId, Card[]>();
	for (const card of CARDS) {
		const bucket = groups.get(card.domain);
		if (bucket) bucket.push(card);
		else groups.set(card.domain, [card]);
	}
	return groups;
})();

export function cardsForDomain(domain: DomainId): readonly Card[] {
	return BY_DOMAIN.get(domain) ?? [];
}
