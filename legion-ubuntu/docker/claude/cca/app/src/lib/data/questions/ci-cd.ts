import { defineQuestions } from './types';

export const cicd = defineQuestions('ci-cd', [
	{
		id: 'ci-01',
		domain: 'd2',
		lesson: 'd2-headless-ci',
		stem: 'A pipeline job invoking Claude Code hangs indefinitely. Which flag was almost certainly missing?',
		options: [
			{ text: '-p (or --print) for non-interactive mode.', why: 'Correct. Without it the process waits for input that never arrives.' },
			{ text: '--max-turns.', why: 'Wrong. That bounds the number of turns, not whether it waits for input.' },
			{ text: '--output-format json.', why: 'Wrong. That controls the shape of the output, not interactivity.' },
			{ text: '--bare.', why: 'Wrong. That skips auto-discovery; it does not make the run non-interactive.' }
		],
		answer: 0,
		explanation:
			'-p / --print is the non-interactive flag. It is the first thing to check on any hanging headless run.'
	},
	{
		id: 'ci-02',
		domain: 'd2',
		lesson: 'd2-permission-modes',
		stem: 'Which permission mode is appropriate for a CI job on a shared runner?',
		options: [
			{
				text: 'dontAsk, with an explicit --allowedTools list.',
				why: 'Correct. It fails closed: only pre-approved rules and read-only commands are permitted, everything else is denied rather than prompted.'
			},
			{
				text: 'bypassPermissions, since no human is present.',
				why: 'Wrong. That is for isolated, disposable containers. A shared runner is not one.'
			},
			{
				text: 'default, so unexpected actions are surfaced.',
				why: 'Wrong. Surfacing means prompting, and a prompt with nobody to answer it hangs the job.'
			},
			{
				text: 'acceptEdits, so the job can make changes.',
				why: 'Wrong. It auto-approves edits and common filesystem commands, which is broader than a review job should have.'
			}
		],
		answer: 0,
		explanation:
			'dontAsk denies rather than prompting, which is exactly what you want where no human can answer. Reserve bypassPermissions for isolated containers.'
	},
	{
		id: 'ci-03',
		domain: 'd2',
		lesson: 'd2-headless-ci',
		stem: 'The same review command produces different results on different CI runners. Which flag addresses this?',
		options: [
			{
				text: '--bare, which skips auto-discovery of hooks, skills, plugins, MCP, auto memory and CLAUDE.md.',
				why: 'Correct. The run then depends only on what you passed it.'
			},
			{
				text: '--max-turns, to bound variability.',
				why: 'Wrong. Bounding turns does not remove environmental differences.'
			},
			{
				text: '--output-format json.',
				why: 'Wrong. Formatting the output does not change what influenced it.'
			},
			{
				text: 'Lowering temperature.',
				why: 'Wrong. The variability described is environmental, not sampling noise.'
			}
		],
		answer: 0,
		explanation:
			'--bare is the reproducibility flag. It also starts faster, since there is no discovery pass.'
	},
	{
		id: 'ci-04',
		domain: 'd3',
		lesson: 'd3-multi-pass-review',
		stem: 'A pipeline generates code and then reviews it in the same session. Reviews consistently pass code with real defects. Why?',
		options: [
			{
				text: 'Generator bias — the reviewer carries the reasoning that produced the defect, so it looks correct.',
				why: 'Correct.'
			},
			{ text: 'The review prompt is not specific enough.', why: 'May also be true, but it does not explain the systematic pattern of missing its own defects.' },
			{ text: 'The context window overflowed.', why: 'Wrong. Nothing in the scenario indicates capacity pressure.' },
			{ text: 'Reviews need a larger max_tokens.', why: 'Wrong. Output length is unrelated.' }
		],
		answer: 0,
		explanation:
			'Independent review means a separate session without the generator\'s context. Self-review catches formatting slips and little else.'
	},
	{
		id: 'ci-05',
		domain: 'd3',
		lesson: 'd3-multi-pass-review',
		stem: 'A review pipeline runs one pass over the whole diff. It catches style issues but misses that a function signature change broke three callers. What is missing?',
		options: [
			{
				text: 'A cross-file pass — per-file review alone cannot see integration issues.',
				why: 'Correct. Note the scenario is the mirror image: one whole-diff pass also under-attends to each file.'
			},
			{ text: 'A more capable model.', why: 'Wrong. The structure of the review is the problem, not raw capability.' },
			{ text: 'A larger context window.', why: 'Wrong. Capacity does not fix attention spread across a large diff.' },
			{ text: 'Stricter output schema.', why: 'Wrong. A schema shapes the report; it does not make the reviewer notice more.' }
		],
		answer: 0,
		explanation:
			'The pattern is per-file passes for local defects plus one cross-file pass for integration defects. Neither substitutes for the other.'
	},
	{
		id: 'ci-06',
		domain: 'd3',
		lesson: 'd3-structured-output',
		stem: 'The pipeline must fail the build when any high-severity finding exists. What does the review job need to emit?',
		options: [
			{
				text: 'Schema-validated structured output with a severity field per finding, using --output-format json and --json-schema.',
				why: 'Correct. The pipeline can branch deterministically on it.'
			},
			{
				text: 'A prose summary that the pipeline greps for the word "high".',
				why: 'Wrong. Fragile string matching over unconstrained prose.'
			},
			{
				text: 'A JSON blob produced by instructing the model to reply with JSON only.',
				why: 'Wrong. Probabilistic — one malformed response breaks the build for the wrong reason.'
			},
			{
				text: 'A prefilled assistant turn starting with a brace.',
				why: 'Wrong. Prefill returns a 400 on Claude 4.6+ models.'
			}
		],
		answer: 0,
		explanation:
			'Structured output is what makes a review actionable. Free text can only be pasted into a comment and hoped over.'
	},
	{
		id: 'ci-07',
		domain: 'd2',
		lesson: 'd2-headless-ci',
		stem: 'Two PR review jobs run concurrently and each report includes findings about the other PR. What went wrong?',
		options: [
			{
				text: 'The jobs shared a session, leaking one PR\'s context into the other.',
				why: 'Correct.'
			},
			{ text: 'The MCP server was misconfigured.', why: 'Wrong. Cross-contamination of conversational context is a session problem.' },
			{ text: 'The context window was exceeded.', why: 'Wrong. That produces truncation or an error, not another PR\'s content.' },
			{ text: 'The runners shared a filesystem.', why: 'Would explain file confusion, not conversational context bleeding between reviews.' }
		],
		answer: 0,
		explanation:
			'Each pipeline job gets a fresh session. Use --resume deliberately within a job if you need continuity, never across jobs.'
	},
	{
		id: 'ci-08',
		domain: 'd5',
		lesson: 'd5-prompt-caching',
		stem: 'The review job sends a 25,000-token standards document with every PR. How should cost be reduced?',
		options: [
			{
				text: 'Cache the standards document with a cache_control breakpoint, keeping the diff after it.',
				why: 'Correct. Large stable prefix, many hits — reads cost roughly 10% of base input.'
			},
			{
				text: 'Move review jobs to the Batch API for the 50% discount.',
				why: 'Wrong. A PR check is a blocking workflow, and Batch has no latency guarantee.'
			},
			{
				text: 'Put the diff before the standards document so the cache covers more.',
				why: 'Backwards. The diff varies per PR, so anything after it is uncacheable.'
			},
			{
				text: 'Add a timestamp header to the cached block for cache freshness.',
				why: 'Wrong. A varying timestamp inside the prefix means it never matches — you pay the write premium every time and never get a read.'
			}
		],
		answer: 0,
		explanation:
			'Cache stable content, put variable content after the breakpoint. Reads are ~0.1x base input; 5-minute writes are ~1.25x, one-hour writes 2x.'
	},
	{
		id: 'ci-09',
		domain: 'd2',
		lesson: 'd2-hooks',
		stem: 'A commit must never be created if a secret is detected in the diff. What implements this?',
		options: [
			{
				text: 'A PreToolUse hook that scans and exits 2 to block, or a permissions.deny rule.',
				why: 'Correct — the mechanisms that deterministically guarantee something cannot happen.'
			},
			{
				text: 'A CLAUDE.md instruction never to commit secrets.',
				why: 'Wrong. Guidance, and "never" is a guarantee.'
			},
			{
				text: 'A PostToolUse hook that reverts the commit afterwards.',
				why: 'Weaker — the secret briefly exists in history, and reverting is not the same as preventing.'
			},
			{
				text: 'Few-shot examples of refusing to commit secrets.',
				why: 'Wrong. Examples do not enforce compliance.'
			}
		],
		answer: 0,
		explanation:
			'When a scenario says never, always, or guaranteed, the answer is a hook or a permission rule. Note exit 2 is what blocks — exit 1 does not.'
	},
	{
		id: 'ci-10',
		domain: 'd2',
		lesson: 'd2-settings-precedence',
		stem: 'CI must be able to run the test suite but never push to a remote. What is the most robust configuration?',
		options: [
			{
				text: 'An explicit allow for the test command plus a deny on push, with dontAsk mode.',
				why: 'Correct. Deny merges across scopes and applies even under bypassPermissions.'
			},
			{
				text: 'An allow list containing only the test command, with no deny rule.',
				why: 'Weaker. It relies on the allow list being exhaustive; a deny states the prohibition explicitly and survives scope changes.'
			},
			{
				text: 'A CLAUDE.md note that pushes are forbidden in CI.',
				why: 'Wrong. Guidance, not enforcement.'
			},
			{
				text: 'bypassPermissions with a PostToolUse hook that undoes pushes.',
				why: 'Wrong. Undoing a push after the fact is not prevention.'
			}
		],
		answer: 0,
		explanation:
			'Permission rules merge across every scope and deny rules apply even in bypassPermissions. Stating the prohibition explicitly is more robust than relying on omission from an allow list.'
	},
	{
		id: 'ci-11',
		domain: 'd5',
		lesson: 'd5-errors-and-retries',
		stem: 'The review job intermittently fails with 529 overloaded_error. What is the correct handling?',
		options: [
			{
				text: 'Retry with exponential backoff; 529 is transient.',
				why: 'Correct.'
			},
			{ text: 'Fail the build immediately and require a human rerun.', why: 'Unnecessarily brittle for a transient, self-resolving condition.' },
			{ text: 'Retry immediately in a tight loop.', why: 'Wrong. No backoff makes an overload worse.' },
			{ text: 'Treat it like a 400 and fix the request.', why: 'Wrong. 400 means the request is malformed; 529 means the service is busy.' }
		],
		answer: 0,
		explanation:
			'Retryable: 429, 500, 504, 529 — with exponential backoff, honouring Retry-After on 429. Not retryable: 400, 401, 402, 403, 404, 413.'
	},
	{
		id: 'ci-12',
		domain: 'd5',
		lesson: 'd5-errors-and-retries',
		stem: 'A production CI failure needs to be reported to support. Which artefact matters most?',
		options: [
			{
				text: 'The request-id header from the failing response.',
				why: 'Correct. It appears as request_id in error JSON and on SDK response objects.'
			},
			{ text: 'The full prompt text.', why: 'Useful context, but not the identifier support will ask for.' },
			{ text: 'The session id.', why: 'Useful for local reproduction; it does not identify the specific API call.' },
			{ text: 'The exit code of the job.', why: 'Tells you it failed, not which call failed or why.' }
		],
		answer: 0,
		explanation:
			'Log request-id on every request, not just failures — you cannot retroactively capture the id of a call that already went wrong.'
	},
	{
		id: 'ci-13',
		domain: 'd2',
		lesson: 'd2-headless-ci',
		stem: 'Which flag pairing best expresses least privilege for a read-only review job?',
		options: [
			{
				text: '--allowedTools "Read,Grep,Glob" with --permission-mode dontAsk.',
				why: 'Correct. Exactly the tools needed, and everything else denied.'
			},
			{
				text: '--dangerously-skip-permissions with a careful prompt.',
				why: 'Wrong. A prompt is not a privilege boundary.'
			},
			{
				text: '--allowedTools "*" with a deny rule on Write.',
				why: 'Weaker. Allowing everything then subtracting is the opposite of least privilege.'
			},
			{
				text: '--max-turns 5.',
				why: 'Bounds the run but says nothing about what it may do within those turns.'
			}
		],
		answer: 0,
		explanation:
			'The safest headless combination is -p, --bare, an explicit --allowedTools list, and dontAsk. Reach for bypass only when the scenario states the run is isolated.'
	},
	{
		id: 'ci-14',
		domain: 'd3',
		lesson: 'd3-explicit-criteria',
		stem: 'The review job flags too much noise. The prompt says "flag anything that looks risky". Best fix?',
		options: [
			{
				text: 'Replace it with explicit criteria, e.g. "flag only findings of severity high or above with direct security impact".',
				why: 'Correct. Testable, and it defines the threshold the pipeline actually wants.'
			},
			{ text: 'Add "be conservative".', why: 'Wrong. Swaps one vague instruction for another.' },
			{ text: 'Post-filter the findings in the pipeline.', why: 'Treats the symptom, and wastes tokens generating findings you discard.' },
			{ text: 'Reduce max_tokens so fewer findings fit.', why: 'Wrong. Truncates arbitrarily rather than selecting by importance.' }
		],
		answer: 0,
		explanation:
			'Every criterion must be testable. Note also that this is a "flag only" instruction — telling the model what to do rather than a list of prohibitions.'
	},
	{
		id: 'ci-15',
		domain: 'd1',
		lesson: 'd1-workflows-vs-agents',
		stem: 'The review pipeline runs the same fixed sequence on every PR: fetch diff, review per file, review cross-file, aggregate, post. Which design is correct?',
		options: [
			{
				text: 'A workflow — predefined code paths, with the per-file reviews parallelised by sectioning.',
				why: 'Correct. The steps are known and fixed; only the file list varies.'
			},
			{
				text: 'An agent that decides how to review each PR.',
				why: 'Wrong. Dynamic self-direction adds cost and unpredictability to a process that never changes.'
			},
			{
				text: 'An orchestrator that discovers the review steps at run time.',
				why: 'Wrong. The steps do not need discovering — they are the same every time.'
			},
			{
				text: 'An evaluator-optimiser loop over the review output.',
				why: 'Not what the scenario describes, and it would add iterations a PR check cannot afford.'
			}
		],
		answer: 0,
		explanation:
			'Start simple: predefined code paths make it a workflow. Fanning out per file is sectioning, which is parallelisation within a workflow rather than an agentic architecture.'
	},
	{
		id: 'ci-16',
		domain: 'd2',
		lesson: 'd2-hooks',
		stem: 'Which hook event fires before context is summarised, allowing state to be persisted first?',
		options: [
			{ text: 'PreCompact.', why: 'Correct. Compaction is lossy, so anything that matters should be persisted before it runs.' },
			{ text: 'PreToolUse.', why: 'Wrong. That fires before a tool executes.' },
			{ text: 'SessionEnd.', why: 'Wrong. That is the end of the session, well after compaction may have occurred.' },
			{ text: 'Stop.', why: 'Wrong. That fires when a turn ends.' }
		],
		answer: 0,
		explanation:
			'PreCompact exists because summarisation is lossy by construction. If state matters and would not survive a summary, write it out first.'
	}
]);
