/**
 * Formatting shared between server loads and components. Isomorphic on purpose —
 * this module must stay free of server-only imports.
 */

/** `1:52:53` — always h:mm:ss so timestamps align in a mono column. */
export function formatDuration(seconds: number): string {
	const total = Math.max(0, Math.floor(seconds));
	const h = Math.floor(total / 3600);
	const m = Math.floor((total % 3600) / 60);
	const s = total % 60;
	return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Local calendar day (`YYYY-MM-DD`), honouring the container's TZ. */
export function dayKey(offsetDays = 0): string {
	const date = new Date();
	if (offsetDays !== 0) date.setDate(date.getDate() + offsetDays);
	return date.toLocaleDateString('en-CA');
}

/** Whole percent of `part` out of `whole`; 0 rather than NaN when `whole` is 0. */
export function percent(part: number, whole: number): number {
	return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

/** Clamps a 0–1 ratio into range, for callers that hold a ratio rather than a pair. */
export function clampRatio(value: number): number {
	return Math.max(0, Math.min(1, value));
}
