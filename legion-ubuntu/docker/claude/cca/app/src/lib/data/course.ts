/**
 * The freeCodeCamp / ExamPro course, "Claude Certified Architect - Foundations –
 * Prepare for and pass the exam!" (13h, Andrew Brown).
 *
 * Chapters come from the video description. Timestamps are converted to seconds so
 * lessons can deep-link straight to the relevant moment, which is the only way a
 * 13-hour video is usable as revision material.
 */

import type { DomainId } from './domains';

export const COURSE = {
	title: 'Claude Certified Architect - Foundations – Prepare for and pass the exam!',
	channel: 'freeCodeCamp.org',
	author: 'ExamPro (Andrew Brown)',
	videoId: 'reDRM0tqhNs',
	url: 'https://www.youtube.com/watch?v=reDRM0tqhNs',
	totalHours: 13
} as const;

export interface CourseChapter {
	/** Stable key referenced from lesson frontmatter via `courseChapter`. */
	id: string;
	title: string;
	/** Offset into the video, in seconds. */
	start: number;
	/** Which exam domain this chapter mostly serves. `null` for framing chapters. */
	domain: DomainId | null;
}

const hms = (h: number, m: number, s: number) => h * 3600 + m * 60 + s;

export const COURSE_CHAPTERS: CourseChapter[] = [
	{ id: 'intro', title: 'Introduction', start: hms(0, 0, 47), domain: null },
	{ id: 'sdk-setup', title: 'SDK Environment Setup', start: hms(0, 10, 17), domain: 'd2' },
	{ id: 'agentic-loop', title: 'Agentic Loop Foundations', start: hms(0, 47, 36), domain: 'd1' },
	{
		id: 'orchestration',
		title: 'Orchestration & multi-agent architecture',
		start: hms(1, 52, 53),
		domain: 'd1'
	},
	{ id: 'advanced-agents', title: 'Advanced Agent Patterns', start: hms(4, 15, 46), domain: 'd1' },
	{
		id: 'sessions',
		title: 'Sessions, management, context state',
		start: hms(6, 47, 52),
		domain: 'd5'
	},
	{
		id: 'cc-config',
		title: 'Claude Code configuration, permissions, safety',
		start: hms(7, 31, 50),
		domain: 'd2'
	},
	{ id: 'tooling', title: 'Tooling & built-in tools usage', start: hms(8, 58, 52), domain: 'd4' },
	{
		id: 'reliability',
		title: 'Reliability, evaluation, output quality',
		start: hms(9, 39, 3),
		domain: 'd3'
	},
	{
		id: 'scaling-context',
		title: 'Scaling context & real-world constraints',
		start: hms(10, 43, 59),
		domain: 'd5'
	},
	{ id: 'mcp', title: 'MCP ecosystem integration', start: hms(11, 29, 51), domain: 'd4' },
	{
		id: 'ci-cd',
		title: 'Claude Code in CI/CD automation',
		start: hms(11, 41, 19),
		domain: 'd2'
	},
	{
		id: 'scenarios',
		title: 'Scenario-based architect patterns',
		start: hms(12, 14, 57),
		domain: null
	}
];

export const CHAPTER_BY_ID: ReadonlyMap<string, CourseChapter> = new Map(
	COURSE_CHAPTERS.map((c) => [c.id, c])
);

/** Deep link that opens the video at this chapter. */
export function chapterUrl(chapter: CourseChapter): string {
	return `${COURSE.url}&t=${chapter.start}s`;
}

/** Position in the chapter list, 1-based — rendered as the "fCC ch. N" tag. */
export function chapterNumber(chapter: CourseChapter): number {
	return COURSE_CHAPTERS.indexOf(chapter) + 1;
}
