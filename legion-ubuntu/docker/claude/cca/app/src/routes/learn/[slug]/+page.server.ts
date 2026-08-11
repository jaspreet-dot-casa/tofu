import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { lessonBySlug, lessonNeighbours } from '$lib/server/content';
import { isLessonComplete, setLessonComplete } from '$lib/server/progress';
import { DOMAIN_BY_ID } from '$lib/data/domains';
import { chapterUrl, chapterNumber } from '$lib/data/course';
import { formatDuration } from '$lib/format';
import { boolField } from '$lib/server/form';

export const load: PageServerLoad = async ({ params, locals }) => {
	const lesson = lessonBySlug(params.slug);
	if (!lesson) error(404, 'No such lesson');

	const { prev, next } = lessonNeighbours(lesson);
	const chapter = lesson.courseChapter;

	return {
		lesson: {
			slug: lesson.slug,
			title: lesson.title,
			summary: lesson.summary,
			minutes: lesson.minutes,
			html: lesson.html,
			toc: lesson.toc
		},
		domain: lesson.track === 'orientation' ? null : DOMAIN_BY_ID[lesson.track],
		chapter: chapter && {
			title: chapter.title,
			timestamp: formatDuration(chapter.start),
			url: chapterUrl(chapter),
			number: chapterNumber(chapter)
		},
		complete: isLessonComplete(locals.profileId, lesson.id),
		prev: prev && { slug: prev.slug, title: prev.title },
		next: next && { slug: next.slug, title: next.title }
	};
};

export const actions: Actions = {
	toggleComplete: async ({ params, locals, request }) => {
		const lesson = lessonBySlug(params.slug);
		if (!lesson) return fail(404, { message: 'No such lesson' });

		const complete = boolField(await request.formData(), 'complete');
		setLessonComplete(locals.profileId, lesson.id, complete);
		return { complete };
	}
};
