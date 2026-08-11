/**
 * Anonymous identity. The site has no login — a profile is minted on first visit and
 * carried in a signed, httpOnly cookie. The raw id doubles as a "sync code" that can
 * be pasted on another device to adopt the same profile, which gives us cross-device
 * continuity without building an auth system for a single-user homelab app.
 *
 * The signature stops someone handing themselves an arbitrary id; it is not a
 * security boundary, because there is nothing here worth protecting beyond a study
 * history.
 */

import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';
import { all, get, run, tx } from './db';

export const PROFILE_COOKIE = 'cca_profile';

/** One year — long enough that a study cycle never loses its history. */
const MAX_AGE = 60 * 60 * 24 * 365;

/**
 * The signing key, resolved on first use rather than at import.
 *
 * Lazily on purpose: SvelteKit's build-time analysis imports this module with
 * NODE_ENV=production and no environment, so throwing at module scope would fail
 * the build rather than a misconfigured deploy. Compose already refuses to start
 * without the variable; this is the second line of defence, and it is deliberately
 * not silent — the id inside the cookie IS the identity, so a signing key that
 * ships in the repo would let anyone forge another profile.
 */
let cachedSecret: string | null = null;

function secret(): string {
	if (cachedSecret !== null) return cachedSecret;

	const configured = env.COOKIE_SECRET;
	if (configured) {
		cachedSecret = configured;
	} else if (process.env.NODE_ENV === 'production') {
		throw new Error(
			'COOKIE_SECRET is required in production — generate one with: openssl rand -base64 48'
		);
	} else {
		cachedSecret = 'cca-dev-secret-not-for-production';
	}

	return cachedSecret;
}

function sign(id: string): string {
	return createHmac('sha256', secret()).update(id).digest('base64url');
}

export function serialize(id: string): string {
	return `${id}.${sign(id)}`;
}

/** Returns the id if the value carries a valid signature, otherwise null. */
export function parse(value: string | undefined): string | null {
	if (!value) return null;

	const dot = value.lastIndexOf('.');
	if (dot <= 0) return null;

	const id = value.slice(0, dot);
	const provided = Buffer.from(value.slice(dot + 1));
	const expected = Buffer.from(sign(id));

	if (provided.length !== expected.length) return null;
	if (!timingSafeEqual(provided, expected)) return null;

	return id;
}

export function isValidProfileId(id: string): boolean {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function createProfile(): string {
	const id = randomUUID();
	const now = new Date().toISOString();
	run('INSERT INTO profiles (id, created_at, last_seen_at) VALUES (?, ?, ?)', id, now, now);
	return id;
}

export function profileExists(id: string): boolean {
	return get<{ id: string }>('SELECT id FROM profiles WHERE id = ?', id) !== undefined;
}

/** Ensures a row exists for `id` — the cookie's own upsert, refreshing last_seen_at. */
export function ensureProfile(id: string): void {
	const now = new Date().toISOString();
	run(
		`INSERT INTO profiles (id, created_at, last_seen_at) VALUES (?, ?, ?)
		 ON CONFLICT(id) DO UPDATE SET last_seen_at = excluded.last_seen_at`,
		id,
		now,
		now
	);
}

export const COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax',
	maxAge: MAX_AGE,
	// Traefik terminates TLS and the app is only reachable over https, but leaving this
	// off in dev keeps `vite dev` on plain http working.
	secure: process.env.NODE_ENV === 'production'
} as const;

export interface ProfileStats {
	createdAt: string | null;
	lessons: number;
}

export function profileStats(profileId: string): ProfileStats {
	const row = get<{ created_at: string; lessons: number }>(
		`SELECT p.created_at,
		        (SELECT COUNT(*) FROM lesson_progress WHERE profile_id = p.id) AS lessons
		   FROM profiles p WHERE p.id = ?`,
		profileId
	);

	return {
		createdAt: row?.created_at ?? null,
		lessons: row?.lessons ?? 0
	};
}

/** Wipes this profile's history in place. The profile itself (and its id) survives. */
export function resetProfile(profileId: string): void {
	tx(() => {
		run('DELETE FROM lesson_progress WHERE profile_id = ?', profileId);
		run('DELETE FROM activity WHERE profile_id = ?', profileId);
	});
}

export interface ProfileExport {
	profileId: string;
	exportedAt: string;
	lessons: { lesson_id: string; completed_at: string }[];
	activity: { day: string; lessons: number }[];
}

/** Everything this profile has, for the JSON export. */
export function exportProfile(profileId: string): ProfileExport {
	return {
		profileId,
		exportedAt: new Date().toISOString(),
		lessons: all<{ lesson_id: string; completed_at: string }>(
			'SELECT lesson_id, completed_at FROM lesson_progress WHERE profile_id = ?',
			profileId
		),
		activity: all<{ day: string; lessons: number }>(
			'SELECT day, lessons FROM activity WHERE profile_id = ?',
			profileId
		)
	};
}
