import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { buildDeck, deckStats, deckSummaries, loadStates } from '$lib/server/cards';
import { CARD_BY_ID } from '$lib/data/cards';
import { DOMAIN_BY_ID, isDomainId, type DomainId } from '$lib/data/domains';
import { GRADES, previewIntervals, reviewCard } from '$lib/server/srs';
import { recordActivity } from '$lib/server/progress';
import { stringField, unionField } from '$lib/server/form';

function parseDomain(value: string | null): DomainId | undefined {
	return value !== null && isDomainId(value) ? value : undefined;
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const domain = parseDomain(url.searchParams.get('domain'));

	// One read of card_reviews serves the deck, the per-domain counts and the
	// interval previews — this page used to issue one query per card.
	const states = loadStates(locals.profileId);

	return {
		domain: domain ? DOMAIN_BY_ID[domain] : null,
		stats: deckStats(locals.profileId, domain, states),
		decks: deckSummaries(states).map((d) => ({ ...DOMAIN_BY_ID[d.domain], ...d })),
		cards: buildDeck(locals.profileId, domain, 20, states).map((card) => ({
			...card,
			domain: DOMAIN_BY_ID[card.domain]
		}))
	};
};

export const actions: Actions = {
	grade: async ({ request, locals }) => {
		const form = await request.formData();

		const cardId = stringField(form, 'cardId');
		if (cardId === null || !CARD_BY_ID.has(cardId)) return fail(400, { message: 'No such card' });

		const grade = unionField(form, 'grade', GRADES);
		if (grade === null) return fail(400, { message: 'Unknown grade' });

		const scheduled = reviewCard(locals.profileId, cardId, grade);
		recordActivity(locals.profileId, 'cards');

		// The hints under the grade buttons were rendered from this card's PRE-grade
		// schedule. A card graded "again" is shown again in the same session, so send
		// back the refreshed previews for that second showing.
		return {
			cardId,
			grade,
			intervals: previewIntervals({
				interval_days: scheduled.intervalDays,
				ease: scheduled.ease
			})
		};
	}
};
