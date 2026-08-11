import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { DOMAINS, EXAM, domainQuestionShare, isDomainId } from '$lib/data/domains';
import { SCENARIOS, isScenarioId } from '$lib/data/scenarios';
import { questionCount, questionsForDomain, questionsForScenario } from '$lib/data/questions';
import {
	attemptSummaries,
	openAttemptSummary,
	startAttempt,
	type QuizSpec
} from '$lib/server/quiz';
import { intField, stringField, unionField } from '$lib/server/form';

export const load: PageServerLoad = async ({ locals }) => {
	return {
		exam: EXAM,
		bankSize: questionCount(),
		domains: DOMAINS.map((d) => ({
			...d,
			available: questionsForDomain(d.id).length,
			share: domainQuestionShare(d)
		})),
		scenarios: SCENARIOS.map((s) => ({
			id: s.id,
			slug: s.slug,
			title: s.title,
			premise: s.premise,
			available: questionsForScenario(s.id).length
		})),
		openAttempt: openAttemptSummary(locals.profileId),
		history: attemptSummaries(locals.profileId, 8)
	};
};

/** Builds a QuizSpec from form input, or returns why it could not. */
function parseSpec(form: FormData): QuizSpec | string {
	const mode = unionField(form, 'mode', ['mock', 'domain', 'scenario'] as const);
	if (mode === null) return 'Unknown quiz mode';

	if (mode === 'mock') return { mode };

	const target = stringField(form, 'target');
	if (target === null) return 'That drill needs a target';

	// A drill is at most the whole bank; anything outside that is a bad request, not a
	// number to be quietly reinterpreted.
	const limit = intField(form, 'limit', { min: 1, max: questionCount() }) ?? undefined;
	if (form.has('limit') && limit === undefined) return 'That drill length is out of range';

	if (mode === 'domain') {
		return isDomainId(target) ? { mode, domain: target, limit } : 'Unknown domain';
	}
	return isScenarioId(target) ? { mode, scenario: target, limit } : 'Unknown scenario';
}

export const actions: Actions = {
	start: async ({ request, locals }) => {
		const spec = parseSpec(await request.formData());
		if (typeof spec === 'string') return fail(400, { message: spec });

		let id: string;
		try {
			id = startAttempt(locals.profileId, spec);
		} catch (err) {
			return fail(400, {
				message: err instanceof Error ? err.message : 'Could not start that paper'
			});
		}

		redirect(303, `/quiz/${id}`);
	}
};
