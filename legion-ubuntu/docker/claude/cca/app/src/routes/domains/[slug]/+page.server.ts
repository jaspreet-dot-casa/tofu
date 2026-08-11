import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { DOMAIN_BY_SLUG, domainQuestionShare } from '$lib/data/domains';
import { lessonsForTrack } from '$lib/server/content';
import { completedLessonIds, domainProgress } from '$lib/server/progress';
import { SCENARIOS } from '$lib/data/scenarios';

export const load: PageServerLoad = async ({ params, locals }) => {
	const domain = DOMAIN_BY_SLUG.get(params.slug);
	if (!domain) error(404, 'No such domain');

	const completed = completedLessonIds(locals.profileId);
	const mine = domainProgress(completed).find((d) => d.domain.id === domain.id);
	if (!mine) error(500, 'Domain missing from progress');

	const lessons = lessonsForTrack(domain.id);

	return {
		domain,
		questionShare: domainQuestionShare(domain),
		progress: { done: mine.done, total: mine.total, percent: mine.percent },
		readingMinutes: lessons.reduce((n, l) => n + l.minutes, 0),
		lessons: lessons.map((l) => ({
			slug: l.slug,
			title: l.title,
			summary: l.summary,
			minutes: l.minutes,
			complete: completed.has(l.id)
		})),
		scenarios: SCENARIOS.filter((s) => s.domains.includes(domain.id)).map((s) => ({
			slug: s.slug,
			title: s.title
		}))
	};
};
