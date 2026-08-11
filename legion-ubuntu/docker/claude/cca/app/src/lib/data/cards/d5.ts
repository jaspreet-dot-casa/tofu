import { defineCards } from './index';

export const d5Cards = defineCards('d5', [
	{
		id: 'd5-c01',
		front: 'Context rot',
		back: 'Recall and accuracy degrade as the window fills. More context is NOT automatically better — curation matters as much as capacity.',
		lesson: 'd5-context-rot'
	},
	{
		id: 'd5-c02',
		front: 'Lost in the middle',
		back: 'Models attend well to the beginning and end of a context, poorly to the middle. Mitigate by extracting key facts to the top, trimming, or splitting into focused passes.',
		lesson: 'd5-context-rot'
	},
	{
		id: 'd5-c03',
		front: 'Long-context prompting rules (20k+ tokens)',
		back: 'Put long documents **near the top**, above the query. Wrap each in `<document>` with `<source>` and `<document_content>`. Ask for relevant quotes in `<quotes>` tags before answering.',
		lesson: 'd5-context-rot'
	},
	{
		id: 'd5-c04',
		front: 'Signals that a context has degraded',
		back: 'Inconsistent answers to the same question · generic patterns replacing specific findings · repeated tool calls already made · hallucinated references to unprovided information.',
		lesson: 'd5-context-rot'
	},
	{
		id: 'd5-c05',
		front: 'Prompt cache read and write multipliers',
		back: 'Reads ≈ **0.1x** base input. Writes ≈ **1.25x** for the 5-minute TTL, **2x** for the 1-hour TTL. Caching only pays off with more than one hit inside the TTL.',
		lesson: 'd5-prompt-caching'
	},
	{
		id: 'd5-c06',
		front: 'Prompt cache TTLs and breakpoint limit',
		back: 'Default **5 minutes**, refreshed on each hit; optional `ttl: "1h"`. Up to **4** breakpoints per request.',
		lesson: 'd5-prompt-caching'
	},
	{
		id: 'd5-c07',
		front: 'Minimum cacheable prefix by model',
		back: '**1,024** tokens — Opus 4.8, Sonnet 4.6, Sonnet 4.5. **4,096** — Haiku 4.5, Opus 4.6/4.5. **512** — Fable 5, Mythos 5. (2,048 is the old Haiku 3.5 figure — a distractor.)',
		lesson: 'd5-prompt-caching'
	},
	{
		id: 'd5-c08',
		front: 'What invalidates a prompt cache?',
		back: 'Changing the **tools** invalidates everything. Changing the **system** invalidates system + messages. Any varying content before a breakpoint (timestamps!) means the prefix never matches.',
		lesson: 'd5-prompt-caching'
	},
	{
		id: 'd5-c09',
		front: 'How do you verify caching is working?',
		back: 'The `cache_read_input_tokens` and `cache_creation_input_tokens` fields in the response usage block.',
		lesson: 'd5-prompt-caching'
	},
	{
		id: 'd5-c10',
		front: 'Compaction versus context editing versus RAG',
		back: 'Long **conversation** → compaction. Bulky **tool results** → context editing. Large **corpus** → retrieval. Match the tool to the symptom.',
		lesson: 'd5-compaction-and-editing'
	},
	{
		id: 'd5-c11',
		front: 'Context editing edit types',
		back: '`clear_tool_uses_20250919` (options: `keep` default 3, `clear_at_least`, `exclude_tools`, `clear_tool_inputs`) and `clear_thinking_20251015`. Results reported in `applied_edits`.',
		lesson: 'd5-compaction-and-editing'
	},
	{
		id: 'd5-c12',
		front: 'The thinking-block rule during tool use',
		back: 'The API strips old thinking automatically — EXCEPT during a tool-use cycle, where the unmodified block (signature intact) must be returned with the `tool_result`, or you get a 400.',
		lesson: 'd5-compaction-and-editing'
	},
	{
		id: 'd5-c13',
		front: 'Retryable HTTP status codes',
		back: '**429** (honour `Retry-After`), **500**, **504**, **529** — with exponential backoff. NOT retryable: 400, 401, 402, 403, 404, 413.',
		lesson: 'd5-errors-and-retries'
	},
	{
		id: 'd5-c14',
		front: 'Which artefact does support need for a production failure?',
		back: 'The `request-id` header (e.g. `req_018Ee…`), also exposed as `request_id` in error JSON and on SDK response objects. Log it on every request.',
		lesson: 'd5-errors-and-retries'
	},
	{
		id: 'd5-c15',
		front: 'Streaming gotcha',
		back: 'Errors can arrive **after** a 200 — a stream can deliver an `overloaded_error` event partway through. Handle unknown event types gracefully; expect pings.',
		lesson: 'd5-errors-and-retries'
	},
	{
		id: 'd5-c16',
		front: 'Three reliability patterns',
		back: '**Circuit breaker** (stop retrying after N consecutive failures, reset after cooldown) · **idempotency** (retries are safe) · **graceful degradation** (continue, and *report* the degradation).',
		lesson: 'd5-errors-and-retries'
	},
	{
		id: 'd5-c17',
		front: 'What goes in a crash-recovery manifest?',
		back: '`workflow_id`, `completed_steps`, `pending_steps`, `intermediate_results`, `checkpoint_timestamp`. On resume, load it and inject it into the new prompt.',
		lesson: 'd5-errors-and-retries'
	},
	{
		id: 'd5-c18',
		front: 'Why can 97% aggregate accuracy be misleading?',
		back: 'A document type that is 8% of the corpus can fail 60% of the time and barely move the aggregate. Use **stratified** sampling by type AND field.',
		lesson: 'd5-provenance-and-review'
	},
	{
		id: 'd5-c19',
		front: 'The two human-review routes, and why both',
		back: 'Exception-based (system-owned signals) catches known doubt. Stratified random sampling catches **confident** errors. Exception review alone is structurally blind to them.',
		lesson: 'd5-provenance-and-review'
	},
	{
		id: 'd5-c20',
		front: 'What does provenance require per claim?',
		back: 'Source, excerpt, date, and the kind of claim — direct quote, paraphrase or inference. Conflicting sources get **both** attributions, never a silent pick.',
		lesson: 'd5-provenance-and-review'
	},
	{
		id: 'd5-c21',
		front: 'The five mental models',
		back: 'Determinism test · isolation principle · recovery question (3am, no human) · attention budget · calibration check.',
		lesson: 'd5-provenance-and-review'
	},
	{
		id: 'd5-c22',
		front: 'The seven anti-patterns',
		back: 'Few-shot for tool ordering · self-reported confidence for escalation · Batch for blocking workflows · bigger context as an attention fix · silent failure on error · all tools to all agents · prompt-only JSON formatting.',
		lesson: 'd5-provenance-and-review'
	}
]);
