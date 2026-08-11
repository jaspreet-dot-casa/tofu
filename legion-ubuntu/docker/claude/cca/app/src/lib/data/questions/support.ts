import { defineQuestions } from './types';

export const support = defineQuestions('support', [
	{
		id: 'sup-01',
		domain: 'd1',
		lesson: 'd1-budgets-and-escalation',
		stem: 'The support agent is handling a customer who has become visibly angry over a delayed refund. The refund is $40, the order is clearly within the 30-day damaged-goods window, and the policy lookup returned an exact match. What should the agent do?',
		options: [
			{
				text: 'Process the refund without escalating.',
				why: 'Correct. The policy is unambiguous and the amount is low. Sentiment is not a policy signal.'
			},
			{
				text: 'Escalate to a human because the customer is frustrated.',
				why: 'Wrong. Customer frustration alone is explicitly not an escalation trigger — escalating here delays a resolution the agent is fully authorised to give.'
			},
			{
				text: 'Ask the model to rate its confidence and escalate if it falls below 0.8.',
				why: 'Wrong on two counts: self-reported confidence is poorly calibrated, and there is no ambiguity here to be uncertain about.'
			},
			{
				text: 'Escalate because refunds are irreversible actions.',
				why: 'Wrong. Irreversibility matters at high value or where policy is unclear; a $40 policy-matched refund is exactly the routine case the agent exists to handle.'
			}
		],
		answer: 0,
		explanation:
			'Escalation triggers are: an explicit request for a human, ambiguous policy, no progress after repeated attempts, or a high-stakes irreversible action. Sentiment is not on the list. Escalating on frustration destroys first-contact resolution for cases the agent could close.'
	},
	{
		id: 'sup-02',
		domain: 'd1',
		lesson: 'd1-budgets-and-escalation',
		stem: 'The team wants the agent to hand off to a human when it is "not sure". Which implementation is correct?',
		options: [
			{
				text: 'Deterministic rules in code: no exact policy match, refund over $500, three failed attempts, or an explicit request for a human.',
				why: 'Correct. These are facts the system owns, evaluated programmatically.'
			},
			{
				text: 'Ask Claude to return a confidence score with each response and escalate below a threshold.',
				why: 'Wrong. Model self-assessment is poorly calibrated — it is confidently wrong on exactly the cases you need to catch.'
			},
			{
				text: 'Instruct the agent in the system prompt to escalate whenever it feels uncertain.',
				why: 'Wrong. This is prompt-based enforcement of something that must be guaranteed, and "feels uncertain" is not a testable criterion.'
			},
			{
				text: 'Add an escalation example to the few-shot block so the pattern is learned.',
				why: 'Wrong. Few-shot shapes the distribution of outputs; it does not enforce a compliance rule.'
			}
		],
		answer: 0,
		explanation:
			'This is the calibration check: any design relying on Claude assessing its own output should be replaced with external validation. Escalation is a compliance requirement, so it belongs in deterministic code evaluating facts the system already has.'
	},
	{
		id: 'sup-03',
		domain: 'd5',
		lesson: 'd5-context-rot',
		stem: 'Twenty turns into a conversation, the agent starts referring to the wrong order number — one mentioned early in the chat. What is the correct fix?',
		options: [
			{
				text: 'Maintain a structured case-facts block at the top of the prompt and re-inject it every turn.',
				why: 'Correct. It moves critical data out of the low-attention middle into the highest-attention region.'
			},
			{
				text: 'Move to a model with a larger context window.',
				why: 'Wrong. The information already fits; the problem is attention, not capacity. A larger window gives more room for material to be ignored.'
			},
			{
				text: 'Instruct the agent to re-read the conversation carefully before each response.',
				why: 'Wrong. Prompt-based mitigation of a positional attention effect — it does not change where the information sits.'
			},
			{
				text: 'Increase max_tokens so the agent can reason more thoroughly.',
				why: 'Wrong. max_tokens bounds output length and has nothing to do with recall of input.'
			}
		],
		answer: 0,
		explanation:
			'Lost-in-the-middle: models attend well to the start and end of a context and poorly to the middle. Extracting established facts into a structured block that is re-injected at the top is the standard remedy.'
	},
	{
		id: 'sup-04',
		domain: 'd1',
		lesson: 'd1-sessions',
		stem: 'A customer calls back the next day about the same unresolved issue. The agent should:',
		options: [
			{
				text: 'Resume the existing session so the full history is available.',
				why: 'Correct. This is genuine continuation of one thread.'
			},
			{
				text: 'Fork the session so the new call does not affect the original.',
				why: 'Wrong. Forking branches away from the original — the follow-up would not update the real case, and it is the same conversation, not an alternative to explore.'
			},
			{
				text: 'Start a fresh session and re-ask the customer for context.',
				why: 'Wrong. Discards state that exists and makes the customer repeat themselves, which is what the persistence is for.'
			},
			{
				text: 'Resume, then immediately compact so the history is smaller.',
				why: 'Partly reasonable but premature — compaction is lossy and should be applied when the context is actually under pressure, not reflexively.'
			}
		],
		answer: 0,
		explanation:
			'Resume continues a session with full history intact. Fork creates an independent branch whose changes never propagate back — right for exploring alternatives, wrong for continuing the same case.'
	},
	{
		id: 'sup-05',
		domain: 'd1',
		lesson: 'd1-workflows-vs-agents',
		stem: 'A proposal suggests replacing the single support agent with a coordinator delegating to separate returns, billing and account subagents. What is the strongest objection?',
		options: [
			{
				text: 'The subtasks share one evolving conversation, so isolated subagents would each work from a stale snapshot.',
				why: 'Correct. Subagent isolation is wrong where state evolves and is shared.'
			},
			{
				text: 'Subagents cannot call tools.',
				why: 'Wrong. Subagents can absolutely have tools — scoping them per role is a benefit of the pattern.'
			},
			{
				text: 'Hub-and-spoke requires at least four subagents to be worthwhile.',
				why: 'Wrong. There is no such threshold; the criteria are independence, parallelisability and context pressure.'
			},
			{
				text: 'The coordinator would not be able to escalate to a human.',
				why: 'Wrong. Escalation is a tool call and works fine from a coordinator.'
			}
		],
		answer: 0,
		explanation:
			'Multi-agent is justified when subtasks are independent, parallelisable and exceed one context window. A support conversation is sequential with shared evolving state — the ~15x token premium buys fragmentation, not capability.'
	},
	{
		id: 'sup-06',
		domain: 'd5',
		lesson: 'd5-prompt-caching',
		stem: 'The agent loads a 30,000-token policy document on every request and costs are climbing. Which change helps most, given customers are waiting in real time?',
		options: [
			{
				text: 'Cache the policy document with a cache_control breakpoint, keeping per-customer content after it.',
				why: 'Correct. Large stable prefix, many hits within a short window — cache reads cost about 10% of base input.'
			},
			{
				text: 'Move the workload to the Batch API for the 50% discount.',
				why: 'Wrong. Batch has no latency SLA and can take up to 24 hours. A customer is waiting.'
			},
			{
				text: 'Put the policy document at the end of the prompt to reduce token count.',
				why: 'Wrong. Position does not change token count, and long documents belong near the top for attention reasons.'
			},
			{
				text: 'Add a cache breakpoint after a header containing the current timestamp.',
				why: 'Wrong. A varying timestamp inside the cached prefix means the prefix never matches — you pay the write premium every request and never get a read.'
			}
		],
		answer: 0,
		explanation:
			'Prompt caching is the cost lever for real-time workloads with a large repeated prefix. Batch is the lever only where nothing is waiting. Never place variable content before a breakpoint.'
	},
	{
		id: 'sup-07',
		domain: 'd4',
		lesson: 'd4-tool-errors',
		stem: 'The order lookup tool returns an empty array both when a customer has no orders and when the order service is unreachable. What goes wrong?',
		options: [
			{
				text: 'The agent tells customers they have no order history when the service is simply down.',
				why: 'Correct. The two cases are indistinguishable to the model, so a failure is reported as a confident fact.'
			},
			{
				text: 'The agent will retry indefinitely because it cannot tell the call failed.',
				why: 'Wrong in the specific — an empty array reads as success, so the agent will not retry at all. That is the problem.'
			},
			{
				text: 'The Claude API will return a 400 for the malformed tool result.',
				why: 'Wrong. An empty array is a structurally valid result; nothing about it is malformed.'
			},
			{
				text: 'Nothing — an empty result is the correct representation of a failed lookup.',
				why: 'Wrong. This is precisely the conflation the design must avoid.'
			}
		],
		answer: 0,
		explanation:
			'Distinguishing a valid empty result from an access failure is a core tool-design requirement. A failure should return isError with a category and retryability; a genuine empty result is a success.'
	},
	{
		id: 'sup-08',
		domain: 'd4',
		lesson: 'd4-tool-anatomy',
		stem: 'The agent keeps calling search_orders when it should call check_refund_policy. What is the intended fix?',
		options: [
			{
				text: 'Sharpen both tool descriptions with explicit boundary statements naming the other tool.',
				why: 'Correct. Descriptions are the primary routing mechanism and the place to disambiguate overlap.'
			},
			{
				text: 'Set tool_choice to force check_refund_policy.',
				why: 'Wrong. Forcing removes the model\'s judgement entirely rather than informing it, and the agent genuinely needs both tools at different moments.'
			},
			{
				text: 'Upgrade to a more capable model.',
				why: 'Wrong. Mis-selection from ambiguous descriptions is a specification problem; a better model still cannot read intent that was never written down.'
			},
			{
				text: 'Rename the tools so they are more distinct.',
				why: 'Wrong emphasis. Selection accuracy depends far more on the description prose than on the name.'
			}
		],
		answer: 0,
		explanation:
			'Anthropic describes the tool description as by far the most important factor in tool performance. Three to four sentences covering purpose, when to use, when NOT to use, and caveats resolves most mis-selection.'
	},
	{
		id: 'sup-09',
		domain: 'd1',
		lesson: 'd1-agentic-loop',
		stem: 'The agent loop is written as `while (response.stop_reason === "tool_use") { … }`. What failure does this design allow?',
		options: [
			{
				text: 'A response truncated by max_tokens is treated as a completed answer and sent to the customer.',
				why: 'Correct. Any stop_reason other than tool_use exits the loop and is treated as success.'
			},
			{
				text: 'The loop never terminates because end_turn is not handled.',
				why: 'Wrong. end_turn exits the loop correctly — it is the other values that are mishandled.'
			},
			{
				text: 'Tool results are appended in the wrong order.',
				why: 'Wrong. Ordering of tool_result blocks is a separate concern and not affected by the loop condition.'
			},
			{
				text: 'Parallel tool calls are silently dropped.',
				why: 'Wrong. Handling multiple tool_use blocks in a response is independent of the loop condition.'
			}
		],
		answer: 0,
		explanation:
			'Always branch on the full set of stop_reason values. max_tokens means the answer is truncated and refusal means Claude declined — both look like successful completion to a loop that only checks for tool_use.'
	},
	{
		id: 'sup-10',
		domain: 'd3',
		lesson: 'd3-explicit-criteria',
		stem: 'The system prompt says "be conservative about issuing refunds". Reviewers find behaviour inconsistent. The best fix is:',
		options: [
			{
				text: 'Replace it with testable criteria, e.g. "issue refunds up to $200 when the policy lookup returns an exact match; otherwise escalate".',
				why: 'Correct. Each clause can be mechanically checked against any given decision.'
			},
			{
				text: 'Add "be very conservative" for emphasis.',
				why: 'Wrong. Intensifying a vague instruction does not make it gradeable.'
			},
			{
				text: 'Add three examples of conservative refusals.',
				why: 'Partly useful, but examples without an explicit rule leave the boundary undefined — the model interpolates rather than applying a criterion.'
			},
			{
				text: 'Lower the temperature so responses are more consistent.',
				why: 'Wrong. Consistency of an underspecified instruction just means being consistently arbitrary.'
			}
		],
		answer: 0,
		explanation:
			'If you cannot look at an output and mechanically decide whether it satisfied the instruction, it is not a criterion. Replacing vague guidance with explicit, testable criteria is the highest-yield prompt fix.'
	},
	{
		id: 'sup-11',
		domain: 'd5',
		lesson: 'd5-errors-and-retries',
		stem: 'The order service intermittently returns 429 and 503. How should the agent tooling respond?',
		options: [
			{
				text: 'Retry with exponential backoff, honouring Retry-After on 429, and open a circuit breaker after repeated consecutive failures.',
				why: 'Correct. Both are transient and retryable; the breaker stops hammering a struggling dependency.'
			},
			{
				text: 'Retry all failures uniformly, including 400 and 403.',
				why: 'Wrong. 4xx other than 429 means the request itself is wrong — retrying reproduces the same error more expensively.'
			},
			{
				text: 'Return an empty result so the conversation can continue smoothly.',
				why: 'Wrong. Silent failure — the agent cannot distinguish this from "no orders" and will mislead the customer.'
			},
			{
				text: 'Escalate to a human on the first 429.',
				why: 'Wrong. A rate limit is transient and self-resolving; escalating each one would flood the queue.'
			}
		],
		answer: 0,
		explanation:
			'Retryable: 429, 500, 504, 529. Not retryable: 400, 401, 402, 403, 404, 413. Honour Retry-After on 429, and log the request-id header for anything you may need to debug later.'
	},
	{
		id: 'sup-12',
		domain: 'd1',
		lesson: 'd1-budgets-and-escalation',
		stem: 'Which of these should NOT, on its own, trigger escalation to a human?',
		options: [
			{
				text: 'The task is complex, but the applicable policy is clear.',
				why: 'Correct — this is the one that should not escalate. Complicated and ambiguous are different things.'
			},
			{
				text: 'The customer explicitly asks to speak to a person.',
				why: 'This is a valid trigger.'
			},
			{
				text: 'The policy lookup returns no matching rule.',
				why: 'This is a valid trigger — genuine ambiguity.'
			},
			{
				text: 'The action would permanently delete the customer account.',
				why: 'This is a valid trigger — irreversible and high-stakes.'
			}
		],
		answer: 0,
		explanation:
			'Complexity is not ambiguity. Where policy is clear, the agent should resolve the case however involved it is — escalating on complexity alone is what destroys first-contact resolution.'
	},
	{
		id: 'sup-13',
		domain: 'd5',
		lesson: 'd5-compaction-and-editing',
		stem: 'A support conversation has run long enough that the context is nearly full, but every turn still matters. Which mechanism fits?',
		options: [
			{
				text: 'Compaction — summarise earlier turns server-side so the conversation can continue.',
				why: 'Correct. The symptom is a long conversation, which is exactly what compaction addresses.'
			},
			{
				text: 'Context editing to clear old tool results.',
				why: 'Wrong for this symptom. That targets bulky tool output, not conversational length. It would help if the pressure came from large tool payloads.'
			},
			{
				text: 'Retrieval, fetching only the relevant turns.',
				why: 'Wrong. RAG addresses a large external corpus, not the live conversation.'
			},
			{
				text: 'Fork the session to reset the context.',
				why: 'Wrong. A fork copies the current state — it does not shrink it.'
			}
		],
		answer: 0,
		explanation:
			'Match the tool to the symptom: long conversation means compaction, bulky tool results mean context editing, large corpus means retrieval. Persist anything a summary would lose with a PreCompact hook first.'
	},
	{
		id: 'sup-14',
		domain: 'd4',
		lesson: 'd4-tool-scoping',
		stem: 'The agent currently has 21 tools and picks the wrong one roughly a fifth of the time. Best remedy?',
		options: [
			{
				text: 'Split the work across subagents, each scoped to four or five tools.',
				why: 'Correct. It restores routing accuracy and gives least privilege at the same time.'
			},
			{
				text: 'Keep all 21 but write much longer descriptions.',
				why: 'Descriptions matter enormously, but past roughly 18 tools selection accuracy degrades regardless — this treats a symptom while leaving the cause.'
			},
			{
				text: 'Force tool_choice on the most common tool.',
				why: 'Wrong. It removes selection rather than improving it, and breaks every case needing a different tool.'
			},
			{
				text: 'Merge all 21 into one tool with an action parameter.',
				why: 'Wrong. A tool that does 21 things cannot have an honest description, which makes selection worse, not better.'
			}
		],
		answer: 0,
		explanation:
			'Four to five tools per agent is the sweet spot; accuracy degrades past roughly 18. Universal tool access is one of the seven anti-patterns — the fix is decomposition into role-scoped subagents.'
	},
	{
		id: 'sup-15',
		domain: 'd3',
		lesson: 'd3-structured-output',
		stem: 'The agent must emit a structured resolution record for every closed case, and downstream systems break on malformed JSON. Which approach guarantees valid structure?',
		options: [
			{
				text: 'Structured Outputs with a JSON schema, or a forced tool call with strict: true.',
				why: 'Correct. Constrained sampling guarantees schema-valid output.'
			},
			{
				text: 'Prefill the assistant turn with an opening brace.',
				why: 'Wrong. Prefill returns a 400 on Claude 4.6+ models. It is always a trap option.'
			},
			{
				text: 'Instruct the model firmly to reply with valid JSON only.',
				why: 'Wrong. Probabilistic where the requirement is a guarantee.'
			},
			{
				text: 'Parse the response and repair malformed JSON in post-processing.',
				why: 'Wrong as a primary answer — repairing malformed output is a workaround for not having constrained it in the first place.'
			}
		],
		answer: 0,
		explanation:
			'Structured Outputs and forced tool use with strict schemas guarantee syntax. Neither guarantees semantics — a hallucinated value is perfectly schema-valid, so validation still belongs downstream.'
	},
	{
		id: 'sup-16',
		domain: 'd1',
		lesson: 'd1-budgets-and-escalation',
		stem: 'The team wants a hard limit on how much any single conversation can cost. What is the correct implementation?',
		options: [
			{
				text: 'Track cumulative tokens in the loop; inject a wrap-up instruction at 80% and stop programmatically at 100%.',
				why: 'Correct. The polite wrap-up handles the graceful case; the code stop provides the guarantee.'
			},
			{
				text: 'Add an instruction telling the agent to be concise and stop when it has spent enough.',
				why: 'Wrong. Prompt-based enforcement of a hard limit — the model has no reliable view of cumulative spend.'
			},
			{
				text: 'Set max_tokens low enough that no single response can be expensive.',
				why: 'Wrong. max_tokens bounds one response, not the cumulative cost of a long loop.'
			},
			{
				text: 'Rely on the model context window filling up to end the conversation.',
				why: 'Wrong. That is a capacity limit hit by accident, not a budget, and it produces a failure rather than a graceful conclusion.'
			}
		],
		answer: 0,
		explanation:
			'The 80/100 pattern: ask for a graceful wrap-up at 80% of budget, enforce the stop in code at 100%. Track input plus output tokens across the whole loop, not per request.'
	}
]);
