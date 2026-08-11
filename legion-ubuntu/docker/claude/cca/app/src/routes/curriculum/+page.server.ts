import type { PageServerLoad } from './$types';
import { DOMAINS, EXAM, domainQuestionShare } from '$lib/data/domains';
import { SCENARIOS } from '$lib/data/scenarios';
import { lessonsForTrack } from '$lib/server/content';
import { completedLessonIds, overallProgress } from '$lib/server/progress';

export const load: PageServerLoad = async ({ locals }) => {
	const done = completedLessonIds(locals.profileId);

	return {
		exam: EXAM,
		overall: overallProgress(done),
		orientation: lessonsForTrack('orientation').map((l) => ({
			slug: l.slug,
			title: l.title,
			summary: l.summary,
			minutes: l.minutes,
			complete: done.has(l.id)
		})),
		domains: DOMAINS.map((domain) => {
			const lessons = lessonsForTrack(domain.id);
			return {
				...domain,
				lessonsTotal: lessons.length,
				lessonsDone: lessons.filter((l) => done.has(l.id)).length,
				questionShare: domainQuestionShare(domain)
			};
		}),
		scenarios: SCENARIOS.map((s) => ({
			slug: s.slug,
			title: s.title,
			premise: s.premise,
			domains: s.domains
		}))
	};
};
