## The brief

A coordinator delegates to specialised subagents — search, analysis, synthesis, reporting —
and must degrade gracefully when one of them fails.

## The topology

Hub-and-spoke, and the exam accepts nothing else.

```text
                    ╭───────────────╮
          ╭─────────┤  COORDINATOR  ├─────────╮
          │         ╰───────┬───────╯         │
          ▼                 ▼                 ▼
     ╭─────────╮      ╭──────────╮      ╭───────────╮
     │ search  │      │ analysis │      │ synthesis │
     ╰─────────╯      ╰──────────╯      ╰───────────╯
```

No lateral edges. If the analysis agent needs something the search agent found, it goes
**through** the coordinator: coordinator receives search's summary, then includes it in
analysis's delegation prompt.

## Context isolation

::: key-fact Each subagent starts with a fresh context window
It does not inherit the coordinator's history. Everything it needs must be written into the
prompt that invokes it. Only its final message comes back.
:::

This is the point of the architecture — ten sources read in ten separate windows, ten
summaries returned, coordinator context stays small. It is also the constraint people forget:
"the subagent already knows what we established earlier" is false.

## Failure handling

The whole scenario turns on this. A subagent that hits an error and returns nothing is
indistinguishable from one that searched thoroughly and found nothing.

::: trap Silent failure
Never return an empty result on error. Return structured context: what failed, what was
attempted, what partial results exist, what alternatives remain.
:::

```json
{
  "status": "partial",
  "completed": ["arxiv", "semantic_scholar"],
  "failed": [
    {
      "source": "internal_wiki",
      "error": "auth_expired",
      "retryable": false,
      "alternative": "Request a token refresh, or proceed without internal sources"
    }
  ],
  "results": [ "..." ]
}
```

The coordinator can now retry, route around, or degrade — and crucially, **say in the final
report that the internal wiki was not covered**. Degradation that is not reported is
indistinguishable from completeness.

## Is multi-agent even justified?

Ask the three questions:

1. Is the task high-value? 2. Are the subtasks genuinely independent and parallelisable?
3. Does the work exceed one context window?

Research across many sources: yes to all three. Multi-agent uses roughly **15x** the tokens of
plain chat (single agents about 4x), so all three need to hold.

::: trap A big sequential task is not a multi-agent task
If the subtasks share evolving state — each step depending on what the last just learned —
isolation actively hurts. Every agent works from a stale snapshot. That is a single agent or a
sequential workflow.
:::

## Provenance

Research output must carry claim-to-source mappings: source, excerpt, date, and whether the
claim is a quote, a paraphrase or an inference. Conflicting sources get **both** attributions,
not a silent pick.

## Budget

Track cumulative tokens across the whole run. Inject a wrap-up instruction at 80%; hard-stop
in code at 100%. Checkpoint to a manifest so a crash resumes rather than restarts.

## What the exam will ask

- How information moves between two subagents
- What a subagent inherits from the coordinator
- What a failing subagent returns
- Whether multi-agent is justified at all
- What the coordinator's three jobs are — and that doing the work is not one
