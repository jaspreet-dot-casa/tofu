import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { SCENARIO_BY_SLUG } from '$lib/data/scenarios';
import { SCENARIO_NOTES } from '$lib/server/content';
import { DOMAIN_BY_ID, type DomainId } from '$lib/data/domains';

export const load: PageServerLoad = async ({ params }) => {
	const scenario = SCENARIO_BY_SLUG.get(params.slug);
	if (!scenario) error(404, 'No such scenario');

	const note = SCENARIO_NOTES.get(params.slug);

	return {
		scenario: {
			id: scenario.id,
			slug: scenario.slug,
			title: scenario.title,
			premise: scenario.premise,
			tests: scenario.tests
		},
		domains: scenario.domains.map((id: DomainId) => DOMAIN_BY_ID[id]),
		html: note?.html ?? null,
		toc: note?.toc ?? []
	};
};
