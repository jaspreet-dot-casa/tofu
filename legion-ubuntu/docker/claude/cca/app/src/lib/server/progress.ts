/**
 * Lesson completion, curriculum progress, daily activity and the streak.
 *
 * Reading a lesson is the only thing this app tracks. There is no score and no
 * prediction — "how much of the curriculum have I been through" is a question the
 * data can actually answer, so it is the only one asked.
 */

import { all, get, run, type SqlRow } from './db';
import { LESSONS, lessonsForTrack, type Lesson } from './content';
import { DOMAINS } from '$lib/data/domains';
import { dayKey } from '$lib/format';
import type { ActivityDay, Completion, DomainProgress } from '$lib/types';

export function recordActivity(profileId: string, amount = 1): void {
	run(
		`INSERT INTO activity (profile_id, day, lessons) VALUES (?, ?, ?)
		 ON CONFLICT(profile_id, day) DO UPDATE SET lessons = lessons + excluded.lessons`,
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
	if (!already) recordActivity(profileId);
}

function tally(lessons: readonly Lesson[], completed: ReadonlySet<string>): Completion {
	const done = lessons.reduce((n, l) => n + (completed.has(l.id) ? 1 : 0), 0);
	const total = lessons.length;
	return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

/** Every lesson in the curriculum, orientation included. */
export function overallProgress(completed: ReadonlySet<string>): Completion {
	return tally(LESSONS, completed);
}

/**
 * One row per domain, in blueprint order. Domains are listed even when untouched —
 * a progress panel that hides the parts you have not started is not a progress panel.
 */
export function domainProgress(completed: ReadonlySet<string>): DomainProgress[] {
	return DOMAINS.map((domain) => ({ domain, ...tally(lessonsForTrack(domain.id), completed) }));
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
}

function activityRows(profileId: string, since: string): ActivityRow[] {
	return all<ActivityRow>(
		'SELECT day, lessons FROM activity WHERE profile_id = ? AND day >= ?',
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
		const lessons = byDay.get(day)?.lessons ?? 0;
		window.push({ day, lessons, active: lessons > 0 });
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
			.filter((r) => r.lessons > 0)
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
