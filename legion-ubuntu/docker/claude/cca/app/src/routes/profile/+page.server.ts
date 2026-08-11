import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	COOKIE_OPTIONS,
	PROFILE_COOKIE,
	createProfile,
	ensureProfile,
	isValidProfileId,
	profileExists,
	profileStats,
	resetProfile,
	serialize
} from '$lib/server/profile';
import { activityWindow, completedLessonIds, overallProgress } from '$lib/server/progress';
import { stringField } from '$lib/server/form';

/** Twelve weeks of dots on the profile page. */
const ACTIVITY_DAYS = 84;

// `streak` comes from the layout load via SvelteKit's data merge — see +layout.server.ts.
export const load: PageServerLoad = async ({ locals }) => {
	return {
		profileId: locals.profileId,
		stats: profileStats(locals.profileId),
		overall: overallProgress(completedLessonIds(locals.profileId)),
		activity: activityWindow(locals.profileId, ACTIVITY_DAYS)
	};
};

export const actions: Actions = {
	/** Adopt an existing profile on this device by pasting its sync code. */
	adopt: async ({ request, cookies }) => {
		const code = stringField(await request.formData(), 'code')?.trim() ?? '';

		if (!isValidProfileId(code)) {
			return fail(400, { message: 'That does not look like a sync code.' });
		}

		// Adopting must never CREATE a profile: one mistyped hex digit would otherwise
		// swap this browser onto a fresh empty history with no warning, and the real
		// sync code would be gone from here.
		if (!profileExists(code)) {
			return fail(404, { message: 'No profile has that sync code — check it and try again.' });
		}

		ensureProfile(code);
		cookies.set(PROFILE_COOKIE, serialize(code), COOKIE_OPTIONS);
		redirect(303, '/profile');
	},

	/** Hand this browser a brand new, empty profile. The old one is left intact. */
	newProfile: async ({ cookies }) => {
		const id = createProfile();
		cookies.set(PROFILE_COOKIE, serialize(id), COOKIE_OPTIONS);
		redirect(303, '/profile');
	},

	/** Wipe this profile's history in place, keeping the same sync code. */
	reset: async ({ locals, request }) => {
		const confirm = stringField(await request.formData(), 'confirm');
		if (confirm !== locals.profileId.slice(0, 8)) {
			return fail(400, { message: 'Confirmation did not match — nothing was deleted.' });
		}

		resetProfile(locals.profileId);
		return { reset: true };
	}
};
