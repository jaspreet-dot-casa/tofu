## The brief

A coordinator hands work out to specialist subagents — search, analysis, synthesis, reporting
— and has to cope sensibly when one of them fails.

## The shape

Hub-and-spoke. The exam accepts nothing else.

```text
                    ╭───────────────╮
          ╭─────────┤  COORDINATOR  ├─────────╮
          │         ╰───────┬───────╯         │
          ▼                 ▼                 ▼
     ╭─────────╮      ╭──────────╮      ╭───────────╮
     │ search  │      │ analysis │      │ synthesis │
     ╰─────────╯      ╰──────────╯      ╰───────────╯
```

No lines between the spokes. If the analysis agent needs something the search agent found, it
goes **through** the coordinator: the coordinator receives search's summary, then puts it into
analysis's delegation prompt.

## Context isolation

::: key-fact Each subagent starts with a fresh, empty context window
It does not get the coordinator's history. Everything it needs has to be written into the
prompt that starts it. Only its final message comes back.
:::

This is the point of the whole design. Ten sources get read in ten separate windows, ten
summaries come back, and the coordinator's context stays small.

It is also the bit people forget: "the subagent already knows what we worked out earlier" is
false.

## Handling failure

The whole scenario turns on this.

A subagent that hits an error and returns nothing looks exactly like one that searched
thoroughly and found nothing.

::: trap Never return an empty result on error
Return structured information instead: what failed, what was attempted, what partial results
exist, and what else could be tried.
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

Now the coordinator can retry, work around it, or carry on with less — and, crucially, **say in
the final report that the internal wiki was not covered**.

Degrading without saying so looks identical to having covered everything.

## Is multi-agent even justified here?

Ask the three questions:

1. Is the task valuable enough?
2. Can the pieces genuinely run separately at the same time?
3. Is the work too big for one context window?

Research across many sources: yes to all three.

Multi-agent uses roughly **15x** the tokens of plain chat (single agents about 4x). All three
have to hold before that is worth paying.

::: trap A big step-by-step task is not a multi-agent task
If the pieces share state that keeps changing — each step depending on what the last one just
learned — isolation actively hurts. Every agent is working from an out-of-date snapshot.

That is a single agent, or a step-by-step workflow.
:::

## Provenance

Research output has to say where each claim came from: the source, the exact text, the date,
and whether it is a quote, a paraphrase or an inference.

When sources disagree, show **both** attributions. Do not quietly pick one.

## Budget

Track total tokens across the whole run. Send a wrap-up instruction at 80%. Hard-stop in code
at 100%. Checkpoint to a manifest so a crash resumes rather than restarts.

## What the exam will ask

- How information gets from one subagent to another
- What a subagent inherits from the coordinator
- What a failing subagent should return
- Whether multi-agent is justified at all
- What the coordinator's three jobs are — and that doing the work is not one of them
