/**
 * The six exam scenarios. An attempt draws four of them at random and asks roughly
 * fifteen questions against each, so a scenario is the real unit of study — not a
 * topic. Each one exercises several domains at once, which is the whole point: the
 * exam tests architectural judgement under a concrete brief, not recall.
 */

import type { DomainId } from './domains';

/**
 * The exam draws four of these six. Declaring the ids as a tuple gives the rest of
 * the app a real union to check against instead of bare strings — question modules,
 * quiz targets and route params all narrow to it.
 */
export const SCENARIO_IDS = [
	'support',
	'code-gen',
	'research',
	'devtools',
	'ci-cd',
	'extraction'
] as const;

export type ScenarioId = (typeof SCENARIO_IDS)[number];

export interface Scenario {
	id: ScenarioId;
	slug: string;
	title: string;
	/** The brief, as the exam would frame it. */
	premise: string;
	/** Domains this scenario leans on, most-exercised first. */
	domains: DomainId[];
	/** The judgement calls this scenario is really testing. */
	tests: string[];
}

export const SCENARIOS: readonly Scenario[] = [
	{
		id: 'support',
		slug: 'customer-support-agent',
		title: 'Customer Support Resolution Agent',
		premise:
			'A support agent handles returns, billing and account issues at a target of 80%+ first-contact resolution, and must know when to hand a conversation to a human.',
		domains: ['d1', 'd5', 'd4'],
		tests: [
			'Which signals legitimately trigger escalation, and which are traps',
			'Why self-reported confidence is the wrong escalation gate',
			'Carrying transactional facts across a long conversation',
			'Session resumption versus forking a branch'
		]
	},
	{
		id: 'code-gen',
		slug: 'code-generation-claude-code',
		title: 'Code Generation with Claude Code',
		premise:
			'A team rolls Claude Code out across a shared repository: standards everyone inherits, commands everyone can run, and guardrails nobody can bypass by accident.',
		domains: ['d2', 'd3', 'd1'],
		tests: [
			'Where team standards must live to actually be shared',
			'When guidance is enough and when only a hook will do',
			'Plan mode versus direct execution',
			'Scoping permissions without blocking the work'
		]
	},
	{
		id: 'research',
		slug: 'multi-agent-research',
		title: 'Multi-Agent Research System',
		premise:
			'A coordinator delegates to specialised subagents for search, analysis, synthesis and reporting, and has to degrade gracefully when one of them fails.',
		domains: ['d1', 'd5', 'd3'],
		tests: [
			'Hub-and-spoke topology and why spokes never talk to each other',
			'What a subagent does and does not inherit',
			'Propagating a failure as structured context instead of silence',
			'Whether the ~15x token premium is justified at all'
		]
	},
	{
		id: 'devtools',
		slug: 'developer-productivity-tools',
		title: 'Developer Productivity Tools',
		premise:
			'An internal assistant navigates a large codebase and absorbs engineering grunt work using built-in tools plus a few MCP servers.',
		domains: ['d4', 'd2', 'd1'],
		tests: [
			'Choosing between Grep, Glob, Read and Bash for a given job',
			'Fixing wrong-tool selection at the description, not the model',
			'Keeping tool count inside the range where routing still works',
			'MCP transport and scope choices'
		]
	},
	{
		id: 'ci-cd',
		slug: 'claude-code-ci-cd',
		title: 'Claude Code in CI/CD',
		premise:
			'Automated review, test generation and PR feedback run headless in a pipeline, where nothing may hang waiting for a prompt and output must be machine-parseable.',
		domains: ['d2', 'd3', 'd5'],
		tests: [
			'The flags that make a non-interactive run safe and reproducible',
			'Why the generator must not review its own work',
			'Structured output that a pipeline can branch on',
			'Session isolation between jobs'
		]
	},
	{
		id: 'extraction',
		slug: 'structured-data-extraction',
		title: 'Structured Data Extraction',
		premise:
			'Unstructured documents are turned into validated records at volume, cheaply, with a human review path for anything the system is not sure about.',
		domains: ['d3', 'd5', 'd4'],
		tests: [
			'Schema design for missing, ambiguous and unexpected values',
			'What a retry can fix and what it cannot',
			'Batch versus real-time, and the SLA trap',
			'Sampling strategies that catch per-type failures'
		]
	}
];

export const SCENARIO_BY_SLUG: ReadonlyMap<string, Scenario> = new Map(
	SCENARIOS.map((s) => [s.slug, s])
);

export const SCENARIO_BY_ID: ReadonlyMap<string, Scenario> = new Map(
	SCENARIOS.map((s) => [s.id, s])
);

export function isScenarioId(value: string): value is ScenarioId {
	return (SCENARIO_IDS as readonly string[]).includes(value);
}
