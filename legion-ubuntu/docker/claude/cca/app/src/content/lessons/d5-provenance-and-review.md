---
id: d5-provenance-review
track: d5
order: 5
title: Provenance, sampling and human review
summary: Claim-source mapping, why 97% accuracy can hide a broken field, and how to route work to humans.
minutes: 6
courseChapter: reliability
---

The last piece of reliability is knowing what your system actually got right. That is harder
than it sounds, and it is where the knowledge-base and extraction scenarios live.

## Where each claim came from

Any system that states facts drawn from sources should attach four things to every claim:

- the **source** — URL, document name;
- the **exact text** the claim rests on;
- the **date**, so someone can judge how current it is;
- the **kind of claim** — a direct quote, a paraphrase, or an inference.

That last one matters more than it looks.

An inference presented with the same confidence as a quote is how a system produces something
official-looking that the source never actually said.

::: key-fact When sources disagree, show both
The right output is not to quietly pick one. Note the disagreement and attribute both.

Resolving it silently destroys the most useful piece of information — that there was a
disagreement at all.
:::

## An overall accuracy number can hide a broken field

::: trap 97% overall accuracy can hide a field that is completely broken
Suppose one document type is 8% of your corpus, and its date field is wrong 60% of the time.

The overall number barely moves. The headline says the system works. It does not — not for that
document type.
:::

The fix is **stratified sampling**: sample by document type *and* by field, rather than
uniformly across everything.

Set quality targets per field and per document type, not one global target.

## Sending work to humans

Two routes, and you need both:

1. **By exception** — but, as Domain 1 established, not based on the model's own confidence.
   Use signals your system actually owns: the schema came back `"unclear"`, validation failed
   after retries, a required field was null, a value fell outside the expected range, two
   extraction passes disagreed.
2. **By sampling** — a stratified sample of *everything*, including the records the system was
   confident about. This is how you find the failure nobody flagged.

::: key-fact Both routes are necessary
Exception-based review only ever looks at what the system already suspected. So it cannot find
confident mistakes.

Sampling catches those. A question offering only one of the two routes is offering half an
answer.
:::

## The calibration check

The fifth mental model, and a good note to end the domain on:

> Is any part of this design relying on Claude's judgement of its own output?

If yes, replace it with something external: a schema check, a fixed threshold, a separate
reviewer instance, a human sample.

Self-assessment feels like a signal. It is not one.

## The domain in one list

A reliable system:

- Structured errors that separate temporary from permanent, and empty from failed.
- Retries only where retrying could help, with backoff and a cap.
- Checkpoints, so a crash resumes rather than restarts.
- Context chosen deliberately — trimmed, compacted, offloaded, or retrieved.
- A source attached to every claim.
- Degradation always reported, never silent.
- Quality measured by stratified sample, not by one overall number.
