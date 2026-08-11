import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { DOMAIN_BY_SLUG, domainQuestionShare } from '$lib/data/domains';
import { lessonsForTrack } from '$lib/server/content';
import { completedLessonIds } from '$lib/server/progress';
import { computeReadiness } from '$lib/server/readiness';
import { questionsForDomain } from '$lib/data/questions';
import { cardsForDomain } from '$lib/data/cards';
import { SCENARIOS } from '$lib/data/scenarios';

export const load: PageServerLoad = async ({ params, locals }) => {
	const domain = DOMAIN_BY_SLUG.get(params.slug);
	if (!domain) error(404, 'No such domain');

	const completed = completedLessonIds(locals.profileId);
	const readiness = computeReadiness(locals.profileId, completed);
	const mine = readiness.domains.find((d) => d.domain.id === domain.id);
	if (!mine) error(500, 'Domain missing from readiness');

	return {
		domain,
		questionShare: domainQuestionShare(domain),
		readiness: {
			proficiency: mine.proficiency,
			points: mine.points,
			ceiling: mine.ceiling,
			accuracy: mine.accuracy,
			questionsAnswered: mine.questionsAnswered
		},
		lessons: lessonsForTrack(domain.id).map((l) => ({
			slug: l.slug,
			title: l.title,
			summary: l.summary,
			minutes: l.minutes,
			complete: completed.has(l.id)
		})),
		questionCount: questionsForDomain(domain.id).length,
		cardCount: cardsForDomain(domain.id).length,
		scenarios: SCENARIOS.filter((s) => s.domains.includes(domain.id)).map((s) => ({
			slug: s.slug,
			title: s.title
		}))
	};
};
