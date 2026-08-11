import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	attemptQuestions,
	finishAttempt,
	getAttempt,
	optionOrder,
	previousScore
} from '$lib/server/quiz';
import { DOMAIN_BY_ID } from '$lib/data/domains';
import { inDisplayOrder, toDisplay } from '$lib/data/option-index';
import { formatDuration } from '$lib/format';

export const load: PageServerLoad = async ({ params, locals }) => {
	const attempt = getAttempt(locals.profileId, params.id);
	if (!attempt) error(404, 'No such attempt');

	// Finishing is idempotent — landing here directly (e.g. after abandoning a paper)
	// scores whatever was answered rather than 404ing.
	const result = finishAttempt(locals.profileId, attempt);

	// finishAttempt has now stamped finishedAt, whether it landed just now or earlier.
	const elapsed = formatDuration(
		(Date.parse(attempt.finishedAt ?? attempt.startedAt) - Date.parse(attempt.startedAt)) / 1000
	);

	return {
		attempt: { id: attempt.id, mode: attempt.mode, elapsed },
		result,
		previousScore: previousScore(locals.profileId, attempt),
		breakdown: result.breakdown.map((b) => ({ ...b, domain: DOMAIN_BY_ID[b.domain] })),
		// The paper is over, so full rationales are safe to send now. Options stay in
		// the order they were shown, so the review matches what was actually sat.
		review: attemptQuestions(attempt).map(({ question, answer }) => {
			const order = optionOrder(attempt.id, question.id);
			return {
				id: question.id,
				domain: DOMAIN_BY_ID[question.domain],
				stem: question.stem,
				options: inDisplayOrder(order, question.options),
				answer: toDisplay(order, question.answer),
				chosen: answer.chosen === null ? null : toDisplay(order, answer.chosen),
				correct: answer.correct,
				flagged: answer.flagged,
				explanation: question.explanation,
				lesson: question.lesson ?? null
			};
		})
	};
};
