/**
 * Quiz attempts.
 *
 * A mock draws four scenarios out of six and asks a weighted slice of each, matching
 * the real exam's shape. The chosen question ids are frozen into the attempt row at
 * start, so a reload mid-exam resumes the same paper rather than reshuffling it.
 *
 * Storage rows never leave this module. Callers get domain types: camelCase, real
 * booleans, parsed ids, and option indices branded with which order they refer to.
 */

import { randomUUID } from 'node:crypto';
import { DOMAIN_BY_ID, EXAM, domainCeiling, type DomainId } from '$lib/data/domains';
import { SCENARIOS, type ScenarioId } from '$lib/data/scenarios';
import {
	OPTION_COUNT,
	asOriginal,
	toOriginal,
	type DisplayIndex,
	type OptionOrder,
	type OriginalIndex
} from '$lib/data/option-index';
import {
	QUESTION_BY_ID,
	QUESTIONS,
	questionsForDomain,
	questionsForScenario,
	type Question
} from '$lib/data/questions';
import { all, get, run, tx, type SqlRow } from './db';
import { recordActivity } from './progress';
import { scaleScore } from './readiness';

import type { AttemptSummary, DomainBreakdown, QuizMode } from '$lib/types';

/** What kind of paper to build. A sum type, because the targets are not interchangeable. */
export type QuizSpec =
	| { mode: 'mock' }
	| { mode: 'domain'; domain: DomainId; limit?: number }
	| { mode: 'scenario'; scenario: ScenarioId; limit?: number };

export interface Attempt {
	id: string;
	mode: QuizMode;
	/** Domain or scenario id, null for a mock. */
	target: string | null;
	questionIds: string[];
	startedAt: string;
	/** Mock mode only — drill mode has no clock. */
	deadlineAt: string | null;
	finishedAt: string | null;
	scaledScore: number | null;
	passed: boolean | null;
}

export interface Answer {
	questionId: string;
	domain: DomainId;
	/** Index into the AUTHORED options, or null while unanswered. */
	chosen: OriginalIndex | null;
	correct: boolean;
	flagged: boolean;
	answeredAt: string | null;
}

// ── Row decoding ────────────────────────────────────────────────────────────────

interface AttemptRow extends SqlRow {
	id: string;
	mode: string;
	target: string | null;
	question_ids: string;
	started_at: string;
	deadline_at: string | null;
	finished_at: string | null;
	scaled_score: number | null;
	passed: number | null;
}

interface AnswerRow extends SqlRow {
	question_id: string;
	domain: string;
	chosen: number | null;
	correct: number;
	flagged: number;
	answered_at: string | null;
}

function decodeAttempt(row: AttemptRow): Attempt {
	return {
		id: row.id,
		mode: row.mode as QuizMode,
		target: row.target,
		questionIds: JSON.parse(row.question_ids) as string[],
		startedAt: row.started_at,
		deadlineAt: row.deadline_at,
		finishedAt: row.finished_at,
		scaledScore: row.scaled_score,
		passed: row.passed === null ? null : row.passed === 1
	};
}

function decodeAnswer(row: AnswerRow): Answer {
	return {
		questionId: row.question_id,
		domain: row.domain as DomainId,
		chosen: row.chosen === null ? null : asOriginal(row.chosen),
		correct: row.correct === 1,
		flagged: row.flagged === 1,
		answeredAt: row.answered_at
	};
}

// ── Option order ────────────────────────────────────────────────────────────────

/**
 * The bank is authored with the correct answer first, which would make every answer
 * "A" if served verbatim. Options are permuted per (attempt, question) —
 * deterministically, so a reload shows the same paper, and without extra storage.
 *
 * The database always stores the ORIGINAL index, so answers stay meaningful even if
 * this permutation ever changes.
 */
function hash(value: string): number {
	let h = 2166136261;
	for (let i = 0; i < value.length; i++) {
		h ^= value.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}

export function optionOrder(attemptId: string, questionId: string): OptionOrder {
	// Declared as the tuple it is, so branding needs one cast rather than a
	// structure-erasing `as unknown as`.
	const order: [OriginalIndex, OriginalIndex, OriginalIndex, OriginalIndex] = [
		asOriginal(0),
		asOriginal(1),
		asOriginal(2),
		asOriginal(3)
	];
	let seed = hash(`${attemptId}:${questionId}`);

	for (let i = OPTION_COUNT - 1; i > 0; i--) {
		seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
		// Take the HIGH bits: an LCG's low bits have short periods, and `seed % 4`
		// visibly biases the correct answer toward one position.
		const j = Math.floor((seed / 0x100000000) * (i + 1));
		const a = order[i] as OriginalIndex;
		const b = order[j] as OriginalIndex;
		order[i] = b;
		order[j] = a;
	}

	return order;
}

// ── Paper construction ──────────────────────────────────────────────────────────

/** Fisher-Yates. Deliberately not seeded — every attempt should be a fresh draw. */
function shuffle<T>(items: readonly T[]): T[] {
	const copy = [...items];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
	}
	return copy;
}

function take<T>(items: readonly T[], n: number): T[] {
	return shuffle(items).slice(0, n);
}

/**
 * Builds a mock paper: four scenarios drawn at random, each contributing its share of
 * the 60 questions. If a scenario is short of questions the remainder is topped up
 * from the rest of the bank so the paper still reaches full length.
 */
function buildMock(): Question[] {
	const drawn = take(SCENARIOS, EXAM.scenariosDrawn);
	const perScenario = Math.floor(EXAM.questionCount / EXAM.scenariosDrawn);

	const picked: Question[] = [];
	for (const scenario of drawn) {
		picked.push(...take(questionsForScenario(scenario.id), perScenario));
	}

	if (picked.length < EXAM.questionCount) {
		const used = new Set(picked.map((q) => q.id));
		picked.push(
			...take(
				QUESTIONS.filter((q) => !used.has(q.id)),
				EXAM.questionCount - picked.length
			)
		);
	}

	return shuffle(picked);
}

function buildPaper(spec: QuizSpec): Question[] {
	switch (spec.mode) {
		case 'mock':
			return buildMock();
		case 'domain': {
			const pool = shuffle(questionsForDomain(spec.domain));
			return spec.limit ? pool.slice(0, spec.limit) : pool;
		}
		case 'scenario': {
			const pool = shuffle(questionsForScenario(spec.scenario));
			return spec.limit ? pool.slice(0, spec.limit) : pool;
		}
	}
}

function specTarget(spec: QuizSpec): string | null {
	switch (spec.mode) {
		case 'mock':
			return null;
		case 'domain':
			return spec.domain;
		case 'scenario':
			return spec.scenario;
	}
}

export function startAttempt(profileId: string, spec: QuizSpec): string {
	const questions = buildPaper(spec);
	if (questions.length === 0) {
		throw new Error(`no questions available for ${spec.mode}`);
	}

	const id = randomUUID();
	const now = new Date();
	const deadline =
		spec.mode === 'mock' ? new Date(now.getTime() + EXAM.minutes * 60 * 1000).toISOString() : null;

	tx(() => {
		run(
			`INSERT INTO quiz_attempts (id, profile_id, mode, target, question_ids, started_at, deadline_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`,
			id,
			profileId,
			spec.mode,
			specTarget(spec),
			JSON.stringify(questions.map((q) => q.id)),
			now.toISOString(),
			deadline
		);

		for (const q of questions) {
			run(
				'INSERT INTO quiz_answers (attempt_id, question_id, domain) VALUES (?, ?, ?)',
				id,
				q.id,
				q.domain
			);
		}
	});

	return id;
}

// ── Reading ─────────────────────────────────────────────────────────────────────

export function getAttempt(profileId: string, attemptId: string): Attempt | undefined {
	const row = get<AttemptRow>(
		'SELECT * FROM quiz_attempts WHERE id = ? AND profile_id = ?',
		attemptId,
		profileId
	);
	return row && decodeAttempt(row);
}

/**
 * What the dashboard and the practice page both show for a finished paper. Lives here
 * rather than being mapped identically in two route files.
 */
function summarise(attempt: Attempt): AttemptSummary {
	return {
		id: attempt.id,
		mode: attempt.mode,
		label: attempt.mode === 'mock' ? 'Mock exam' : `${attempt.mode} drill`,
		score: attempt.scaledScore,
		passed: attempt.passed === true
	};
}

export function attemptSummaries(profileId: string, limit = 10): AttemptSummary[] {
	return recentAttempts(profileId, limit).map(summarise);
}

export function openAttemptSummary(profileId: string): AttemptSummary | null {
	const open = openAttempt(profileId);
	return open ? summarise(open) : null;
}

function getAnswers(attemptId: string): Answer[] {
	return all<AnswerRow>('SELECT * FROM quiz_answers WHERE attempt_id = ?', attemptId).map(
		decodeAnswer
	);
}

/** Attempt questions in their frozen order, paired with the current answer state. */
export function attemptQuestions(attempt: Attempt): { question: Question; answer: Answer }[] {
	const answers = new Map(getAnswers(attempt.id).map((a) => [a.questionId, a]));

	return attempt.questionIds.flatMap((id) => {
		const question = QUESTION_BY_ID.get(id);
		const answer = answers.get(id);
		// A question removed from the bank after an attempt started simply drops out
		// rather than breaking the paper.
		return question && answer ? [{ question, answer }] : [];
	});
}

// ── Writing ─────────────────────────────────────────────────────────────────────

/** True once a mock's 120 minutes are up. Drills have no deadline and never expire. */
export function isExpired(attempt: Attempt, now = Date.now()): boolean {
	return attempt.deadlineAt !== null && now > Date.parse(attempt.deadlineAt);
}

export type AnswerRejection = 'finished' | 'expired' | 'not-on-paper';

/**
 * Recording is a success/rejection union rather than a bare boolean: a rejected
 * answer used to be indistinguishable from a wrong one, and the caller went on to
 * hand back the full reveal for a question that was never on the paper.
 */
export type AnswerOutcome =
	| { recorded: true; correct: boolean }
	| { recorded: false; reason: AnswerRejection };

/** `chosen` is the index the candidate clicked, in the order they were shown. */
export function recordAnswer(
	attempt: Attempt,
	profileId: string,
	questionId: string,
	chosen: DisplayIndex
): AnswerOutcome {
	if (attempt.finishedAt) return { recorded: false, reason: 'finished' };

	// The clock is enforced here, not only by the runner's countdown — otherwise a
	// replayed POST (or a browser with JS off) sits a timed mock at full credit.
	if (isExpired(attempt)) return { recorded: false, reason: 'expired' };

	// Membership in THIS paper, not merely in the bank. Without it, posting any bank
	// question id returned its correct index and every rationale while the UPDATE
	// quietly matched zero rows.
	if (!attempt.questionIds.includes(questionId)) {
		return { recorded: false, reason: 'not-on-paper' };
	}

	const question = QUESTION_BY_ID.get(questionId);
	if (!question) return { recorded: false, reason: 'not-on-paper' };

	const original = toOriginal(optionOrder(attempt.id, questionId), chosen);
	const correct = original === question.answer;

	const previous = get<AnswerRow>(
		'SELECT * FROM quiz_answers WHERE attempt_id = ? AND question_id = ?',
		attempt.id,
		questionId
	);

	run(
		'UPDATE quiz_answers SET chosen = ?, correct = ?, answered_at = ? WHERE attempt_id = ? AND question_id = ?',
		original,
		correct ? 1 : 0,
		new Date().toISOString(),
		attempt.id,
		questionId
	);

	// Count each question once toward daily activity, however many times it is changed.
	if (previous && previous.answered_at === null) recordActivity(profileId, 'questions');

	return { recorded: true, correct };
}

export function setFlag(attempt: Attempt, questionId: string, flagged: boolean): void {
	if (attempt.finishedAt || isExpired(attempt)) return;

	run(
		'UPDATE quiz_answers SET flagged = ? WHERE attempt_id = ? AND question_id = ?',
		flagged ? 1 : 0,
		attempt.id,
		questionId
	);
}

// ── Scoring ─────────────────────────────────────────────────────────────────────

export interface AttemptResult {
	score: number;
	passed: boolean;
	correct: number;
	total: number;
	breakdown: DomainBreakdown[];
}

export function finishAttempt(profileId: string, attempt: Attempt): AttemptResult {
	const answers = getAnswers(attempt.id);
	const byDomain = new Map<DomainId, { correct: number; total: number }>();

	for (const answer of answers) {
		const tally = byDomain.get(answer.domain) ?? { correct: 0, total: 0 };
		tally.total += 1;
		if (answer.correct) tally.correct += 1;
		byDomain.set(answer.domain, tally);
	}

	const score = scaleScore(byDomain);
	const passed = score >= EXAM.passScore;

	if (!attempt.finishedAt) {
		const finishedAt = new Date().toISOString();
		run(
			'UPDATE quiz_attempts SET finished_at = ?, scaled_score = ?, passed = ? WHERE id = ? AND profile_id = ?',
			finishedAt,
			score,
			passed ? 1 : 0,
			attempt.id,
			profileId
		);

		// Bring the caller's copy in line with the row we just wrote — anything reading
		// `attempt` after this (elapsed time, the previous-score lookup) would otherwise
		// still see an unfinished paper and have to guess.
		attempt.finishedAt = finishedAt;
		attempt.scaledScore = score;
		attempt.passed = passed;
	}

	return {
		score,
		passed,
		correct: answers.filter((a) => a.correct).length,
		total: answers.length,
		breakdown: [...byDomain.entries()].map(([domain, tally]) => ({
			domain,
			...tally,
			...domainPoints(domain, tally)
		}))
	};
}

function domainPoints(
	domain: DomainId,
	tally: { correct: number; total: number }
): { points: number; ceiling: number } {
	const ceiling = domainCeiling(DOMAIN_BY_ID[domain]);
	const ratio = tally.total > 0 ? tally.correct / tally.total : 0;
	return { points: Math.round(ratio * ceiling), ceiling };
}

export function recentAttempts(profileId: string, limit = 10): Attempt[] {
	return all<AttemptRow>(
		`SELECT * FROM quiz_attempts
		  WHERE profile_id = ? AND finished_at IS NOT NULL
		  ORDER BY finished_at DESC LIMIT ?`,
		profileId,
		limit
	).map(decodeAttempt);
}

/**
 * The score of the same-mode paper sat immediately BEFORE this one, for the result
 * screen's delta chip.
 *
 * Anchored on `finished_at < this attempt's`, not "the most recent other attempt":
 * opening an older result from the history list used to compare it against a paper
 * sat after it, and the comparison vanished entirely once ten newer attempts existed.
 */
export function previousScore(profileId: string, attempt: Attempt): number | null {
	if (attempt.finishedAt === null) return null;

	const row = get<{ scaled_score: number | null }>(
		`SELECT scaled_score FROM quiz_attempts
		  WHERE profile_id = ? AND mode = ? AND finished_at IS NOT NULL AND finished_at < ?
		  ORDER BY finished_at DESC LIMIT 1`,
		profileId,
		attempt.mode,
		attempt.finishedAt
	);
	return row?.scaled_score ?? null;
}

/** An unfinished attempt, so the dashboard can offer to resume rather than restart. */
export function openAttempt(profileId: string): Attempt | undefined {
	const row = get<AttemptRow>(
		`SELECT * FROM quiz_attempts
		  WHERE profile_id = ? AND finished_at IS NULL
		  ORDER BY started_at DESC LIMIT 1`,
		profileId
	);
	return row && decodeAttempt(row);
}
