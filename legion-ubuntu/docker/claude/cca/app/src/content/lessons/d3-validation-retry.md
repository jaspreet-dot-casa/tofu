---
id: d3-validation-retry
track: d3
order: 4
title: Validation and retry loops
summary: What to send back on a retry, what a retry can actually fix, and where the loop must stop.
minutes: 5
courseChapter: reliability
---

A validation-retry loop is the standard way to turn an unreliable extraction into a reliable
one. It works, within a specific and examinable limit.

## The loop

1. Ask for the structured output.
2. Validate it — schema first, then semantic checks.
3. If it fails, send back a retry containing **the original document**, **the failed
   extraction**, and **the specific validation errors**.
4. Cap the attempts. Escalate or park the record when the cap is hit.

Step 3 is where implementations go wrong. Sending only "that was invalid, try again" gives
the model nothing to correct against, and it tends to produce a differently-wrong answer.
Naming the failure — *"`invoice_total` was 1240.00 but the line items sum to 1180.00"* — gives
it something to actually reconcile.

## The limit

::: key-fact Retries fix execution errors; they do not create missing data
If the document genuinely does not contain a purchase order number, no number of retries will
produce one — they will produce a hallucinated one. A retry can fix a format mismatch, a
misread field, a mis-assigned category. It cannot fix absence.
:::

That distinction drives the design: validation failures split into two kinds.

- **Correctable** — wrong shape, wrong type, internally inconsistent, misclassified. Retry.
- **Not correctable** — the information is not there. Do not retry. Record it as missing and
  route it to human review.

::: trap Retrying on missing data
A loop that retries when a required field is absent will eventually get a plausible-looking
value, because the model is being pushed to satisfy a schema it cannot honestly satisfy.
This is how hallucinated data enters a pipeline that has validation. Design the nullable and
`"unclear"` paths so absence has somewhere legitimate to go.
:::

## Where the cap goes

Two or three attempts. Past that, additional retries mostly burn tokens — if the same
document has failed the same check three times with the errors explained each time, the
problem is the document or the schema, not the sampling.

## Prompt chaining as a validation structure

The same idea at a larger scale: break the job into steps with a checkpoint between each.

```text
Extract → Validate → Enrich → Format
     ↑         │
     └─ retry ─┘
```

Each step gets a focused prompt, and each gate catches errors before they propagate. The
alternative — one large prompt doing all four jobs — fails opaquely, because you cannot tell
which stage went wrong.

::: exam-tip The reliability stack
For a question about making extraction dependable, the complete answer usually stacks four
things: a schema for structure, programmatic validation for meaning, a bounded retry with
specific error feedback, and a human-review route for what remains. An option offering only
one of the four is incomplete by design.
:::
