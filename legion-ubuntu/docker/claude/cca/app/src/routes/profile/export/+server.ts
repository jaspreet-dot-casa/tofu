import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exportProfile } from '$lib/server/profile';

/** Everything this profile has, as a downloadable JSON file. */
export const GET: RequestHandler = async ({ locals }) => {
	const profileId = locals.profileId;

	return json(exportProfile(profileId), {
		headers: {
			'content-disposition': `attachment; filename="cca-progress-${profileId.slice(0, 8)}.json"`
		}
	});
};
