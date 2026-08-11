import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { get } from '$lib/server/db';
import { LESSONS } from '$lib/server/content';
import { QUESTIONS } from '$lib/data/questions';

/**
 * Liveness probe for the container healthcheck. Touching the database is deliberate —
 * a process that is up but cannot read /data is not healthy.
 */
export const GET: RequestHandler = () => {
	const row = get<{ ok: number }>('SELECT 1 AS ok');

	return json({
		status: row?.ok === 1 ? 'ok' : 'degraded',
		lessons: LESSONS.length,
		questions: QUESTIONS.length
	});
};
