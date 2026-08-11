import type { PageServerLoad } from './$types';
import { computeReadiness } from '$lib/server/readiness';
import { activityWindow, completedLessonIds, nextLesson } from '$lib/server/progress';
import { attemptSummaries, openAttemptSummary } from '$lib/server/quiz';

/** Days of activity the dashboard's streak dots render. */
const STREAK_DAYS = 14;

// `streak` and `cardsDue` are not fetched here — the layout already loads both for
// the status line, and SvelteKit merges that into this page's `data`.
export const load: PageServerLoad = async ({ locals }) => {
	const profileId = locals.profileId;

	// Loaded once and shared: readiness and "what next" both need lesson progress.
	const completed = completedLessonIds(profileId);
	const next = nextLesson(completed);

	return {
		readiness: computeReadiness(profileId, completed),
		activity: activityWindow(profileId, STREAK_DAYS),
		nextLesson: next && { slug: next.slug, title: next.title, minutes: next.minutes },
		openAttempt: openAttemptSummary(profileId),
		history: attemptSummaries(profileId, 5)
	};
};
