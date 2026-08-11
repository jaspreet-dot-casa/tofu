/**
 * The seven-step preparation roadmap, from the post this site was built around.
 * Rendered on /resources as a checklist — these are the official sources, and step 5
 * in particular is the source of truth that overrides anything written here.
 */

export interface RoadmapStep {
	id: string;
	title: string;
	body: string;
	links: { label: string; href: string }[];
}

export const ROADMAP: RoadmapStep[] = [
	{
		id: 'academy',
		title: 'Start with Anthropic Academy',
		body: 'Free training that builds the foundation: Claude, Claude Code, the API, MCP and agentic development. Do this before anything else — the exam assumes it.',
		links: [{ label: 'anthropic.skilljar.com', href: 'https://anthropic.skilljar.com/' }]
	},
	{
		id: 'cookbook',
		title: 'Learn by building',
		body: "Don't just consume courses. Work through the Cookbook and turn the concepts into something that runs — the exam rewards people who have debugged this stuff, not people who have read about it.",
		links: [
			{
				label: 'anthropics/claude-cookbooks',
				href: 'https://github.com/anthropics/claude-cookbooks'
			}
		]
	},
	{
		id: 'core-tech',
		title: 'Master the core technologies',
		body: 'Go deeper into the two things you will actually architect with: the Claude API and the Model Context Protocol.',
		links: [
			{ label: 'Claude API docs', href: 'https://platform.claude.com/docs/' },
			{ label: 'Model Context Protocol', href: 'https://modelcontextprotocol.io/' }
		]
	},
	{
		id: 'prep-path',
		title: 'Follow the official Architect prep path',
		body: 'Anthropic publishes a dedicated preparation path for the Foundations certification inside Partner Academy.',
		links: [
			{
				label: 'CCA-F prep path',
				href: 'https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification#ccarf-prep'
			}
		]
	},
	{
		id: 'exam-guide',
		title: 'Study the official Exam Guide',
		body: 'This is your source of truth. It carries the domains, task statements and sample questions, and it wins over every third-party guide including this one.',
		links: [
			{
				label: 'Official exam guide',
				href: 'https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification'
			}
		]
	},
	{
		id: 'practice',
		title: 'Practice scenarios, not memorisation',
		body: 'Questions are multiple-choice and scenario-based. Focus on trade-offs, architectural decisions, deployment choices, cost, security and real implementation. The old practice exam has been retired — use the sample questions in the official guide.',
		links: [
			{
				label: 'Sample questions (in the guide)',
				href: 'https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification'
			}
		]
	},
	{
		id: 'register',
		title: 'Register for the exam',
		body: 'Register through Anthropic Partner Academy, then schedule the proctored sitting through Pearson VUE.',
		links: [
			{ label: 'Pearson VUE — Anthropic', href: 'https://www.pearsonvue.com/us/en/anthropic.html' }
		]
	}
];

/** Extra references worth having on the resources page but not part of the seven steps. */
export const EXTRA_RESOURCES = [
	{
		label: 'Building Effective Agents (Anthropic essay)',
		href: 'https://www.anthropic.com/engineering/building-effective-agents',
		note: 'The source of the five composable patterns and the "start simple" rule.'
	},
	{
		label: 'Claude Code docs',
		href: 'https://code.claude.com/docs',
		note: 'Settings precedence, hooks, permissions, headless flags.'
	},
	{
		label: 'Claude Docs — context windows & prompt caching',
		href: 'https://platform.claude.com/docs/',
		note: 'The numbers behind Domain 5: TTLs, cache minimums, error codes.'
	},
	{
		label: 'MCP specification',
		href: 'https://modelcontextprotocol.io/',
		note: 'Primitives, transports, and the JSON-RPC error model.'
	}
];
