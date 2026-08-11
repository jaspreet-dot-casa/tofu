---
id: d3-multi-pass-review
track: d3
order: 6
title: Multi-pass review and generator bias
summary: Why self-review fails, how to split a review into passes, and what each pass is actually able to catch.
minutes: 6
courseChapter: reliability
---

Any time the exam describes a system checking its own work, there is a question about generator
bias nearby.

## Generator bias

::: key-fact An instance cannot reliably review its own output
When a model reviews work it produced, it still holds the reasoning that produced the mistake.
The flawed step looks correct from inside the thinking that created it.

Independent review means a **separate instance with none of the writer's context**. Not the
same conversation asked to double-check.
:::

It is the same reason you cannot proofread your own writing well. You read what you meant, not
what is on the page.

"Ask Claude to review its answer before responding" is a wrong answer. It catches formatting
slips and little else.

## Splitting the passes

For anything bigger than a single file, one review pass is the wrong shape. You want two
levels:

1. **One pass per unit** — one focused review per file, per document, per record. Full
   attention on a small amount of material. Catches local problems.
2. **One pass across units** — one review over the whole set, or over the summaries. Catches
   problems that only show up between units: a renamed function whose callers were not
   updated, a schema change that breaks something downstream.

::: exam-tip Neither pass can replace the other
One whole-diff review misses local detail, because attention is spread too thin. A set of
per-file reviews misses integration problems, because no reviewer ever saw two files at once.

A question describing "the reviewer caught the style problems but missed that the API contract
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
        ╰─────┬────╯ ╰─────┬────╯ ╰─────┬────╯    no writer's context
              ╰────────────┼────────────╯
                           ▼
                  ╭─────────────────╮
                  │ cross-file pass │
                  ╰────────┬────────╯
                           ▼
                  structured findings
```

Each reviewer returns findings that match a schema. The combined set is what the pipeline acts
on.

## Voting, when one pass is not enough

Where a single judgement is unreliable and missing something would be expensive, run the same
review several times independently and compare. Flag anything two out of three reviewers agree
on.

This is the voting flavour of parallelisation from Domain 1.

Worth paying for on security review. Rarely worth it on style.

## The same idea when producing work

This decomposition is not just for checking. It applies to producing too: Extract → Validate →
Enrich → Format, with a check at each boundary.

Each step gets a prompt written for one job, and a failure tells you exactly which step broke.
