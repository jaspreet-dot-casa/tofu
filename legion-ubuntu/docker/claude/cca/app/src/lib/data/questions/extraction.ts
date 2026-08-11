import { defineQuestions } from './types';

export const extraction = defineQuestions('extraction', [
	{
		id: 'ext-01',
		domain: 'd3',
		lesson: 'd3-structured-output',
		stem: 'Downstream systems break on malformed JSON. Which approach guarantees the output parses and matches the schema?',
		options: [
			{
				text: 'Structured Outputs with a JSON schema, or a forced tool call with strict: true.',
				why: 'Correct. Constrained sampling makes invalid output impossible.'
			},
			{ text: 'Prefill the assistant turn with an opening brace.', why: 'Wrong. Returns a 400 on Claude 4.6+ models — always a trap option.' },
			{ text: 'A firmly worded instruction to reply with JSON only.', why: 'Wrong. Probabilistic where a guarantee was required.' },
			{ text: 'A JSON repair library in post-processing.', why: 'A fallback, not a guarantee — and unnecessary once the output is constrained.' }
		],
		answer: 0,
		explanation:
			'Ranked: Structured Outputs, then forced tool use with strict schemas, then prompting. Prefilling is now an error.'
	},
	{
		id: 'ext-02',
		domain: 'd3',
		lesson: 'd3-structured-output',
		stem: 'After adopting a strict JSON schema, extractions still contain wrong values. What does this demonstrate?',
		options: [
			{
				text: 'Schemas eliminate syntax errors, not semantic ones — a hallucinated value is perfectly schema-valid.',
				why: 'Correct, and it is why a validation layer is not optional.'
			},
			{ text: 'The schema is misconfigured.', why: 'Not implied. A correct schema still cannot constrain meaning.' },
			{ text: 'strict: true was not set.', why: 'strict governs schema conformance, which is already holding — the values are wrong, not the shape.' },
			{ text: 'The model needs more few-shot examples.', why: 'May improve accuracy, but it does not change what a schema fundamentally guarantees.' }
		],
		answer: 0,
		explanation:
			'A schema guarantees the JSON parses, required fields are present and types match. It guarantees nothing about correctness of the values.'
	},
	{
		id: 'ext-03',
		domain: 'd3',
		lesson: 'd3-validation-retry',
		stem: 'A required purchase order number is genuinely absent from a document. What should the pipeline do?',
		options: [
			{
				text: 'Record it as null or "unclear" and route the document to human review — do not retry.',
				why: 'Correct. Absence is not a correctable error.'
			},
			{
				text: 'Retry with the validation error until a value is produced.',
				why: 'Wrong, and actively dangerous — pushing the model to satisfy a schema it cannot honestly satisfy is how hallucinated data enters a validated pipeline.'
			},
			{
				text: 'Infer a plausible PO number from other fields.',
				why: 'Wrong. Fabrication with extra steps.'
			},
			{
				text: 'Reject the document entirely and log an error.',
				why: 'Wasteful — the rest of the extraction is usable, and a human can supply the one missing field.'
			}
		],
		answer: 0,
		explanation:
			'Retries fix execution errors — wrong shape, misread field, misclassification. They cannot create missing data. Design the nullable and "unclear" paths so absence has an honest home.'
	},
	{
		id: 'ext-04',
		domain: 'd3',
		lesson: 'd3-batch-api',
		stem: 'Two million archived invoices must be processed by the end of the month, with nobody waiting on any individual result. Which approach?',
		options: [
			{
				text: 'The Batch API — 50% cheaper, up to 24 hours, no latency SLA needed here.',
				why: 'Correct. This is the textbook Batch case.'
			},
			{ text: 'Real-time API with high concurrency.', why: 'Works, but costs twice as much for no benefit when nothing is waiting.' },
			{ text: 'Batch, but only for documents under a size threshold.', why: 'An arbitrary split with no basis — the deciding factor is latency sensitivity, not size.' },
			{ text: 'Real-time with prompt caching.', why: 'Caching helps, but Batch\'s 50% applies to everything and there is no latency requirement to protect.' }
		],
		answer: 0,
		explanation:
			'Batch is right for overnight reports, weekly audits and bulk reprocessing. Use custom_id per request to correlate results, which do not return in submission order.'
	},
	{
		id: 'ext-05',
		domain: 'd3',
		lesson: 'd3-batch-api',
		stem: 'The same pipeline gains an interactive mode where a user uploads one document and waits for the result. What changes?',
		options: [
			{
				text: 'The interactive path must use the real-time API; the bulk path can stay on Batch.',
				why: 'Correct. Same system, different answer per path.'
			},
			{ text: 'Nothing — Batch usually returns quickly.', why: 'Wrong. There is no latency guarantee at all; "usually" is not a design.' },
			{ text: 'Move everything to real-time for consistency.', why: 'Wrong. It doubles the cost of the bulk path for a uniformity nobody benefits from.' },
			{ text: 'Use Batch with a shorter timeout.', why: 'Wrong. Batch does not offer a latency guarantee that a timeout could enforce.' }
		],
		answer: 0,
		explanation:
			'The deciding question is always who consumes the output and when. Never put a blocking workflow on Batch.'
	},
	{
		id: 'ext-06',
		domain: 'd3',
		lesson: 'd3-structured-output',
		stem: 'Documents occasionally have an ambiguous currency. Which schema design handles this best?',
		options: [
			{
				text: 'An enum including an explicit "unclear" value.',
				why: 'Correct. Ambiguity gets an honest home, and it becomes a routable review signal.'
			},
			{ text: 'Default to the most common currency.', why: 'Wrong. Silently fabricates a value indistinguishable from a genuine reading.' },
			{ text: 'Make the field a free-text string.', why: 'Wrong. Loses validation entirely and pushes the problem downstream.' },
			{ text: 'Omit the field when uncertain.', why: 'Ambiguous — an absent field cannot be distinguished from a parsing failure.' }
		],
		answer: 0,
		explanation:
			'Design for messy reality: nullable for genuinely absent data, "unclear" for ambiguity, and "other" plus a detail string for unexpected categories. Each doubles as a review-routing signal.'
	},
	{
		id: 'ext-07',
		domain: 'd5',
		lesson: 'd5-provenance-and-review',
		stem: 'Aggregate extraction accuracy is 97%, but a downstream team reports frequent errors on one document type. What went wrong with the measurement?',
		options: [
			{
				text: 'Uniform sampling hid a per-type failure — stratify by document type and field.',
				why: 'Correct. A type that is 8% of the corpus barely moves the aggregate even when badly broken.'
			},
			{ text: 'The accuracy target was set too low.', why: 'Wrong. The number is not the problem; what it aggregates over is.' },
			{ text: 'The sample size was too small.', why: 'More uniform samples would still under-represent the failing type proportionally.' },
			{ text: 'The downstream team is measuring differently.', why: 'Possible in general, but the described pattern is the classic stratification failure.' }
		],
		answer: 0,
		explanation:
			'Use stratified random sampling by document type and by field, with thresholds set per field and per type. Aggregate accuracy conceals concentrated failures.'
	},
	{
		id: 'ext-08',
		domain: 'd5',
		lesson: 'd5-provenance-and-review',
		stem: 'Which combination correctly routes work to human reviewers?',
		options: [
			{
				text: 'Exception-based routing on system-owned signals, plus a stratified random sample of everything.',
				why: 'Correct. Exceptions catch known doubt; sampling catches confident errors.'
			},
			{
				text: 'Exception-based routing alone, on the model\'s confidence score.',
				why: 'Wrong twice: self-reported confidence is poorly calibrated, and exceptions alone never surface confident errors.'
			},
			{
				text: 'Random sampling alone.',
				why: 'Incomplete. It would leave known-doubtful records unreviewed.'
			},
			{
				text: 'Review everything a second time with a different model.',
				why: 'Prohibitively expensive at volume, and still not a measurement strategy.'
			}
		],
		answer: 0,
		explanation:
			'Both routes are necessary. Exception review only ever inspects what the system already knew was doubtful, so it is structurally unable to find confident errors.'
	},
	{
		id: 'ext-09',
		domain: 'd3',
		lesson: 'd3-validation-retry',
		stem: 'What should a retry request contain after a validation failure?',
		options: [
			{
				text: 'The original document, the failed extraction, and the specific validation errors.',
				why: 'Correct. Naming the failure gives the model something to reconcile against.'
			},
			{ text: 'Just the instruction to try again.', why: 'Wrong. Produces a differently-wrong answer with no information to correct toward.' },
			{ text: 'The failed extraction only.', why: 'Missing the source document, so there is nothing to re-derive the correct value from.' },
			{ text: 'The original document only.', why: 'Discards what was wrong, so the same mistake is likely to recur.' }
		],
		answer: 0,
		explanation:
			'Specific feedback is what makes a retry converge. "invoice_total was 1240.00 but the line items sum to 1180.00" is actionable; "invalid" is not.'
	},
	{
		id: 'ext-10',
		domain: 'd5',
		lesson: 'd5-prompt-caching',
		stem: 'A large schema and instruction block is sent with every one of thousands of extractions. Where should the cache breakpoint go?',
		options: [
			{
				text: 'After the schema and instructions, with the document content following it.',
				why: 'Correct. Stable prefix cached, variable content outside it.'
			},
			{ text: 'After the document content, so more is cached.', why: 'Wrong. The document varies, so nothing before it is ever reused.' },
			{ text: 'At the very start, before the system prompt.', why: 'Caches nothing useful — a breakpoint marks the end of the cached prefix.' },
			{ text: 'No breakpoint; caching happens automatically.', why: 'Wrong. Caching requires explicit cache_control breakpoints.' }
		],
		answer: 0,
		explanation:
			'Cache stable content, put variable content after the breakpoint. Up to four breakpoints, and changing tools invalidates the entire cache.'
	},
	{
		id: 'ext-11',
		domain: 'd5',
		lesson: 'd5-prompt-caching',
		stem: 'The pipeline moves to Haiku 4.5 for cost reasons, and cache hit rates collapse. Most likely cause?',
		options: [
			{
				text: 'The prefix is below Haiku 4.5\'s 4,096-token minimum cacheable length.',
				why: 'Correct. Most models need 1,024; Haiku 4.5 needs 4,096.'
			},
			{ text: 'Haiku does not support prompt caching.', why: 'Wrong. It supports it, with a higher minimum.' },
			{ text: 'The TTL is shorter on Haiku.', why: 'Wrong. The default 5-minute TTL is not model-specific.' },
			{ text: 'Haiku requires a 1-hour TTL for caching.', why: 'Wrong. TTL choice is independent of model.' }
		],
		answer: 0,
		explanation:
			'Minimum cacheable length: 1,024 tokens for Opus 4.8 / Sonnet 4.6 / Sonnet 4.5; 4,096 for Haiku 4.5; 512 for Fable 5 and Mythos 5. A distractor often offers 2,048, the old Haiku 3.5 figure.'
	},
	{
		id: 'ext-12',
		domain: 'd3',
		lesson: 'd3-few-shot-and-xml',
		stem: 'Classification quality is inconsistent on edge cases. Which change helps most?',
		options: [
			{
				text: 'Add three to five diverse examples in XML tags, including an edge case and the reasoning behind its classification.',
				why: 'Correct. Diversity prevents the model latching onto an incidental shared feature.'
			},
			{ text: 'Add twenty examples of the most common case.', why: 'Wrong. Volume without diversity teaches the wrong pattern and crowds the context.' },
			{ text: 'Instruct the model to be careful with edge cases.', why: 'Wrong. Not a testable criterion, and it does not say what the right answer is.' },
			{ text: 'Prefill the response with the most likely class.', why: 'Wrong. Prefill errors on current models, and it would bias every classification.' }
		],
		answer: 0,
		explanation:
			'Three to five relevant, diverse examples in <example> tags. Cover the format, an acceptable variation, and an edge case where the naive answer is wrong.'
	},
	{
		id: 'ext-13',
		domain: 'd3',
		lesson: 'd3-few-shot-and-xml',
		stem: 'The pipeline requires that validate_record always runs before commit_record. Few-shot examples show the correct order but it is sometimes violated. What is the correct fix?',
		options: [
			{
				text: 'A programmatic gate — do not expose commit_record until validation has passed.',
				why: 'Correct. Ordering is a compliance requirement.'
			},
			{ text: 'More few-shot examples showing the ordering.', why: 'Wrong. Few-shot does not enforce tool ordering — this is an explicit anti-pattern.' },
			{ text: 'A system prompt instruction stating the order emphatically.', why: 'Wrong. Probabilistic enforcement of a hard requirement.' },
			{ text: 'tool_choice forcing validate_record.', why: 'Forces one call but does nothing to prevent commit_record on a later turn.' }
		],
		answer: 0,
		explanation:
			'One of the seven anti-patterns: using few-shot for tool ordering. Compliance needs deterministic enforcement — gates, hooks, or an orchestration step that withholds the tool.'
	},
	{
		id: 'ext-14',
		domain: 'd5',
		lesson: 'd5-context-rot',
		stem: 'A 60-page document is sent with the question at the top, and the model misses details from the middle. Which change is most likely to help?',
		options: [
			{
				text: 'Move the document above the question, wrap it in <document> tags, and ask for relevant quotes before answering.',
				why: 'Correct. Long documents belong near the top, and quote extraction grounds the answer.'
			},
			{ text: 'Increase max_tokens.', why: 'Wrong. Output length has nothing to do with input recall.' },
			{ text: 'Move to a 1M-token context model.', why: 'Wrong. It already fits; capacity is not attention.' },
			{ text: 'Split into 60 separate one-page requests.', why: 'Helps with attention but loses cross-page context and costs far more — the ordering fix is cheaper and usually sufficient.' }
		],
		answer: 0,
		explanation:
			'For inputs beyond roughly 20k tokens, put long documents near the top, above the query, and ask Claude to extract relevant quotes into <quotes> tags before answering.'
	},
	{
		id: 'ext-15',
		domain: 'd4',
		lesson: 'd4-tool-anatomy',
		stem: 'An extraction tool is defined with tool_choice set to that tool, and extended thinking is enabled. What happens?',
		options: [
			{
				text: 'It errors — "any" and a named tool are not compatible with extended thinking.',
				why: 'Correct. Only auto and none work with thinking enabled.'
			},
			{ text: 'It works, but thinking is silently disabled.', why: 'Wrong. The conflict is an error, not a silent downgrade.' },
			{ text: 'It works normally.', why: 'Wrong. This incompatibility is a favourite exam trap.' },
			{ text: 'Thinking blocks are stripped from the response.', why: 'Wrong. That is unrelated to tool_choice.' }
		],
		answer: 0,
		explanation:
			'tool_choice any and named-tool modes prefill an assistant turn, which is incompatible with extended thinking. Only auto and none may be combined with it.'
	},
	{
		id: 'ext-16',
		domain: 'd3',
		lesson: 'd3-validation-retry',
		stem: 'How many retry attempts should a validation loop allow before parking a record?',
		options: [
			{
				text: 'Two or three, then route to human review.',
				why: 'Correct. Past that, repeated failures indicate a document or schema problem, not sampling variance.'
			},
			{ text: 'Unlimited, until validation passes.', why: 'Wrong. Burns tokens and eventually produces fabricated data to satisfy the schema.' },
			{ text: 'Exactly one.', why: 'Too tight — a single retry with specific error feedback often succeeds, and a second is cheap.' },
			{ text: 'Ten, to maximise the success rate.', why: 'Wrong. The marginal success rate after three is negligible and the hallucination risk grows.' }
		],
		answer: 0,
		explanation:
			'Cap at two or three. If the same document has failed the same check three times with the errors explained each time, the problem is the document or the schema.'
	}
]);
