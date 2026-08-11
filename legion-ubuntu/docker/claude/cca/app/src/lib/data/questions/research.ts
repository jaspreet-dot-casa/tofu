import { defineQuestions } from './types';

export const research = defineQuestions('research', [
	{
		id: 'res-01',
		domain: 'd1',
		lesson: 'd1-subagent-isolation',
		stem: 'The coordinator establishes in turn 3 that the review must cover only papers after 2024. It then delegates to the analysis subagent. What does that subagent know about the date constraint?',
		options: [
			{
				text: 'Nothing, unless the coordinator writes it into the delegation prompt.',
				why: 'Correct. A subagent starts with a fresh context window and inherits no conversation history.'
			},
			{
				text: 'It inherits the coordinator\'s full conversation history automatically.',
				why: 'Wrong, and it is the single most common misconception in this domain.'
			},
			{
				text: 'It receives a summary of the coordinator\'s context automatically.',
				why: 'Wrong. There is no automatic summarisation downward; the only channel is the prompt string.'
			},
			{
				text: 'It can query the coordinator for context mid-task.',
				why: 'Wrong. Communication is one delegation in, one final message out.'
			}
		],
		answer: 0,
		explanation:
			'Subagent context isolation: a fresh window, nothing inherited, only the final message returned. Everything needed must be passed explicitly in the invoking prompt.'
	},
	{
		id: 'res-02',
		domain: 'd1',
		lesson: 'd1-hub-and-spoke',
		stem: 'The analysis subagent needs a document the search subagent found. How does it get it?',
		options: [
			{
				text: 'The coordinator receives search\'s result and includes it in the analysis delegation.',
				why: 'Correct. All communication routes through the hub.'
			},
			{
				text: 'The search subagent passes it directly to the analysis subagent.',
				why: 'Wrong. Hub-and-spoke has no lateral edges — spokes never talk to each other.'
			},
			{
				text: 'Both subagents share a context window scoped to the task.',
				why: 'Wrong. Each has its own isolated window; that is the point of the architecture.'
			},
			{
				text: 'The analysis subagent re-runs the search itself.',
				why: 'Wasteful and non-deterministic — it may not find the same document, and it duplicates work already paid for.'
			}
		],
		answer: 0,
		explanation:
			'The coordinator is the hub and manages all communication. If B needs what A found, the coordinator receives A\'s output and passes it into B\'s prompt.'
	},
	{
		id: 'res-03',
		domain: 'd5',
		lesson: 'd5-errors-and-retries',
		stem: 'One of four search subagents fails because its API token expired. What should it return to the coordinator?',
		options: [
			{
				text: 'Structured error context: what failed, why, whether it is retryable, what partial results exist, and what alternatives remain.',
				why: 'Correct. The coordinator can then retry, route around, or degrade and say so.'
			},
			{
				text: 'An empty result set, so the other three can continue cleanly.',
				why: 'Wrong. Silent failure — indistinguishable from having searched and found nothing, which becomes a false claim in the report.'
			},
			{
				text: 'A generic "an error occurred" string.',
				why: 'Wrong. Nothing in it supports a recovery decision.'
			},
			{
				text: 'It should retry indefinitely until the token is refreshed.',
				why: 'Wrong. An expired token is not transient — retrying reproduces the same failure forever.'
			}
		],
		answer: 0,
		explanation:
			'Silent subagent failure is one of the seven anti-patterns. Isolation contains a failure only if the failure is reported; otherwise the coordinator synthesises a report asserting something nobody checked.'
	},
	{
		id: 'res-04',
		domain: 'd1',
		lesson: 'd1-budgets-and-escalation',
		stem: 'Which combination justifies a multi-agent architecture over a single agent?',
		options: [
			{
				text: 'High-value work, genuinely independent parallelisable subtasks, and a total volume exceeding one context window.',
				why: 'Correct — all three must hold.'
			},
			{
				text: 'The task is large and important.',
				why: 'Wrong. Size and importance alone do not make subtasks independent, and a large sequential task is a bad fit.'
			},
			{
				text: 'The task involves more than five distinct tools.',
				why: 'Tool count is a reason to split tools across subagents, not by itself a reason for a multi-agent research architecture.'
			},
			{
				text: 'Latency must be minimised.',
				why: 'Backwards. Multi-agent adds coordination latency; it is chosen despite that, not because of it.'
			}
		],
		answer: 0,
		explanation:
			'Multi-agent costs roughly 15x the tokens of plain chat, against about 4x for a single agent. Anthropic\'s own research system beat single-agent Opus by around 90% on their internal evaluation — but only because all three conditions held.'
	},
	{
		id: 'res-05',
		domain: 'd5',
		lesson: 'd5-provenance-and-review',
		stem: 'Two sources give conflicting figures for the same statistic. What should the report do?',
		options: [
			{
				text: 'Present both figures with their respective attributions and note the conflict.',
				why: 'Correct. Silent resolution destroys the information that there was a disagreement.'
			},
			{
				text: 'Use the more recent source and omit the older one.',
				why: 'Recency is one input, but dropping the conflict hides a fact the reader needs.'
			},
			{
				text: 'Average the two figures.',
				why: 'Wrong. Fabricates a number that no source supports.'
			},
			{
				text: 'Ask the model which source it trusts more and use that one.',
				why: 'Wrong. Model self-assessment again — and it discards the conflict either way.'
			}
		],
		answer: 0,
		explanation:
			'Provenance requires claim-to-source mapping — source, excerpt, date, and whether the claim is a quote, paraphrase or inference. Conflicting sources get both attributions.'
	},
	{
		id: 'res-06',
		domain: 'd1',
		lesson: 'd1-composable-patterns',
		stem: 'The coordinator does not know in advance how many sources exist or what specialisations will be needed; it decides at run time and then combines the results. Which pattern is this?',
		options: [
			{
				text: 'Orchestrator-workers.',
				why: 'Correct. The defining property is that subtasks are determined dynamically, then synthesised.'
			},
			{
				text: 'Parallelisation by sectioning.',
				why: 'Wrong. Sectioning splits a set of subtasks known up front.'
			},
			{
				text: 'Prompt chaining.',
				why: 'Wrong. Chaining is a fixed sequence of known steps.'
			},
			{
				text: 'Evaluator-optimiser.',
				why: 'Wrong. That is a generate-and-critique refinement loop.'
			}
		],
		answer: 0,
		explanation:
			'If the subtasks can be listed before work starts, it is sectioning and no orchestrator is needed. Paying for a coordinator to rediscover a list you already had is over-engineering.'
	},
	{
		id: 'res-07',
		domain: 'd1',
		lesson: 'd1-hub-and-spoke',
		stem: 'What are the coordinator\'s responsibilities?',
		options: [
			{
				text: 'Decompose the task, delegate with the right context, and synthesise the returned summaries.',
				why: 'Correct — exactly three jobs.'
			},
			{
				text: 'Decompose, delegate, and independently verify each subagent\'s findings by redoing the work.',
				why: 'Wrong. Redoing the work reintroduces the context pressure the subagents relieve.'
			},
			{
				text: 'Read all source material itself, then delegate analysis.',
				why: 'Wrong. That puts everything back in the coordinator\'s window, defeating the architecture.'
			},
			{
				text: 'Maintain a shared context that all subagents read from.',
				why: 'Wrong. There is no shared context — each subagent has its own isolated window.'
			}
		],
		answer: 0,
		explanation:
			'Decompose, delegate, synthesise. Doing the work is explicitly not on the list — a coordinator that reads everything itself has no reason to exist.'
	},
	{
		id: 'res-08',
		domain: 'd5',
		lesson: 'd5-context-rot',
		stem: 'The synthesis agent receives twelve long summaries and consistently misses details from the middle ones. Best fix?',
		options: [
			{
				text: 'Extract the key findings from each summary into a structured block at the top, or synthesise in smaller focused batches.',
				why: 'Correct. Addresses the positional attention effect directly.'
			},
			{
				text: 'Move synthesis to a model with a 1M-token context window.',
				why: 'Wrong. Everything already fits; a larger window makes more room for material to be ignored.'
			},
			{
				text: 'Instruct the agent to read every summary carefully.',
				why: 'Wrong. A prompt cannot change where information sits in the context.'
			},
			{
				text: 'Concatenate the summaries into one document to reduce structural overhead.',
				why: 'Wrong. It makes the middle larger, which is the opposite of the fix.'
			}
		],
		answer: 0,
		explanation:
			'Lost in the middle. The remedies are extraction to the top, trimming, and splitting into focused passes — never simply more capacity.'
	},
	{
		id: 'res-09',
		domain: 'd1',
		lesson: 'd1-subagent-isolation',
		stem: 'Which situation is a POOR fit for subagent delegation?',
		options: [
			{
				text: 'Subtasks that must see each other\'s work as it develops, each step depending on what the last just learned.',
				why: 'Correct. Isolation means each agent works from a stale snapshot.'
			},
			{
				text: 'Reading twelve independent files and summarising each.',
				why: 'A good fit — independent and parallelisable.'
			},
			{
				text: 'Searching four separate source databases.',
				why: 'A good fit — independent work with no shared state.'
			},
			{
				text: 'Running the same security review three times for a confidence vote.',
				why: 'A good fit — this is voting-style parallelisation.'
			}
		],
		answer: 0,
		explanation:
			'Subagents are wrong for shared evolving state. That is a single agent with one continuous context, or a sequential workflow.'
	},
	{
		id: 'res-10',
		domain: 'd5',
		lesson: 'd5-errors-and-retries',
		stem: 'A long research run crashes at step 7 of 10. What design lets it resume rather than restart?',
		options: [
			{
				text: 'A crash-recovery manifest checkpointed to JSON: workflow id, completed steps, pending steps, intermediate results, timestamp.',
				why: 'Correct. On resume, load it and inject it into the new prompt.'
			},
			{
				text: 'Resuming the session with --resume.',
				why: 'Helps with conversational continuity but does not capture structured workflow state, and the crash may have left the session unusable.'
			},
			{
				text: 'A larger max_turns so the run does not stop early.',
				why: 'Wrong. It did not stop early; it crashed.'
			},
			{
				text: 'Re-running with a more capable model.',
				why: 'Wrong. Nothing about model capability makes a crashed run resumable.'
			}
		],
		answer: 0,
		explanation:
			'The recovery question: could this recover at 3am with no human present? Checkpointing intermediate results to a manifest is the concrete answer.'
	},
	{
		id: 'res-11',
		domain: 'd4',
		lesson: 'd4-tool-scoping',
		stem: 'How should tools be distributed across the research system?',
		options: [
			{
				text: 'Scoped per role — search gets web_search and Grep; analysis gets Read; reporting gets Write; the coordinator gets only delegation.',
				why: 'Correct. Least privilege plus better routing.'
			},
			{
				text: 'Every agent gets every tool for maximum flexibility.',
				why: 'Wrong. Universal tool access is one of the seven anti-patterns — it degrades selection accuracy and widens blast radius.'
			},
			{
				text: 'Only the coordinator has tools; subagents return requests for it to execute.',
				why: 'Wrong. That funnels all work back through the coordinator and destroys the parallelism.'
			},
			{
				text: 'Tools are assigned dynamically by the coordinator at run time.',
				why: 'Not the mechanism — tool sets are declared per subagent definition.'
			}
		],
		answer: 0,
		explanation:
			'Scope tools to agent roles, four or five each. Note the coordinator in particular: give it the workers\' tools and it will do the work itself.'
	},
	{
		id: 'res-12',
		domain: 'd1',
		lesson: 'd1-agentic-loop',
		stem: 'The coordinator needs to run three independent searches concurrently. How?',
		options: [
			{
				text: 'Issue all three delegations in a single response.',
				why: 'Correct. Multiple delegation calls in one turn run in parallel.'
			},
			{
				text: 'Delegate once and let that subagent spawn the other two.',
				why: 'Wrong. That creates a nested topology and breaks hub-and-spoke.'
			},
			{
				text: 'Delegate sequentially and rely on caching to make it fast.',
				why: 'Wrong. Sequential is sequential; caching does not parallelise anything.'
			},
			{
				text: 'Set disable_parallel_tool_use to false.',
				why: 'That flag governs parallel tool calls generally, but the mechanism being asked about is issuing several delegations in one response.'
			}
		],
		answer: 0,
		explanation:
			'Parallel delegation is several calls in a single response. Sequential delegation is waiting for one result before deciding the next — required only when there is a genuine dependency.'
	},
	{
		id: 'res-13',
		domain: 'd5',
		lesson: 'd5-provenance-and-review',
		stem: 'The final report must distinguish what sources actually said from what the system concluded. What does this require?',
		options: [
			{
				text: 'Labelling every claim as a direct quote, a paraphrase or an inference, with its source and date.',
				why: 'Correct. An inference presented like a quote is how a system produces something defensible-looking that no source said.'
			},
			{
				text: 'A confidence score on each claim.',
				why: 'Wrong. Self-reported confidence is poorly calibrated, and it does not answer the question of what the source said.'
			},
			{
				text: 'A bibliography at the end of the report.',
				why: 'Insufficient. It shows what was consulted, not which claim rests on which source.'
			},
			{
				text: 'Restricting the report to direct quotes only.',
				why: 'Over-restrictive — synthesis is the point of the system; it just has to be labelled.'
			}
		],
		answer: 0,
		explanation:
			'Provenance means claim-to-source mapping with the kind of claim made explicit. Distinguishing quote from paraphrase from inference is the part most implementations skip.'
	},
	{
		id: 'res-14',
		domain: 'd3',
		lesson: 'd3-multi-pass-review',
		stem: 'A single quality reviewer intermittently misses issues in the synthesised report. Which pattern raises confidence?',
		options: [
			{
				text: 'Voting — run the review several times independently and act on what a majority flags.',
				why: 'Correct. This is the voting flavour of parallelisation, for exactly this situation.'
			},
			{
				text: 'Sectioning — split the report into parts and review each once.',
				why: 'Helps with attention but does not address intermittency within a single judgement.'
			},
			{
				text: 'Ask the same reviewer instance to check its own review.',
				why: 'Wrong. Generator bias — it retains the reasoning that produced the miss.'
			},
			{
				text: 'Increase the effort parameter on the single review.',
				why: 'May help marginally but does not give the independence that makes voting work.'
			}
		],
		answer: 0,
		explanation:
			'Sectioning is different work run at once; voting is the same work run several times to raise confidence. Intermittent misses on one judgement point at voting.'
	},
	{
		id: 'res-15',
		domain: 'd5',
		lesson: 'd5-compaction-and-editing',
		stem: 'The coordinator\'s context is dominated by large tool result payloads from earlier delegations. Which mechanism fits?',
		options: [
			{
				text: 'Context editing with clear_tool_uses, keeping the most recent few.',
				why: 'Correct. The symptom is bulky tool output, which is what this targets.'
			},
			{
				text: 'Compaction of the whole conversation.',
				why: 'Broader than needed — it would summarise the coordinator\'s own reasoning too, when only the payloads are the problem.'
			},
			{
				text: 'Retrieval over the tool results.',
				why: 'Wrong shape. RAG addresses a large external corpus, not results already in context.'
			},
			{
				text: 'Restarting with a fresh coordinator.',
				why: 'Wrong. Discards the synthesis state that the coordinator exists to hold.'
			}
		],
		answer: 0,
		explanation:
			'clear_tool_uses_20250919 clears old tool results past a trigger, with keep, clear_at_least and exclude_tools options. Compaction is for long conversations; context editing is surgical.'
	},
	{
		id: 'res-16',
		domain: 'd1',
		lesson: 'd1-budgets-and-escalation',
		stem: 'How should a research run be evaluated before going to production?',
		options: [
			{
				text: 'Around twenty representative queries scored by an independent LLM judge on accuracy, completeness, citations and efficiency, plus human review of a sample.',
				why: 'Correct — small, actually-run eval sets beat large aspirational ones.'
			},
			{
				text: 'A single end-to-end smoke test.',
				why: 'Insufficient to reveal systematic weaknesses across query types.'
			},
			{
				text: 'Have the coordinator score its own output at the end of each run.',
				why: 'Wrong. Self-assessment again — poorly calibrated and biased by its own reasoning.'
			},
			{
				text: 'Several hundred queries before any deployment.',
				why: 'A large set you never actually run is worth less than twenty you do; scale up after the obvious failures are fixed.'
			}
		],
		answer: 0,
		explanation:
			'Start with roughly twenty representative queries and LLM-as-judge scoring plus human review. The judge must be independent of the generator, for the same reason a reviewer must be.'
	}
]);
