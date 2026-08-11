---
id: d5-prompt-caching
track: d5
order: 2
title: Prompt caching economics
summary: The read and write multipliers, the TTLs, what invalidates a cache, and the placement mistake that makes it useless.
minutes: 7
courseChapter: scaling-context
---

Caching is the main cost and latency lever for anything with a large repeated prefix. It is
also arithmetic, which makes it very examinable.

## The mechanism

Mark a stable prefix with a cache breakpoint:

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
- **Reads: ~0.1x** base input cost — a 90% saving on the cached portion.
- **Writes: ~1.25x** base input for the 5-minute TTL, **2x** for the 1-hour TTL.
- Default TTL is **5 minutes**, refreshed on every hit. Optional `ttl: "1h"`.
:::

The consequence: caching only pays off if you get **more than one hit within the TTL**. A
single request that writes a cache and never reads it has cost you 25% extra for nothing.

Verify with the `cache_read_input_tokens` and `cache_creation_input_tokens` fields in the
response usage block.

## Minimum cacheable length

::: key-fact The minimums vary by model
- **1,024 tokens** — Opus 4.8, Sonnet 4.6, Sonnet 4.5
- **4,096 tokens** — Haiku 4.5, Opus 4.6 and 4.5
- **512 tokens** — Fable 5, Mythos 5
:::

::: trap The Haiku minimum
Haiku 4.5 requires **4,096** tokens, not the 1,024 that most models need. A distractor often
offers 2,048 — the old Haiku 3.5 figure. A prefix that caches fine on Sonnet may be silently
below the threshold on Haiku, which is a real production surprise as well as an exam one.
:::

## What invalidates the cache

The cached prefix must be **byte-identical** between requests. Therefore:

- **Changing the tools invalidates everything.** Tools sit at the very front of the prefix.
- **Changing the system prompt invalidates the system prompt and everything after it.**
- Anything placed *before* a breakpoint that varies destroys the cache for that breakpoint.

::: key-fact The placement rule
Cache **stable** content and put **variable** content after the breakpoint. Putting a
timestamp, a per-user greeting, or a request id inside the cached prefix means the prefix
never matches and you pay the write premium on every single request while never getting a
read.
:::

This is the highest-yield caching trap on the exam. The distractor usually looks like a
sensible system prompt that happens to include "Current date and time: …" at the top.

## Where caching is the right answer

When a scenario has:

- a large, unchanging system prompt or reference document;
- many requests against it;
- within a short window.

Classic fits: a support agent with a long policy document, an extraction pipeline with a big
schema and instruction block, a code reviewer with the project's standards loaded.

::: exam-tip Caching versus Batch
Both are cost levers with different constraints. Caching works in real time and needs
repetition within the TTL. Batch halves everything but has no latency guarantee. When a
scenario is cost-sensitive *and* a user is waiting, caching is the answer and Batch is the
trap.
:::

## Token counting

The `/v1/messages/count_tokens` endpoint estimates `input_tokens` before you send. Two notes:
it is an estimate, and it does **not** account for caching. Tokenisers also differ between
models — Fable 5 and Mythos 5 use the Opus 4.7 tokeniser, which produces roughly 30% more
tokens than older models for the same text.
