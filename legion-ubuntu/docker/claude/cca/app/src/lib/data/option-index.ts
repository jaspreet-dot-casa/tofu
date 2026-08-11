/**
 * Two index spaces, kept apart by the type system.
 *
 * A question's options are AUTHORED with the correct answer first, then permuted
 * per attempt before they are shown. So "option 2" is ambiguous unless you say
 * which list you mean:
 *
 *   ORIGINAL — the authored order. What `Question.answer` names and what the
 *              database stores in `quiz_answers.chosen`.
 *   DISPLAY  — the order the candidate actually saw. What the runner posts back.
 *
 * Both are numbers, so before branding they were freely interchangeable and mixing
 * them compiled silently into a wrong highlight. Now crossing between them requires
 * `toOriginal` / `toDisplay`, which are the only places the conversion is written.
 */

declare const brand: unique symbol;

/** Index into a question's authored option list. */
export type OriginalIndex = number & { readonly [brand]: 'Original' };

/** Index into the options as shown for one particular attempt. */
export type DisplayIndex = number & { readonly [brand]: 'Display' };

/** `order[displayIndex] = originalIndex`. */
export type OptionOrder = readonly [OriginalIndex, OriginalIndex, OriginalIndex, OriginalIndex];

/** Every question has exactly four options — one correct, three distractors. */
export const OPTION_COUNT = 4;

/** The letters shown against each option, indexed by DisplayIndex. */
export const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

function inRange(value: number): boolean {
	return Number.isInteger(value) && value >= 0 && value < OPTION_COUNT;
}

/** Brands a trusted number. Throws if it could not be a valid option index. */
export function asOriginal(value: number): OriginalIndex {
	if (!inRange(value)) throw new RangeError(`${value} is not a valid option index`);
	return value as OriginalIndex;
}

/**
 * Parses untrusted input (a form field). Returns null rather than throwing.
 *
 * There is deliberately no `asDisplay` counterpart to `asOriginal`: a DisplayIndex
 * only ever originates from a form post or from `toDisplay`, both covered here.
 */
export function parseDisplayIndex(value: unknown): DisplayIndex | null {
	const n = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : NaN;
	return inRange(n) ? (n as DisplayIndex) : null;
}

export function toOriginal(order: OptionOrder, index: DisplayIndex): OriginalIndex {
	return order[index] as OriginalIndex;
}

/** Null when the original index is not in this order — impossible for a full permutation. */
export function toDisplay(order: OptionOrder, index: OriginalIndex): DisplayIndex | null {
	const found = order.indexOf(index);
	return found === -1 ? null : (found as DisplayIndex);
}

/** Reorders anything indexed by OriginalIndex into display order. */
export function inDisplayOrder<T>(order: OptionOrder, items: readonly T[]): T[] {
	return order.map((original) => items[original] as T);
}
