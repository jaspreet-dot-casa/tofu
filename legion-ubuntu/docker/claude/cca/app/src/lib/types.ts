/**
 * View contracts — the shapes that cross the server/client boundary.
 *
 * These live outside `$lib/server` deliberately. A component's public interface
 * should not be owned by a module the component must never import at runtime; the
 * server modules produce these types, the components consume them, and neither
 * depends on the other.
 */

import type { Domain } from './data/domains';

export interface TocEntry {
	id: string;
	text: string;
	level: number;
}

export interface ActivityDay {
	day: string;
	lessons: number;
	active: boolean;
}

/**
 * How far through a set of lessons the reader is. Used at three scales — one domain,
 * the orientation track, and the curriculum as a whole — so it carries counts rather
 * than a percentage, and lets the view decide how to render them.
 */
export interface Completion {
	done: number;
	total: number;
	/** 0–100, rounded. Zero when there is nothing to complete. */
	percent: number;
}

/** A domain's row in the progress panel. */
export interface DomainProgress extends Completion {
	domain: Domain;
}
