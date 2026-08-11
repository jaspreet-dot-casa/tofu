/**
 * The five exam domains, in blueprint order (descending weight).
 *
 * The weights are not decoration — they drive the readiness score, the number of
 * questions a mock exam draws per domain, and the physical track width of every
 * domain meter in the UI. They must sum to 100.
 */

export type DomainId = 'd1' | 'd2' | 'd3' | 'd4' | 'd5';

/**
 * Where a chapter sits in the curriculum: one of the five exam domains, or the
 * orientation track that precedes them. Domain vocabulary, so it lives here rather
 * than in the content pipeline that happens to read it out of frontmatter.
 */
export type Track = DomainId | 'orientation';

export interface Domain {
	id: DomainId;
	/** Short label used in dense instrument chrome, e.g. meter rows and score-rail segments. */
	code: string;
	slug: string;
	title: string;
	/** One line, used on cards and the curriculum grid. */
	blurb: string;
	/** Percentage of the exam. Integers, summing to 100. */
	weight: number;
	/** CSS custom-property suffix: var(--domain-d1) etc. */
	accent: string;
}

export const DOMAINS: Domain[] = [
	{
		id: 'd1',
		code: 'D1',
		slug: 'agentic-architecture',
		title: 'Agentic Architecture & Orchestration',
		blurb:
			'The agentic loop, when a workflow beats an agent, and how coordinators delegate to subagents without leaking context.',
		weight: 27,
		accent: 'd1'
	},
	{
		id: 'd2',
		code: 'D2',
		slug: 'claude-code-configuration',
		title: 'Claude Code Configuration & Workflows',
		blurb:
			'Settings precedence, CLAUDE.md versus memory, hooks that actually enforce, permission modes, and headless CI.',
		weight: 20,
		accent: 'd2'
	},
	{
		id: 'd3',
		code: 'D3',
		slug: 'prompt-engineering',
		title: 'Prompt Engineering & Structured Output',
		blurb:
			'Testable criteria over vague guidance, few-shot in XML, and guaranteeing schema-valid output without prefill.',
		weight: 20,
		accent: 'd3'
	},
	{
		id: 'd4',
		code: 'D4',
		slug: 'tool-design-mcp',
		title: 'Tool Design & MCP Integration',
		blurb:
			'Why the tool description is the number one lever, the tool-use loop, and the MCP host/client/server split.',
		weight: 18,
		accent: 'd4'
	},
	{
		id: 'd5',
		code: 'D5',
		slug: 'context-reliability',
		title: 'Context Management & Reliability',
		blurb:
			'Context rot, prompt caching economics, compaction versus context editing, and systems that recover at 3am.',
		weight: 15,
		accent: 'd5'
	}
];

/** Total by construction — every DomainId has a Domain, so indexing is safe. */
export const DOMAIN_BY_ID: Record<DomainId, Domain> = Object.fromEntries(
	DOMAINS.map((d) => [d.id, d])
) as Record<DomainId, Domain>;

/** Partial — a slug arrives from the URL and may not exist. */
export const DOMAIN_BY_SLUG: ReadonlyMap<string, Domain> = new Map(DOMAINS.map((d) => [d.slug, d]));

export function isDomainId(value: string): value is DomainId {
	return value in DOMAIN_BY_ID;
}

export function isTrack(value: string): value is Track {
	return value === 'orientation' || isDomainId(value);
}

/** Blueprint order: orientation first, then domains by descending weight. */
export function trackOrder(track: Track): number {
	return track === 'orientation' ? 0 : DOMAINS.findIndex((d) => d.id === track) + 1;
}

/** Total scaled points a perfect candidate earns above the 100-point floor. */
export const SCORE_FLOOR = 100;
export const SCORE_CEILING = 1000;
export const SCORE_RANGE = SCORE_CEILING - SCORE_FLOOR; // 900
export const PASS_SCORE = 720;

/** Exam logistics, surfaced in the UI and used to size mock exams. */
export const EXAM = {
	questionCount: 60,
	minutes: 120,
	passScore: PASS_SCORE,
	scenariosDrawn: 4,
	scenarioPoolSize: 6,
	costUsd: 125,
	validityMonths: 12
} as const;

/**
 * The most scaled points a domain can ever contribute — its bracket ceiling on the
 * score rail. D1 tops out at 243 of the 900 available points.
 */
export function domainCeiling(domain: Domain): number {
	return Math.round((domain.weight / 100) * SCORE_RANGE);
}

/** How many of a 60-question mock come from this domain. */
export function domainQuestionShare(domain: Domain, total = EXAM.questionCount): number {
	return Math.round((domain.weight / 100) * total);
}
