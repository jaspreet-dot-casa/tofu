import type { Handle } from '@sveltejs/kit';
import {
	COOKIE_OPTIONS,
	PROFILE_COOKIE,
	createProfile,
	ensureProfile,
	parse,
	serialize
} from '$lib/server/profile';

/**
 * Attaches an anonymous profile to the request — but only if something actually asks
 * for it.
 *
 * `locals.profileId` is a lazy getter rather than an eagerly minted id. Minting on
 * every request meant a permanent `profiles` row for every visitor without a cookie,
 * and the container's own 30-second healthcheck is exactly that: `/healthz` is a
 * SvelteKit route, so `handle` ran for it and left a row behind ~2,880 times a day.
 * Crawlers, favicon fetches and static assets did the same.
 *
 * Resolving on first read fixes the whole class rather than special-casing `/healthz`:
 * a request that never touches progress never touches the database. Cookies set from
 * inside a load or action are still applied to the response, so a real page visit
 * behaves exactly as before.
 */
export const handle: Handle = async ({ event, resolve }) => {
	let resolved: string | null = null;

	Object.defineProperty(event.locals, 'profileId', {
		configurable: true,
		get(): string {
			if (resolved !== null) return resolved;

			const signed = parse(event.cookies.get(PROFILE_COOKIE));
			if (signed) {
				// Also refreshes last_seen_at. The row can be missing if the database was
				// reset while a cookie survived, so this is an upsert rather than an update.
				ensureProfile(signed);
				resolved = signed;
			} else {
				resolved = createProfile();
				event.cookies.set(PROFILE_COOKIE, serialize(resolved), COOKIE_OPTIONS);
			}

			return resolved;
		}
	});

	return resolve(event);
};
