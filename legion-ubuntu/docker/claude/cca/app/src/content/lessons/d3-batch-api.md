---
id: d3-batch-api
track: d3
order: 5
title: Batch processing and its one hard limit
summary: The 50% saving, the 24-hour window, and the scenario where choosing Batch is always wrong.
minutes: 5
courseChapter: reliability
---

The Message Batches API halves your cost. In exchange, you give up any promise about when the
results arrive.

That is the whole trade. The exam tests whether you know where it hurts.

## The trade

| | Batch | Real-time |
|---|---|---|
| Cost | **50% cheaper** | Standard |
| Processing time | Up to **24 hours** | Seconds |
| Latency SLA (a promise about speed) | **None** | Yes |
| Multi-turn | No | Yes |
| Streaming | No | Yes |

Half price is a big saving at volume. No speed promise is a big problem anywhere a person is
waiting.

## When Batch is right

- Overnight reporting.
- Weekly audits and compliance sweeps.
- Reprocessing an archive in bulk.
- Backfilling a dataset.
- Any job whose results are picked up by a schedule, not a person.

Use the `custom_id` field on each request to match results back to your records. Batch results
are not guaranteed to come back in the order you sent them.

## When Batch is wrong

::: trap Never use Batch when something is waiting on the result
If a user, a request, or a pipeline stage is blocked waiting, Batch is the wrong answer. Full
stop.

"Up to 24 hours" is not a worst case you can plan around with a generous timeout. There is no
latency SLA at all — no promise about speed, of any kind.

A support agent, an interactive extraction, a PR check that gates a merge: all real-time.
:::

This is one of the seven anti-patterns. It turns up in the extraction scenario as a very
tempting wrong answer: the situation mentions cost pressure, Batch halves the cost, and the
option reads perfectly sensibly — right up until you notice a user is waiting.

## Reading the question

The signal is always who is waiting for the output, and when:

| The question says | Choose |
|---|---|
| "Nightly", "weekly report", "backfill", "archive" | Batch |
| "The user sees", "the pipeline waits for", "response time" | Real-time |
| "Cost is a concern" *and* nothing is waiting | Batch |
| "Cost is a concern" *and* something is waiting | Real-time, then cut cost with caching and routing |

That last row matters.

When cost pressure meets a speed requirement, your levers are **prompt caching** for the
repeated part of the prompt, and **routing** simple queries to a cheaper model. Not moving an
interactive workload to Batch.

::: exam-tip Batch and streaming solve different problems
For one very long request, streaming keeps the connection alive and avoids timeouts.

For high volume with no deadline, Batch.

A question describing a job over ten minutes usually wants one of the two — and which one
depends entirely on whether anyone is waiting.
:::
