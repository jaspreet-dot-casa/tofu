import { defineCards } from './index';

export const d3Cards = defineCards('d3', [
	{
		id: 'd3-c01',
		front: 'What makes a criterion "testable"?',
		back: 'You can look at an output and mechanically decide whether it satisfied the instruction. "Be conservative" fails; "flag only severity >= high with direct security impact" passes.',
		lesson: 'd3-explicit-criteria'
	},
	{
		id: 'd3-c02',
		front: 'System prompt structure',
		back: 'Role (one sentence) → explicit numbered criteria → boundary statements ("Do NOT…") → output format with an example. Keep under ~2000 tokens.',
		lesson: 'd3-explicit-criteria'
	},
	{
		id: 'd3-c03',
		front: 'Positive versus negative instructions',
		back: 'Tell it what TO do. "Write in flowing prose" beats "no markdown" — a prohibition describes a space to avoid without specifying the target.',
		lesson: 'd3-explicit-criteria'
	},
	{
		id: 'd3-c04',
		front: 'How many few-shot examples, and what matters most?',
		back: '3–5, wrapped in `<example>` tags. **Diversity** matters most — similar examples teach an incidental shared feature instead of the rule.',
		lesson: 'd3-few-shot-and-xml'
	},
	{
		id: 'd3-c05',
		front: 'What can few-shot NOT do?',
		back: 'Enforce tool ordering. Ordering is compliance and needs a programmatic gate, hook, or orchestration step. One of the seven anti-patterns.',
		lesson: 'd3-few-shot-and-xml'
	},
	{
		id: 'd3-c06',
		front: 'Ranking of ways to guarantee JSON output',
		back: '1. Structured Outputs (`output_config.format`, json_schema). 2. Forced tool use + `strict: true`. 3. Prompting (probabilistic). 4. Prefill — **400 error** on Claude 4.6+.',
		lesson: 'd3-structured-output'
	},
	{
		id: 'd3-c07',
		front: 'What do schemas guarantee — and not guarantee?',
		back: 'Guarantee: valid syntax, required fields present, types correct. Do NOT guarantee: correct values. A hallucinated invoice number is schema-valid.',
		lesson: 'd3-structured-output'
	},
	{
		id: 'd3-c08',
		front: 'Schema design for messy documents',
		back: 'Nullable fields for genuinely absent data · an `"unclear"` enum value for ambiguity · `"other"` plus a detail string for unexpected categories.',
		lesson: 'd3-structured-output'
	},
	{
		id: 'd3-c09',
		front: 'The four `tool_choice` values',
		back: '`auto` (default with tools) · `any` (must call some tool) · `{type:"tool",name}` (must call that one) · `none` (default with no tools).',
		lesson: 'd3-structured-output'
	},
	{
		id: 'd3-c10',
		front: 'Which `tool_choice` values are incompatible with extended thinking?',
		back: '`any` and a named tool. Only `auto` and `none` work with thinking enabled.',
		lesson: 'd3-few-shot-and-xml'
	},
	{
		id: 'd3-c11',
		front: 'Structured Outputs limits',
		back: 'Supports enums, const, anyOf/allOf, $ref, common string formats. Does NOT support recursive schemas or numeric/length constraints (minimum, maxLength). Up to 20 strict tools.',
		lesson: 'd3-structured-output'
	},
	{
		id: 'd3-c12',
		front: 'What goes in a retry after validation failure?',
		back: 'The original document + the failed extraction + the **specific** validation errors. "Try again" produces a differently-wrong answer.',
		lesson: 'd3-validation-retry'
	},
	{
		id: 'd3-c13',
		front: 'What can a retry NOT fix?',
		back: 'Missing data. Retrying when a field is genuinely absent produces a hallucinated value. Cap at 2–3 attempts, then route to human review.',
		lesson: 'd3-validation-retry'
	},
	{
		id: 'd3-c14',
		front: 'Batch API: cost, latency, constraint',
		back: '**50% cheaper**, up to **24 hours**, **no latency SLA**, no multi-turn. Use `custom_id` to correlate. Never for blocking workflows.',
		lesson: 'd3-batch-api'
	},
	{
		id: 'd3-c15',
		front: 'Cost pressure + a user waiting — what are the levers?',
		back: 'Prompt caching on the stable prefix, and routing simple queries to a cheaper model. **Not** Batch.',
		lesson: 'd3-batch-api'
	},
	{
		id: 'd3-c16',
		front: 'Why can\'t an instance review its own output?',
		back: 'Generator bias — it retains the reasoning that produced the mistake, so the flawed step looks correct. Review needs a separate session with no generator context.',
		lesson: 'd3-multi-pass-review'
	},
	{
		id: 'd3-c17',
		front: 'The two review passes and what each catches',
		back: 'Per-unit passes catch local defects (full attention on little material). One cross-unit pass catches integration defects. Neither substitutes for the other.',
		lesson: 'd3-multi-pass-review'
	},
	{
		id: 'd3-c18',
		front: 'Prompt chaining, canonical shape',
		back: 'Extract → Validate → Enrich → Format, with a programmatic gate between each step so errors are caught before they propagate.',
		lesson: 'd3-multi-pass-review'
	},
	{
		id: 'd3-c19',
		front: 'Adaptive thinking parameters',
		back: '`thinking: {type: "adaptive"}` with `effort`: `low` | `medium` | `high` | `xhigh` | `max`. Replaces the older extended-thinking `budget_tokens`.',
		lesson: 'd3-few-shot-and-xml'
	},
	{
		id: 'd3-c20',
		front: 'Why did prefilling stop working?',
		back: 'Prefilling the last assistant turn returns a **400** on Claude 4.6+ models. Replace it with Structured Outputs, enums for classification, or a "no preamble" instruction.',
		lesson: 'd3-structured-output'
	}
]);
