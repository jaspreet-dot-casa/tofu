import type { PageServerLoad } from './$types';
import {
	activityWindow,
	completedLessonIds,
	domainProgress,
	nextLesson,
	overallProgress
} from '$lib/server/progress';

/** Days of activity the dashboard's streak dots render. */
const STREAK_DAYS = 14;

// `streak` is not fetched here — the layout already loads it for the status line, and
// SvelteKit merges that into this page's `data`.
export const load: PageServerLoad = async ({ locals }) => {
	// Loaded once and shared: the overall bar, the domain rows and "what next" all
	// read the same completion set.
	const completed = completedLessonIds(locals.profileId);

	const next = nextLesson(completed);

	return {
		overall: overallProgress(completed),
		domains: domainProgress(completed),
		activity: activityWindow(locals.profileId, STREAK_DAYS),
		nextLesson: next && { slug: next.slug, title: next.title, minutes: next.minutes }
	};
};
