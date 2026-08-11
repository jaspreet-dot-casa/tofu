---
id: d5-provenance-review
track: d5
order: 5
title: Provenance, sampling and human review
summary: Claim-source mapping, why 97% accuracy can hide a broken field, and how to route work to humans.
minutes: 6
courseChapter: reliability
---

The last piece of reliability is knowing what your system actually got right — which is
harder than it sounds, and is where the knowledge-base and extraction scenarios live.

## Information provenance

For any system that makes factual claims from sources, require a claim-to-source mapping on
every claim:

- the **source** — URL, document name;
- the **excerpt** the claim rests on;
- the **date**, so recency can be judged;
- the **kind of claim** — direct quote, paraphrase, or inference.

That last distinction matters more than it looks. An inference presented with the same
confidence as a quote is how a system produces something defensible-looking that the source
never said.

::: key-fact Conflicting sources get both attributions
When two sources disagree, the right output is not to pick one silently. Annotate the
conflict with both attributions and let the reader see it. Silent resolution destroys the
information that there was a disagreement at all.
:::

## Aggregate accuracy hides failures

::: trap 97% overall accuracy can conceal a field that is broken
If one document type is 8% of the corpus and its date field fails 60% of the time, the
aggregate barely moves. The headline number says the system works. It does not, for that
type.
:::

The fix is **stratified random sampling** — sample by document type *and* by field, not
uniformly across everything. Set quality thresholds per field and per document type rather
than one global target.

## Routing to humans

Two complementary routes:

1. **Confidence-based** — but as established in Domain 1, not the model's self-reported
   confidence. Use signals your system owns: the schema returned `"unclear"`, validation
   failed after retries, a required field came back null, the value fell outside an expected
   range, two extraction passes disagreed.
2. **Sampling-based** — a stratified sample of *everything*, including the records the system
   was sure about. This is how you discover the failure mode nobody flagged.

::: key-fact Both routes are necessary
Exception-based review only ever inspects what the system already knew was doubtful, so it
cannot find confident errors. Sampling catches those. A question offering only one of the two
is offering half an answer.
:::

## The calibration check

The fifth mental model, and a good closing thought for the domain:

> Is any part of this design relying on Claude's assessment of its own output?

If yes, replace it with something external: a schema check, a deterministic threshold, an
independent reviewer instance, a human sample. Self-assessment feels like a signal and is not
one.

## Putting the domain together

A reliable system, in one list:

- Structured errors that distinguish transient from permanent, and empty from failed.
- Retries only where retrying can help, with backoff and a cap.
- Checkpoints so a crash resumes rather than restarts.
- Context curated deliberately — trimmed, compacted, offloaded, or retrieved.
- Provenance attached to every claim.
- Degradation reported, never silent.
- Quality measured by stratified sample, not aggregate.
