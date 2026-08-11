/**
 * View contracts — the shapes that cross the server/client boundary.
 *
 * These live outside `$lib/server` deliberately. A component's public interface
 * should not be owned by a module the component must never import at runtime; the
 * server modules produce these types, the components consume them, and neither
 * depends on the other.
 */

import type { Domain, DomainId } from './data/domains';

/** One segment of the Score Rail: what a domain contributes and what it could. */
export interface RailSegment {
	domain: Domain;
	points: number;
	ceiling: number;
}

export interface TocEntry {
	id: string;
	text: string;
	level: number;
}

export interface ActivityDay {
	day: string;
	lessons: number;
	questions: number;
	cards: number;
	active: boolean;
}

export type QuizMode = 'mock' | 'domain' | 'scenario';

/** The four spaced-repetition grades, in the order the UI lists them. */
export const GRADES = ['again', 'hard', 'good', 'easy'] as const;

export type Grade = (typeof GRADES)[number];

/** A finished paper, as the dashboard and practice pages list it. */
export interface AttemptSummary {
	id: string;
	mode: QuizMode;
	label: string;
	score: number | null;
	passed: boolean;
}

/** Per-domain result of one attempt. */
export interface DomainBreakdown {
	domain: DomainId;
	correct: number;
	total: number;
	points: number;
	ceiling: number;
}
