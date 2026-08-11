/**
 * Form-field parsing.
 *
 * `FormData.get` returns `FormDataEntryValue | null`, so every action was writing
 * `form.get('x') as string` — asserting away both `null` and `File` *before* the
 * runtime check that would have justified it. These earn the narrowing instead.
 */

export function stringField(form: FormData, key: string): string | null {
	const value = form.get(key);
	return typeof value === 'string' && value.length > 0 ? value : null;
}

export function boolField(form: FormData, key: string): boolean {
	return form.get(key) === 'true';
}

/**
 * `bounds` is inclusive and rejects rather than clamps — an out-of-range value is a
 * malformed request, and silently substituting a different number hides it. Without
 * it a negative `limit` reached `pool.slice(0, limit)` and quietly trimmed a paper.
 */
export function intField(
	form: FormData,
	key: string,
	bounds?: { min?: number; max?: number }
): number | null {
	const value = stringField(form, key);
	if (value === null) return null;

	const parsed = Number(value);
	if (!Number.isInteger(parsed)) return null;
	if (bounds?.min !== undefined && parsed < bounds.min) return null;
	if (bounds?.max !== undefined && parsed > bounds.max) return null;

	return parsed;
}

/** Narrows a field to a member of a known union, or null. */
export function unionField<T extends string>(
	form: FormData,
	key: string,
	allowed: readonly T[]
): T | null {
	const value = stringField(form, key);
	return value !== null && (allowed as readonly string[]).includes(value) ? (value as T) : null;
}
