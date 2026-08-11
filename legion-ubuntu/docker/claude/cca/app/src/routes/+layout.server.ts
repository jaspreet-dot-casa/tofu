import type { LayoutServerLoad } from './$types';
import { currentStreak } from '$lib/server/progress';

/**
 * Data for the status line, which is present on every screen — so this query runs on
 * every request and is kept as narrow as possible.
 *
 * It lands in `data` for every page too, since SvelteKit merges layout data into page
 * data. A page that needs the streak reads it straight off `data` instead of querying
 * again.
 */
export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		streak: currentStreak(locals.profileId)
	};
};
