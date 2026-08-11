import type { LayoutServerLoad } from './$types';
import { currentStreak } from '$lib/server/progress';
import { dueCardCount } from '$lib/server/cards';

/**
 * Data for the status line, which is present on every screen — so both queries here
 * run on every request and are kept as narrow as possible.
 *
 * These land in `data` for every page too, since SvelteKit merges layout data into
 * page data. A page that needs the streak or the due count reads them straight off
 * `data` instead of querying again.
 */
export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		streak: currentStreak(locals.profileId),
		cardsDue: dueCardCount(locals.profileId)
	};
};
