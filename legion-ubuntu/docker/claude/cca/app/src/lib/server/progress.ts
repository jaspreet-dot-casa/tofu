/**
 * Lesson completion, daily activity and the streak.
 */

import { all, get, run, type SqlRow } from './db';
import { LESSONS, type Lesson } from './content';
import { dayKey } from '$lib/format';
import type { ActivityDay } from '$lib/types';

export type ActivityKind = 'lessons' | 'questions' | 'cards';

/** Fixed set, so interpolating the column name is safe. */
const ACTIVITY_KINDS: readonly ActivityKind[] = ['lessons', 'questions', 'cards'];

export function recordActivity(profileId: string, kind: ActivityKind, amount = 1): void {
	if (!ACTIVITY_KINDS.includes(kind)) throw new Error(`unknown activity kind "${kind}"`);

	run(
		`INSERT INTO activity (profile_id, day, ${kind}) VALUES (?, ?, ?)
		 ON CONFLICT(profile_id, day) DO UPDATE SET ${kind} = ${kind} + excluded.${kind}`,
		profileId,
		dayKey(),
		amount
	);
}

interface LessonRow extends SqlRow {
	lesson_id: string;
}

export function completedLessonIds(profileId: string): ReadonlySet<string> {
	return new Set(
		all<LessonRow>('SELECT lesson_id FROM lesson_progress WHERE profile_id = ?', profileId).map(
			(r) => r.lesson_id
		)
	);
}

export function isLessonComplete(profileId: string, lessonId: string): boolean {
	return (
		get<LessonRow>(
			'SELECT lesson_id FROM lesson_progress WHERE profile_id = ? AND lesson_id = ?',
			profileId,
			lessonId
		) !== undefined
	);
}

export function setLessonComplete(profileId: string, lessonId: string, complete: boolean): void {
	if (!complete) {
		run('DELETE FROM lesson_progress WHERE profile_id = ? AND lesson_id = ?', profileId, lessonId);
		return;
	}

	const already = isLessonComplete(profileId, lessonId);
	run(
		`INSERT INTO lesson_progress (profile_id, lesson_id, completed_at) VALUES (?, ?, ?)
		 ON CONFLICT(profile_id, lesson_id) DO NOTHING`,
		profileId,
		lessonId,
		new Date().toISOString()
	);
	if (!already) recordActivity(profileId, 'lessons');
}

/**
 * The next lesson to read: the first incomplete one in blueprint order. LESSONS is
 * already sorted orientation-first, then by domain weight, then by lesson order — so
 * "next" naturally walks the curriculum the way it should be studied.
 */
export function nextLesson(completed: ReadonlySet<string>): Lesson | null {
	return LESSONS.find((l) => !completed.has(l.id)) ?? null;
}

interface ActivityRow extends SqlRow {
	day: string;
	lessons: number;
	questions: number;
	cards: number;
}

function activityRows(profileId: string, since: string): ActivityRow[] {
	return all<ActivityRow>(
		'SELECT day, lessons, questions, cards FROM activity WHERE profile_id = ? AND day >= ?',
		profileId,
		since
	);
}

/** The last `days` calendar days, oldest first, with gaps filled in. */
export function activityWindow(profileId: string, days = 28): ActivityDay[] {
	const byDay = new Map(activityRows(profileId, dayKey(-(days - 1))).map((r) => [r.day, r]));

	const window: ActivityDay[] = [];
	for (let i = days - 1; i >= 0; i--) {
		const day = dayKey(-i);
		const row = byDay.get(day);
		window.push({
			day,
			lessons: row?.lessons ?? 0,
			questions: row?.questions ?? 0,
			cards: row?.cards ?? 0,
			active: row !== undefined && row.lessons + row.questions + row.cards > 0
		});
	}
	return window;
}

/**
 * Consecutive active days ending today or yesterday. Yesterday still counts so the
 * streak does not visibly break just because you have not opened the app yet today.
 *
 * Walks backwards day by day and stops at the first gap, so a 3-day streak costs
 * three date formats rather than formatting a year of them to read the tail.
 */
export function currentStreak(profileId: string): number {
	const active = new Set(
		activityRows(profileId, dayKey(-365))
			.filter((r) => r.lessons + r.questions + r.cards > 0)
			.map((r) => r.day)
	);
	if (active.size === 0) return 0;

	// Today not yet active is not a broken streak — start counting from yesterday.
	let offset = active.has(dayKey(0)) ? 0 : -1;

	let streak = 0;
	while (streak <= active.size && active.has(dayKey(offset))) {
		streak++;
		offset--;
	}
	return streak;
}
