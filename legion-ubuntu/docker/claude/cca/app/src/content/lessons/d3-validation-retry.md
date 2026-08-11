---
id: d3-validation-retry
track: d3
order: 4
title: Validation and retry loops
summary: What to send back on a retry, what a retry can actually fix, and where the loop must stop.
minutes: 5
courseChapter: reliability
---

A validation-retry loop is the standard way to turn shaky extraction into reliable extraction.
Check the output, and if it is wrong, ask again with the problem explained.

It works — inside one specific limit that the exam tests.

## The loop

1. Ask for the structured output.
2. Check it — schema first, then whether the values make sense.
3. If it fails, send a retry containing **the original document**, **the failed attempt**, and
   **the specific errors**.
4. Cap the number of attempts. When you hit the cap, escalate or park the record.

Step 3 is where implementations go wrong.

Sending back only "that was invalid, try again" gives the model nothing to correct against. It
tends to produce a differently-wrong answer.

Naming the actual problem — *"`invoice_total` was 1240.00 but the line items add up to
1180.00"* — gives it something real to fix.

## The limit

::: key-fact Retries fix mistakes; they cannot invent missing data
If the document genuinely does not contain a purchase order number, no number of retries will
produce one. They will produce a made-up one.

A retry can fix a wrong format, a misread field, a wrong category. It cannot fix absence.
:::

That splits validation failures into two kinds:

- **Fixable** — wrong shape, wrong type, numbers that do not add up, wrong category. Retry.
- **Not fixable** — the information is not in the document. Do not retry. Record it as missing
  and send it to a human.

::: trap Retrying when data is missing
A loop that retries a missing required field will eventually get a plausible-looking value —
because you are pushing the model to satisfy a schema it cannot honestly satisfy.

This is how invented data gets into a pipeline that has validation. Design your nullable and
`"unclear"` paths so that "not there" has somewhere legitimate to go.
:::

## Where to cap it

Two or three attempts.

Past that, extra retries mostly burn tokens. If the same document has failed the same check
three times with the errors spelled out each time, the problem is the document or the schema —
not bad luck.

## Prompt chaining as a bigger version of the same idea

The same principle at a larger scale: break the job into steps, with a check between each one.

```text
Extract → Validate → Enrich → Format
     ↑         │
     └─ retry ─┘
```

Each step gets a focused prompt. Each check catches errors before they spread.

The alternative — one big prompt doing all four jobs — fails in a way you cannot diagnose,
because you cannot tell which stage went wrong.

::: exam-tip The reliability stack
For a question about making extraction dependable, the full answer usually stacks four things:
a schema for the shape, your own validation for the meaning, a capped retry with specific error
feedback, and a human-review route for whatever is left.

An option offering only one of the four is deliberately incomplete.
:::
