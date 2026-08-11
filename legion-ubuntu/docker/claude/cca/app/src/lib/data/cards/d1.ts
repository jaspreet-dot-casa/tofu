import { defineCards } from './index';

export const d1Cards = defineCards('d1', [
	{
		id: 'd1-c01',
		front: 'The agentic loop, in four steps',
		back: 'Send request → check `stop_reason` → execute tool → return `tool_result` → repeat. Your code executes the tools, never the model.',
		lesson: 'd1-agentic-loop'
	},
	{
		id: 'd1-c02',
		front: '`stop_reason` values you must branch on',
		back: '`tool_use` (continue), `end_turn` (done), `max_tokens` (truncated!), `stop_sequence`, `refusal`, `pause_turn`, `model_context_window_exceeded`.',
		lesson: 'd1-agentic-loop'
	},
	{
		id: 'd1-c03',
		front: 'Where must `tool_result` blocks sit in a user message?',
		back: 'First in the content array.',
		lesson: 'd1-agentic-loop'
	},
	{
		id: 'd1-c04',
		front: 'Workflow versus agent — the definitional line',
		back: 'Workflow = orchestrated through **predefined code paths**. Agent = the model **dynamically directs its own process**.',
		lesson: 'd1-workflows-vs-agents'
	},
	{
		id: 'd1-c05',
		front: 'The "start simple" rule',
		back: 'Use the least autonomous solution that solves the problem. Prompt < workflow < single agent < multi-agent.',
		lesson: 'd1-workflows-vs-agents'
	},
	{
		id: 'd1-c06',
		front: 'The five composable patterns',
		back: 'Prompt chaining · routing · parallelisation (sectioning or voting) · orchestrator-workers · evaluator-optimiser.',
		lesson: 'd1-composable-patterns'
	},
	{
		id: 'd1-c07',
		front: 'Sectioning versus voting',
		back: 'Sectioning = different pieces of work run at once. Voting = the *same* work run several times to raise confidence.',
		lesson: 'd1-composable-patterns'
	},
	{
		id: 'd1-c08',
		front: 'Orchestrator-workers versus sectioning',
		back: 'Orchestrator-workers decides the subtasks **at run time**. If you can list them up front, it is sectioning and you need no orchestrator.',
		lesson: 'd1-composable-patterns'
	},
	{
		id: 'd1-c09',
		front: 'Hub-and-spoke — the one rule',
		back: 'The coordinator manages ALL communication. Subagents never talk to each other. No lateral edges.',
		lesson: 'd1-hub-and-spoke'
	},
	{
		id: 'd1-c10',
		front: 'The coordinator\'s three jobs',
		back: 'Decompose · delegate (with explicit context) · synthesise. Doing the work is **not** one of them.',
		lesson: 'd1-hub-and-spoke'
	},
	{
		id: 'd1-c11',
		front: 'What does a subagent inherit from its parent?',
		back: 'Nothing. Fresh context window, no conversation history. Everything must be passed in the invoking prompt. Only its final message returns.',
		lesson: 'd1-subagent-isolation'
	},
	{
		id: 'd1-c12',
		front: 'When are subagents the WRONG choice?',
		back: 'When subtasks share evolving state — each step depending on what the last just learned. Isolation means every agent works from a stale snapshot.',
		lesson: 'd1-subagent-isolation'
	},
	{
		id: 'd1-c13',
		front: 'Resume versus fork',
		back: 'Resume = continue with full history intact. Fork = independent branch; changes **never propagate back** to the parent.',
		lesson: 'd1-sessions'
	},
	{
		id: 'd1-c14',
		front: 'Valid escalation triggers',
		back: 'Explicit request for a human · ambiguous policy · no progress after repeated attempts · irreversible or high-stakes action.',
		lesson: 'd1-budgets-and-escalation'
	},
	{
		id: 'd1-c15',
		front: 'What must NOT trigger escalation on its own?',
		back: 'Customer frustration (sentiment) · a low self-reported confidence score · complexity where the policy is clear.',
		lesson: 'd1-budgets-and-escalation'
	},
	{
		id: 'd1-c16',
		front: 'Why is self-reported confidence a bad escalation gate?',
		back: 'It is poorly calibrated — confidently wrong on exactly the cases you need to catch. Use deterministic thresholds on facts the system owns.',
		lesson: 'd1-budgets-and-escalation'
	},
	{
		id: 'd1-c17',
		front: 'The token budget 80/100 pattern',
		back: 'Inject a wrap-up instruction at 80% of budget; hard-stop **in code** at 100%. Track cumulative input + output across the whole loop.',
		lesson: 'd1-budgets-and-escalation'
	},
	{
		id: 'd1-c18',
		front: 'Relative token cost: chat, single agent, multi-agent',
		back: '1x · ~4x · ~15x. Multi-agent needs high value, independent parallelisable subtasks, AND work exceeding one context window.',
		lesson: 'd1-budgets-and-escalation'
	},
	{
		id: 'd1-c19',
		front: 'Which tool invokes a subagent, and what must be allowed?',
		back: 'The `Agent` tool (formerly `Task`, still an alias). It must be in `allowedTools` for delegation to be auto-approved.',
		lesson: 'd1-subagent-isolation'
	},
	{
		id: 'd1-c20',
		front: 'What does a subagent definition require, and what does `model` default to?',
		back: 'Required: `name` and `description` (the description is what Claude matches on). `model` defaults to **inherit** from the parent.',
		lesson: 'd1-subagent-isolation'
	}
]);
