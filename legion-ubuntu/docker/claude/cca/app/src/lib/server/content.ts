/**
 * Lesson content pipeline.
 *
 * Markdown is pulled in as raw strings at build time and rendered to HTML exactly
 * once, when the module first loads. There are a few dozen lessons and they never
 * change at runtime, so per-request parsing would be pure waste.
 *
 * Callouts are authored as markdown-it containers:
 *
 *     ::: trap Bigger context is not better attention
 *     Body text...
 *     :::
 *
 * which renders plain `<div class="callout callout--trap">` markup. Nothing in the
 * output depends on Svelte or on client-side JavaScript.
 */

import MarkdownIt from 'markdown-it';
import container from 'markdown-it-container';
import anchor from 'markdown-it-anchor';
import matter from 'gray-matter';
import hljs from 'highlight.js/lib/common';
import { isTrack, trackOrder, type Track } from '$lib/data/domains';
import { CHAPTER_BY_ID, type CourseChapter } from '$lib/data/course';
import type { TocEntry } from '$lib/types';

export interface Lesson {
	id: string;
	slug: string;
	track: Track;
	order: number;
	title: string;
	summary: string;
	/** Estimated reading time, in minutes, from frontmatter. */
	minutes: number;
	/** Matching chapter in the freeCodeCamp course, if there is one. */
	courseChapter: CourseChapter | null;
	html: string;
	toc: TocEntry[];
}

export interface ScenarioNote {
	slug: string;
	html: string;
	toc: TocEntry[];
}

/**
 * Container name in markdown → CSS modifier and default title. The modifiers match
 * the design system's `.callout--key` / `--trap` / `--tip`.
 */
const CALLOUTS: Record<string, { modifier: string; title: string }> = {
	'key-fact': { modifier: 'key', title: 'Key fact' },
	trap: { modifier: 'trap', title: 'Trap' },
	'exam-tip': { modifier: 'tip', title: 'Exam tip' }
};

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-');
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

const md = new MarkdownIt({
	html: false,
	linkify: true,
	typographer: true,
	highlight(code, lang) {
		const language = lang && hljs.getLanguage(lang) ? lang : null;
		const body = language
			? hljs.highlight(code, { language, ignoreIllegals: true }).value
			: escapeHtml(code);
		// The language tag is rendered from the data attribute in CSS, so the markup
		// stays a plain pre/code pair.
		return `<pre class="code" data-lang="${escapeHtml(language ?? 'text')}"><code class="hljs language-${escapeHtml(
			language ?? 'text'
		)}">${body}</code></pre>`;
	}
});

md.use(anchor, {
	slugify,
	level: [2, 3],
	permalink: anchor.permalink.linkInsideHeader({
		symbol: '#',
		placement: 'after',
		class: 'heading-anchor',
		ariaHidden: true
	})
});

for (const [name, { modifier, title: defaultTitle }] of Object.entries(CALLOUTS)) {
	md.use(container, name, {
		render(tokens: { nesting: number; info: string }[], idx: number) {
			const token = tokens[idx];
			if (token?.nesting === 1) {
				const custom = token.info.trim().slice(name.length).trim();
				const title = custom || defaultTitle;
				return (
					`<div class="callout callout--${modifier}" role="note">` +
					`<p class="callout__title">${escapeHtml(title)}</p>`
				);
			}
			return '</div>\n';
		}
	});
}

type Tokens = ReturnType<InstanceType<typeof MarkdownIt>['parse']>;

/** Pulls h2/h3 out of the token stream so the reader can render a sticky contents list. */
function extractToc(tokens: Tokens): TocEntry[] {
	const toc: TocEntry[] = [];

	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		if (token === undefined || token.type !== 'heading_open') continue;
		if (token.tag !== 'h2' && token.tag !== 'h3') continue;

		const inline = tokens[i + 1];
		if (!inline || inline.type !== 'inline') continue;

		const text = inline.content.replace(/`/g, '');
		// markdown-it-anchor sets the id; slugify is the fallback if it ever does not.
		const anchorId = token.attrGet('id');
		toc.push({
			id: anchorId === null ? slugify(text) : String(anchorId),
			text,
			level: token.tag === 'h2' ? 2 : 3
		});
	}

	return toc;
}

interface Frontmatter {
	id?: string;
	track?: string;
	order?: number;
	title?: string;
	summary?: string;
	minutes?: number;
	courseChapter?: string;
}

function renderLesson(path: string, raw: string): Lesson {
	const { data, content } = matter(raw);
	const fm = data as Frontmatter;
	const fileSlug = path.split('/').pop()!.replace(/\.md$/, '');

	if (!fm.title) throw new Error(`${path}: frontmatter is missing "title"`);
	if (!fm.track) throw new Error(`${path}: frontmatter is missing "track"`);
	if (!isTrack(fm.track)) throw new Error(`${path}: unknown track "${fm.track}"`);

	const chapterId = fm.courseChapter;
	if (chapterId && !CHAPTER_BY_ID.has(chapterId)) {
		throw new Error(`${path}: unknown courseChapter "${chapterId}"`);
	}

	const tokens = md.parse(content, {});

	return {
		id: fm.id ?? fileSlug,
		slug: fileSlug,
		track: fm.track,
		order: fm.order ?? 0,
		title: fm.title,
		summary: fm.summary ?? '',
		minutes: fm.minutes ?? 6,
		courseChapter: chapterId ? (CHAPTER_BY_ID.get(chapterId) ?? null) : null,
		html: md.renderer.render(tokens, md.options, {}),
		toc: extractToc(tokens)
	};
}

const lessonFiles = import.meta.glob('/src/content/lessons/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;

const scenarioFiles = import.meta.glob('/src/content/scenarios/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;

export const LESSONS: Lesson[] = Object.entries(lessonFiles)
	.map(([path, raw]) => renderLesson(path, raw))
	.sort((a, b) => {
		if (a.track !== b.track) return trackOrder(a.track) - trackOrder(b.track);
		return a.order - b.order;
	});

export const LESSON_BY_SLUG: ReadonlyMap<string, Lesson> = new Map(
	LESSONS.map((l) => [l.slug, l])
);

export function lessonBySlug(slug: string): Lesson | undefined {
	return LESSON_BY_SLUG.get(slug);
}

export const SCENARIO_NOTES: ReadonlyMap<string, ScenarioNote> = new Map(
	Object.entries(scenarioFiles).map(([path, raw]) => {
		const slug = path.split('/').pop()!.replace(/\.md$/, '');
		const { content } = matter(raw);
		const tokens = md.parse(content, {});
		return [
			slug,
			{ slug, html: md.renderer.render(tokens, md.options, {}), toc: extractToc(tokens) }
		];
	})
);

/** Inline-only rendering (code spans, emphasis) for short strings like card backs. */
export function renderInline(text: string): string {
	return md.renderInline(text);
}

const BY_TRACK: ReadonlyMap<Track, readonly Lesson[]> = (() => {
	const groups = new Map<Track, Lesson[]>();
	for (const lesson of LESSONS) {
		const bucket = groups.get(lesson.track);
		if (bucket) bucket.push(lesson);
		else groups.set(lesson.track, [lesson]);
	}
	return groups;
})();

export function lessonsForTrack(track: Track): readonly Lesson[] {
	return BY_TRACK.get(track) ?? [];
}

/** Previous/next within the same track, for the reader footer. */
export function lessonNeighbours(lesson: Lesson): { prev: Lesson | null; next: Lesson | null } {
	const siblings = lessonsForTrack(lesson.track);
	const i = siblings.findIndex((l) => l.id === lesson.id);
	if (i === -1) return { prev: null, next: null };

	return {
		prev: siblings[i - 1] ?? null,
		next: siblings[i + 1] ?? null
	};
}
