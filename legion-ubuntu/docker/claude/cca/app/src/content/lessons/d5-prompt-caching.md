---
id: d5-prompt-caching
track: d5
order: 2
title: Prompt caching economics
summary: The read and write multipliers, the TTLs, what invalidates a cache, and the placement mistake that makes it useless.
minutes: 7
courseChapter: scaling-context
---

If you send the same big chunk of text at the start of every request, you can have Claude
remember it instead of re-reading it. That is prompt caching.

It is the main cost and speed lever for anything with a large repeated prefix. It is also just
arithmetic, which makes it very easy to write exam questions about.

## How it works

Mark the stable part of your prompt with a cache breakpoint:

```json
{
  "system": [
    {
      "type": "text",
      "text": "<long stable instructions and reference material>",
      "cache_control": { "type": "ephemeral" }
    }
  ]
}
```

Up to **four breakpoints** per request.

## The numbers

::: key-fact Cache pricing
- **Reads: ~0.1x** base input cost — a 90% saving on the cached part.
- **Writes: ~1.25x** base input for the 5-minute TTL, **2x** for the 1-hour TTL.
- Default TTL is **5 minutes**, reset every time the cache is hit. Optional `ttl: "1h"`.
:::

What that means in practice: caching only pays off if you get **more than one hit inside the
TTL**. A single request that writes a cache and never reads it has just cost you 25% extra for
nothing.

Check the `cache_read_input_tokens` and `cache_creation_input_tokens` fields in the response to
see what actually happened.

## Minimum size to be cacheable

::: key-fact The minimum varies by model
- **1,024 tokens** — Opus 4.8, Sonnet 4.6, Sonnet 4.5
- **4,096 tokens** — Haiku 4.5, Opus 4.6 and 4.5
- **512 tokens** — Fable 5, Mythos 5
:::

::: trap The Haiku minimum
Haiku 4.5 needs **4,096** tokens, not the 1,024 that most models need. A wrong answer often
offers 2,048 — that was the old Haiku 3.5 figure.

A prefix that caches fine on Sonnet can be silently below the threshold on Haiku. That is a
real production surprise as well as an exam one.
:::

## What breaks the cache

The cached prefix has to be **byte-for-byte identical** between requests. So:

- **Changing the tools breaks everything.** Tools sit right at the front of the prefix.
- **Changing the system prompt breaks the system prompt and everything after it.**
- Anything that varies, placed *before* a breakpoint, destroys the cache for that breakpoint.

::: key-fact The placement rule
Cache the **stable** content. Put the **changing** content after the breakpoint.

Put a timestamp, a per-user greeting, or a request id inside the cached prefix and the prefix
never matches. You pay the write premium on every single request and never get a read.
:::

This is the highest-value caching trap on the exam. The wrong answer usually looks like a
perfectly sensible system prompt that happens to start with "Current date and time: …".

## Where caching is the right answer

When a question has all three of these:

- a large system prompt or reference document that does not change;
- many requests against it;
- inside a short window of time.

Classic fits: a support agent with a long policy document, an extraction pipeline with a big
schema and instruction block, a code reviewer with the project standards loaded.

::: exam-tip Caching versus Batch
Both cut cost, but they have different catches.

Caching works in real time and needs repetition within the TTL. Batch halves everything but
gives you no promise about when.

When a question is cost-sensitive *and* someone is waiting, caching is the answer and Batch is
the trap.
:::

## Counting tokens

The `/v1/messages/count_tokens` endpoint estimates `input_tokens` before you send. Two things
to know: it is an estimate, and it does **not** account for caching.

Tokenisers also differ between models. Fable 5 and Mythos 5 use the Opus 4.7 tokeniser, which
produces roughly 30% more tokens than older models for the same text.
