/**
 * Spaced repetition — SM-2, trimmed to the four grades the UI exposes.
 *
 * "Again" sets the interval back to zero and marks the card due immediately.
 * Note that being due is not by itself what brings it back before tomorrow — the
 * deck is not re-read mid-session, so CardSession.svelte re-queues a lapsed card
 * client-side. Everything else pushes the due date out by a multiple of the card's
 * ease, which drifts up when a card is easy and down when it keeps catching you out.
 */

import { get, run, type SqlRow } from './db';
import { GRADES, type Grade } from '$lib/types';

export { GRADES, type Grade };

export function isGrade(value: string): value is Grade {
	return (GRADES as readonly string[]).includes(value);
}

const MIN_EASE = 1.3;
const MAX_EASE = 3.0;

/** The part of a card's schedule that determines the next interval. */
export interface CardSchedule {
	due_at: string;
	interval_days: number;
	ease: number;
}

/** Full stored state, decoded into domain terms. */
export interface CardState extends CardSchedule {
	cardId: string;
	reps: number;
	lapses: number;
	lastGrade: Grade | null;
	lastReviewed: string | null;
}

interface CardRow extends SqlRow {
	card_id: string;
	due_at: string;
	interval_days: number;
	ease: number;
	reps: number;
	lapses: number;
	last_grade: string | null;
	last_reviewed: string | null;
}

function decode(row: CardRow): CardState {
	return {
		cardId: row.card_id,
		due_at: row.due_at,
		interval_days: row.interval_days,
		ease: row.ease,
		reps: row.reps,
		lapses: row.lapses,
		lastGrade: row.last_grade !== null && isGrade(row.last_grade) ? row.last_grade : null,
		lastReviewed: row.last_reviewed
	};
}

function clampEase(ease: number): number {
	return Math.min(MAX_EASE, Math.max(MIN_EASE, ease));
}

export interface Scheduled {
	intervalDays: number;
	ease: number;
	dueAt: Date;
	lapsed: boolean;
}

/** The starting point for a card that has never been reviewed. */
const FRESH = { interval_days: 0, ease: 2.5 } as const;

export function schedule(
	state: Pick<CardSchedule, 'interval_days' | 'ease'>,
	grade: Grade
): Scheduled {
	const current = state.interval_days;
	let ease = state.ease;
	let interval: number;
	let lapsed = false;

	switch (grade) {
		case 'again':
			ease = clampEase(ease - 0.2);
			interval = 0;
			lapsed = true;
			break;
		case 'hard':
			ease = clampEase(ease - 0.15);
			interval = current === 0 ? 0.5 : Math.max(0.5, current * 1.2);
			break;
		case 'good':
			interval = current === 0 ? 1 : current * ease;
			break;
		case 'easy':
			ease = clampEase(ease + 0.15);
			interval = current === 0 ? 3 : current * ease * 1.3;
			break;
	}

	interval = Math.round(interval * 100) / 100;

	return { intervalDays: interval, ease, dueAt: new Date(Date.now() + interval * 86_400_000), lapsed };
}

export function getCardState(profileId: string, cardId: string): CardState | undefined {
	const row = get<CardRow>(
		'SELECT * FROM card_reviews WHERE profile_id = ? AND card_id = ?',
		profileId,
		cardId
	);
	return row && decode(row);
}

export function reviewCard(profileId: string, cardId: string, grade: Grade): Scheduled {
	const existing = getCardState(profileId, cardId);
	const next = schedule(existing ?? FRESH, grade);
	const now = new Date().toISOString();

	run(
		`INSERT INTO card_reviews
		   (profile_id, card_id, due_at, interval_days, ease, reps, lapses, last_grade, last_reviewed)
		 VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
		 ON CONFLICT(profile_id, card_id) DO UPDATE SET
		   due_at        = excluded.due_at,
		   interval_days = excluded.interval_days,
		   ease          = excluded.ease,
		   reps          = card_reviews.reps + 1,
		   lapses        = card_reviews.lapses + ?,
		   last_grade    = excluded.last_grade,
		   last_reviewed = excluded.last_reviewed`,
		profileId,
		cardId,
		next.dueAt.toISOString(),
		next.intervalDays,
		next.ease,
		next.lapsed ? 1 : 0,
		grade,
		now,
		next.lapsed ? 1 : 0
	);

	return next;
}

/** Human-readable interval hint shown on the grade buttons, e.g. "8m", "3d", "2mo". */
export function formatInterval(days: number): string {
	if (days <= 0) return '<1m';
	if (days < 1 / 24) return `${Math.round(days * 24 * 60)}m`;
	if (days < 1) return `${Math.round(days * 24)}h`;
	if (days < 30) return `${Math.round(days)}d`;
	if (days < 365) return `${Math.round(days / 30)}mo`;
	return `${(days / 365).toFixed(1)}y`;
}

/** The interval each grade would produce, for the hints under the grade buttons. */
export function previewIntervals(
	state: Pick<CardSchedule, 'interval_days' | 'ease'> | undefined
): Record<Grade, string> {
	const base = state ?? FRESH;
	return Object.fromEntries(
		GRADES.map((g) => [g, formatInterval(schedule(base, g).intervalDays)])
	) as Record<Grade, string>;
}
