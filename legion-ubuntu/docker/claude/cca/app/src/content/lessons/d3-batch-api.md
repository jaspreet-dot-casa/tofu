---
id: d3-batch-api
track: d3
order: 5
title: Batch processing and its one hard limit
summary: The 50% saving, the 24-hour window, and the scenario where choosing Batch is always wrong.
minutes: 5
courseChapter: reliability
---

The Message Batches API is a straightforward cost lever with a single, absolute constraint.
The exam tests whether you know where the constraint bites.

## The trade

| | Batch | Real-time |
|---|---|---|
| Cost | **50% cheaper** | Standard |
| Processing | Up to **24 hours** | Seconds |
| Latency SLA | **None** | Yes |
| Multi-turn | No | Yes |
| Streaming | No | Yes |

Half price is a large saving at volume. No SLA is a large constraint anywhere a person is
waiting.

## When Batch is right

- Overnight reporting.
- Weekly audits and compliance sweeps.
- Bulk reprocessing of an archive.
- Backfilling a dataset.
- Any job whose result is consumed by a schedule rather than a person.

Use the `custom_id` field on each request to correlate results back to your records — batch
results are not guaranteed to come back in submission order.

## When Batch is wrong

::: trap Never use Batch in a blocking workflow
If a user, a request, or a pipeline stage is waiting on the result, Batch is the wrong
answer — full stop. "Up to 24 hours" is not a worst case you can engineer around with a
generous timeout; there is no latency guarantee at all. A support agent, an interactive
extraction, a PR check that gates a merge: all real-time.
:::

This is one of the seven anti-patterns, and it appears in the extraction scenario as an
attractive distractor: the scenario mentions cost pressure, Batch halves the cost, and the
option reads as sensible right up until you notice a user is waiting.

## Reading the question

The signal is always in who consumes the output and when:

| The scenario says | Choose |
|---|---|
| "Nightly", "weekly report", "backfill", "archive" | Batch |
| "The user sees", "the pipeline blocks on", "response time" | Real-time |
| "Cost is a concern" *and* nothing is waiting | Batch |
| "Cost is a concern" *and* something is waiting | Real-time, then optimise with caching and routing |

That last row matters. When cost pressure meets a latency requirement, the levers are
**prompt caching** for the repeated prefix and **routing** cheap queries to a smaller model —
not moving an interactive workload to Batch.

::: exam-tip Batch and streaming are alternatives, not complements
For very long single requests, streaming keeps the connection alive and avoids idle timeouts.
For high volume without deadlines, Batch. A question describing a ten-minute-plus job usually
wants one of those two, and which one depends entirely on whether anyone is waiting.
:::
