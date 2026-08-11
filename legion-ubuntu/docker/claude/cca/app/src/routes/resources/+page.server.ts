import type { PageServerLoad } from './$types';
import { EXTRA_RESOURCES, ROADMAP } from '$lib/data/roadmap';
import { COURSE, COURSE_CHAPTERS, chapterUrl } from '$lib/data/course';
import { formatDuration } from '$lib/format';
import { DOMAIN_BY_ID, EXAM } from '$lib/data/domains';

export const load: PageServerLoad = async () => {
	return {
		exam: EXAM,
		roadmap: ROADMAP,
		extras: EXTRA_RESOURCES,
		course: {
			...COURSE,
			chapters: COURSE_CHAPTERS.map((c, i) => ({
				number: i + 1,
				title: c.title,
				timestamp: formatDuration(c.start),
				url: chapterUrl(c),
				domain: c.domain ? DOMAIN_BY_ID[c.domain] : null
			}))
		}
	};
};
