import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	attemptQuestions,
	finishAttempt,
	getAttempt,
	optionOrder,
	recordAnswer,
	setFlag
} from '$lib/server/quiz';
import { QUESTION_BY_ID } from '$lib/data/questions';
import { DOMAIN_BY_ID } from '$lib/data/domains';
import { SCENARIO_BY_ID } from '$lib/data/scenarios';
import { inDisplayOrder, parseDisplayIndex, toDisplay } from '$lib/data/option-index';
import { boolField, stringField } from '$lib/server/form';

export const load: PageServerLoad = async ({ params, locals }) => {
	const attempt = getAttempt(locals.profileId, params.id);
	if (!attempt) error(404, 'No such attempt');
	if (attempt.finishedAt) redirect(303, `/quiz/${attempt.id}/result`);

	return {
		attempt: {
			id: attempt.id,
			mode: attempt.mode,
			deadlineAt: attempt.deadlineAt
		},
		// Answers and rationales are deliberately withheld here — they come back from
		// the `answer` action, one question at a time, so the paper is not sitting in
		// the page source.
		questions: attemptQuestions(attempt).map(({ question, answer }) => {
			const order = optionOrder(attempt.id, question.id);
			const scenario = SCENARIO_BY_ID.get(question.scenario);

			return {
				id: question.id,
				domain: DOMAIN_BY_ID[question.domain],
				scenario: scenario && { title: scenario.title, premise: scenario.premise },
				stem: question.stem,
				options: inDisplayOrder(order, question.options).map((o) => o.text),
				// Stored as an original index; the runner works in display indices.
				chosen: answer.chosen === null ? null : toDisplay(order, answer.chosen),
				flagged: answer.flagged
			};
		})
	};
};

export const actions: Actions = {
	answer: async ({ params, request, locals }) => {
		const form = await request.formData();
		const questionId = stringField(form, 'questionId');
		const chosen = parseDisplayIndex(form.get('chosen'));

		if (questionId === null || chosen === null) {
			return fail(400, { message: 'Malformed answer' });
		}

		const attempt = getAttempt(locals.profileId, params.id);
		if (!attempt) return fail(404, { message: 'No such attempt' });

		const outcome = recordAnswer(attempt, locals.profileId, questionId, chosen);
		if (!outcome.recorded) {
			const message =
				outcome.reason === 'expired'
					? 'Time is up — hand the paper in.'
					: outcome.reason === 'finished'
						? 'This paper has already been handed in.'
						: 'That question is not on this paper.';
			return fail(outcome.reason === 'not-on-paper' ? 400 : 409, { message });
		}

		// Guaranteed present: recordAnswer already rejected anything not on this paper.
		const question = QUESTION_BY_ID.get(questionId);
		if (!question) return fail(400, { message: 'No such question' });

		// A mock stays silent until it is handed in; drills teach as you go.
		if (attempt.mode === 'mock') return { recorded: true, questionId };

		const order = optionOrder(attempt.id, questionId);
		return {
			recorded: true,
			questionId,
			reveal: {
				correct: outcome.correct,
				answer: toDisplay(order, question.answer),
				explanation: question.explanation,
				why: inDisplayOrder(order, question.options).map((o) => o.why),
				lesson: question.lesson ?? null
			}
		};
	},

	flag: async ({ params, request, locals }) => {
		const form = await request.formData();
		const questionId = stringField(form, 'questionId');
		if (questionId === null) return fail(400, { message: 'Malformed flag' });

		const attempt = getAttempt(locals.profileId, params.id);
		if (!attempt) return fail(404, { message: 'No such attempt' });

		const flagged = boolField(form, 'flagged');
		setFlag(attempt, questionId, flagged);
		return { flagged, questionId };
	},

	finish: async ({ params, locals }) => {
		const attempt = getAttempt(locals.profileId, params.id);
		if (!attempt) return fail(404, { message: 'No such attempt' });

		finishAttempt(locals.profileId, attempt);
		redirect(303, `/quiz/${params.id}/result`);
	}
};
