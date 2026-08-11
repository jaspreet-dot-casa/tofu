---
id: d3-multi-pass-review
track: d3
order: 6
title: Multi-pass review and generator bias
summary: Why self-review fails, how to split a review into passes, and what each pass is actually able to catch.
minutes: 6
courseChapter: reliability
---

Any time the exam describes a system that checks its own work, there is a question about
generator bias nearby.

## Generator bias

::: key-fact An instance cannot reliably review its own output
Reviewing output it produced, a model still holds the reasoning that produced the mistake.
The flawed step looks correct in the context that generated it. Independent review means a
**separate instance without the generator's context** — not the same conversation asked to
double-check.
:::

"Ask Claude to review its answer before responding" is a distractor. It catches formatting
slips and little else.

## Splitting the passes

For anything larger than a single file, one review pass is the wrong shape. Two levels:

1. **Per-unit passes** — one focused review per file, per document, per record. Full
   attention on a small amount of material. Catches local defects.
2. **A cross-unit pass** — one review over the whole set, or over the summaries. Catches
   integration defects that no single unit exposes: a renamed function whose callers were not
   updated, a schema change that breaks a consumer.

::: exam-tip Neither pass substitutes for the other
A single whole-diff review misses local detail because attention is spread thin. A set of
per-file reviews misses integration issues because no reviewer saw two files at once. A
question describing "the reviewer caught the style problems but missed that the API contract
changed" is describing per-file passes with no cross-file pass.
:::

## The full pattern

For a code-review pipeline:

```text
                    ╭──────────────╮
  diff ────────────▶│  fan out by  │
                    │     file     │
                    ╰──────┬───────╯
              ╭────────────┼────────────╮
              ▼            ▼            ▼
        ╭──────────╮ ╭──────────╮ ╭──────────╮
        │ review A │ │ review B │ │ review C │  ← independent sessions,
        ╰─────┬────╯ ╰─────┬────╯ ╰─────┬────╯    no generator context
              ╰────────────┼────────────╯
                           ▼
                  ╭─────────────────╮
                  │ cross-file pass │
                  ╰────────┬────────╯
                           ▼
                  structured findings
```

Each reviewer returns schema-valid findings; the aggregate is what the pipeline acts on.

## Voting, when one pass is not enough

Where a single judgement is unreliable and the cost of missing something is high, run the
same review several times independently and aggregate — flag anything two of three reviewers
agree on. This is the voting flavour of parallelisation from Domain 1.

It is worth paying for on security review and rarely worth it on style.

## Prompt chaining for the generation side

The same decomposition applies to producing work, not only checking it: Extract → Validate →
Enrich → Format, with a gate at each boundary. Each step gets a prompt written for one job,
and a failure tells you exactly which stage broke.
