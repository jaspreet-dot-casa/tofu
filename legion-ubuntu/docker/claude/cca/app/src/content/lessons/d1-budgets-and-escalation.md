---
id: d1-budgets-escalation
track: d1
order: 7
title: Budgets, escalation and the multi-agent premium
summary: What legitimately triggers a handoff to a human, why confidence scores do not, and when the ~15x token cost is worth paying.
minutes: 8
courseChapter: advanced-agents
---

This lesson is about knowing when to stop. When to stop spending money, when to stop letting
the agent act alone, and when the whole design is not worth it.

## When to hand over to a human

The customer support scenario leans on this hard. Learn both lists — the exam tests them
against each other.

::: key-fact Hand over to a human when
- The user **asks for a human**.
- The **policy is unclear** and the right action is genuinely uncertain.
- **Nothing is working** after several attempts.
- The action **cannot be undone or is high-stakes** — refunds above a limit, deleting an
  account, anything permanent.
:::

::: trap Do NOT hand over just because
- **The customer is annoyed.** Being upset is not a policy signal. An angry customer with an
  obvious return request should get the return, not a queue.
- **The model says it is not confident.** See below.
- **The task is complicated**, when the policy is actually clear. Complicated and unclear are
  not the same thing.
:::

## Why asking the model how confident it is does not work

This is one of the exam's favourite wrong answers. It is worth understanding rather than just
memorising.

::: key-fact Models are bad at judging their own confidence
Ask a model "how confident are you, 0 to 1?" and you get a number that does not reliably track
whether it is right.

Worse, it tends to be confidently wrong on exactly the cases you most need to catch. So a
threshold on that number fails precisely where you needed it to work.
:::

The alternative is a **fixed rule in your code**, checked against facts your system actually
knows: escalate if the refund is over $500, if the policy lookup found no match, if three
attempts have failed, if the account is flagged.

These are facts you hold. Not opinions the model has about itself.

This is the **calibration check** mental model: any time a design depends on Claude judging
its own output, swap it for an outside check — a schema, a fixed threshold, a human reviewing
a sample.

## Token budgets

Track total input **and** output tokens across the whole loop, not per request. Then:

- At **80%** of budget, send a message asking the agent to wrap up.
- At **100%**, stop the loop in code.

The Agent SDK gives you this directly through `max_turns` and `max_budget_usd`. The final
`ResultMessage` tells you which limit was hit: `success`, `error_max_turns`,
`error_max_budget_usd`, or `error_during_execution`.

## What multi-agent actually costs

The numbers are specific, and they get tested:

| Interaction | Relative token use |
|---|---|
| Plain chat | 1x |
| Single agent | ~4x |
| Multi-agent | ~15x |

Anthropic's own multi-agent research system — an Opus lead with Sonnet subagents — beat
single-agent Opus by around 90% on their internal research evaluation. So it does work. It
just costs fifteen times as much.

::: key-fact When multi-agent is worth paying for
All three of these must be true: the task is **valuable**, the pieces can genuinely **run
separately at the same time**, and the work is **too big for one context window**.

Miss any one of them and you are spending the premium on architecture instead of results.
:::

## Checking whether your agent is any good

Two practical points the exam touches:

- Start with about **20 representative queries**. You do not need a huge test set to find the
  obvious failures. A small set you actually run beats a big one you do not.
- Score with **LLM-as-judge** across accuracy, completeness, citation quality and efficiency,
  plus a human check on a sample. As always, the judge must not be the thing that produced the
  work.
