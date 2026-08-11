/**
 * Readiness scoring.
 *
 * The number reported is deliberately on the exam's own 100–1000 scale, so "682" here
 * means the same thing it will mean on results day: 38 points short of the line.
 *
 * Per domain:  0.4 x lesson completion  +  0.6 x accuracy over recent answers
 * Overall:     100 + sum of each domain's rounded points, where a domain's points
 *              are round(proficiency_d x its share of the 900). Rounding per domain
 *              rather than once at the end keeps the rail's segments summing exactly
 *              to the headline number.
 *
 * Domains you have not touched score zero rather than being excluded, which makes the
 * headline number pessimistic until every domain has actually been drilled. That is
 * the correct bias for a readiness instrument: it should not tell you that you are
 * ready because you only studied the easy third.
 */

import {
	DOMAINS,
	PASS_SCORE,
	SCORE_FLOOR,
	SCORE_RANGE,
	domainCeiling,
	type Domain,
	type DomainId
} from '$lib/data/domains';
import { all, type SqlRow } from './db';
import { lessonsForTrack } from './content';
import { completedLessonIds } from './progress';
import { percent } from '$lib/format';

/** How many recent answers per domain feed the accuracy term. */
const ACCURACY_WINDOW = 20;

const LESSON_WEIGHT = 0.4;
const ACCURACY_WEIGHT = 0.6;

export interface DomainReadiness {
	domain: Domain;
	/** 0–1. */
	proficiency: number;
	lessonsCompleted: number;
	lessonsTotal: number;
	questionsAnswered: number;
	questionsCorrect: number;
	/** Recent accuracy as a percentage, or null when nothing has been drilled yet. */
	accuracy: number | null;
	/** Scaled points this domain currently contributes. */
	points: number;
	/** The most points it could ever contribute — the bracket tick on the score rail. */
	ceiling: number;
}

export interface Readiness {
	score: number;
	passed: boolean;
	/** Signed distance to 720; negative means short. */
	delta: number;
	domains: DomainReadiness[];
	/** Lowest-proficiency domain that still has points on the table, or null if perfect. */
	weakest: Domain | null;
}

interface RecentRow extends SqlRow {
	domain: string;
	correct: number;
}

/**
 * The most recent N answers per domain, in one query rather than one per domain.
 * A window function does the per-domain limit that five separate `LIMIT` queries
 * were doing before.
 */
function recentAccuracy(profileId: string): Map<DomainId, { answered: number; correct: number }> {
	const rows = all<RecentRow>(
		`SELECT domain, correct FROM (
		   SELECT a.domain,
		          a.correct,
		          ROW_NUMBER() OVER (PARTITION BY a.domain ORDER BY a.answered_at DESC) AS rn
		     FROM quiz_answers a
		     JOIN quiz_attempts t ON t.id = a.attempt_id
		    WHERE t.profile_id = ? AND a.answered_at IS NOT NULL
		 ) WHERE rn <= ?`,
		profileId,
		ACCURACY_WINDOW
	);

	const tally = new Map<DomainId, { answered: number; correct: number }>();
	for (const row of rows) {
		const domain = row.domain as DomainId;
		const entry = tally.get(domain) ?? { answered: 0, correct: 0 };
		entry.answered += 1;
		if (row.correct === 1) entry.correct += 1;
		tally.set(domain, entry);
	}
	return tally;
}

/**
 * `completed` is accepted so callers that already loaded lesson progress do not pay
 * for a second identical query.
 */
export function computeReadiness(profileId: string, completed?: ReadonlySet<string>): Readiness {
	const done = completed ?? completedLessonIds(profileId);
	const accuracy = recentAccuracy(profileId);

	const domains: DomainReadiness[] = DOMAINS.map((domain) => {
		const lessons = lessonsForTrack(domain.id);
		const lessonsCompleted = lessons.filter((l) => done.has(l.id)).length;
		const recent = accuracy.get(domain.id) ?? { answered: 0, correct: 0 };

		const lessonTerm = lessons.length > 0 ? lessonsCompleted / lessons.length : 0;
		const accuracyTerm = recent.answered > 0 ? recent.correct / recent.answered : 0;

		const proficiency = LESSON_WEIGHT * lessonTerm + ACCURACY_WEIGHT * accuracyTerm;
		const ceiling = domainCeiling(domain);

		return {
			domain,
			proficiency,
			lessonsCompleted,
			lessonsTotal: lessons.length,
			questionsAnswered: recent.answered,
			questionsCorrect: recent.correct,
			accuracy: recent.answered > 0 ? percent(recent.correct, recent.answered) : null,
			points: Math.round(proficiency * ceiling),
			ceiling
		};
	});

	const score = SCORE_FLOOR + domains.reduce((sum, d) => sum + d.points, 0);

	const improvable = domains.filter((d) => d.proficiency < 1);
	const weakest =
		improvable.length > 0
			? improvable.reduce((lowest, d) => (d.proficiency < lowest.proficiency ? d : lowest)).domain
			: null;

	return {
		score,
		passed: score >= PASS_SCORE,
		delta: score - PASS_SCORE,
		domains,
		weakest
	};
}

/**
 * Scales a raw quiz result onto 100–1000, weighting each domain by its exam share so a
 * mock score is comparable to the readiness number. Domains absent from the attempt
 * are excluded and the remaining weights are renormalised — a D4-only drill should be
 * scored out of D4, not penalised for the four domains it never asked about.
 */
export function scaleScore(byDomain: ReadonlyMap<DomainId, { correct: number; total: number }>): number {
	let weightSum = 0;
	let earned = 0;

	for (const domain of DOMAINS) {
		const tally = byDomain.get(domain.id);
		if (!tally || tally.total === 0) continue;

		weightSum += domain.weight;
		earned += domain.weight * (tally.correct / tally.total);
	}

	if (weightSum === 0) return SCORE_FLOOR;

	return Math.round(SCORE_FLOOR + SCORE_RANGE * (earned / weightSum));
}
