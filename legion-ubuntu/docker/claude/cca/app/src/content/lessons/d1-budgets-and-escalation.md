---
id: d1-budgets-escalation
track: d1
order: 7
title: Budgets, escalation and the multi-agent premium
summary: What legitimately triggers a handoff to a human, why confidence scores do not, and when the ~15x token cost is worth paying.
minutes: 8
courseChapter: advanced-agents
---

Three related questions about knowing when to stop: when to stop spending, when to stop
being autonomous, and when the whole architecture is not worth it.

## Escalation triggers

The customer support scenario leans on this hard, and the list is worth memorising because
the exam tests both halves.

::: key-fact Escalate on these
- The user **explicitly asks** for a human.
- The **policy is ambiguous** and the correct action is genuinely unclear.
- **No progress** after several attempts.
- The action is **irreversible or high-stakes** — refunds above a threshold, account
  deletion, anything that cannot be undone.
:::

::: trap Do NOT escalate on these
- **Customer frustration on its own.** Sentiment is not a policy signal. An annoyed customer
  with a clear-cut return request should get the return, not a queue.
- **A low self-reported confidence score.** See below.
- **Task complexity alone**, when the policy is clear. Complicated and ambiguous are
  different things.
:::

## Why self-reported confidence is the wrong gate

This is one of the exam's favourite distractors, and it is worth understanding rather than
memorising.

::: key-fact Model self-assessment is poorly calibrated
Asking a model "how confident are you, 0 to 1?" produces a number that does not reliably
track correctness. It is confidently wrong on exactly the cases you most need to catch, so
thresholding on it fails precisely where it matters.
:::

The correct alternative is a **deterministic rule** evaluated in code: escalate if the refund
exceeds $500, if the policy lookup returned no match, if three resolution attempts have
failed, if the account is flagged. These are facts your system knows, not judgements the
model reports about itself.

This is the **calibration check** mental model: any time a design depends on Claude's
assessment of its own output, replace it with external validation — a schema check, a
deterministic threshold, a human review sample.

## Token budgets

Track cumulative input **and** output tokens across the whole loop, not per request. Then:

- At **80%** of budget, inject a wrap-up instruction asking the agent to conclude.
- At **100%**, stop the loop in code.

The Agent SDK exposes this directly through `max_turns` and `max_budget_usd`, and the
terminal `ResultMessage` tells you which limit was hit — `success`, `error_max_turns`,
`error_max_budget_usd`, `error_during_execution`.

## The multi-agent premium

The economics are specific and examinable:

| Interaction | Relative token use |
|---|---|
| Plain chat | 1x |
| Single agent | ~4x |
| Multi-agent | ~15x |

Anthropic's own multi-agent research system — an Opus lead with Sonnet subagents — beat
single-agent Opus by around 90% on their internal research evaluation. So it does work. It
just costs fifteen times as much.

::: key-fact When multi-agent pays for itself
Only when the task is **high-value**, the subtasks are **heavily parallelisable and
independent**, and the work **exceeds a single context window**. Miss any of the three and
the premium is being spent on architecture rather than outcomes.
:::

## Evaluating agents

Two practical notes the exam touches:

- Start with roughly **20 representative queries**. You do not need a huge eval set to find
  the obvious failures, and a small set you actually run beats a large one you do not.
- Score with **LLM-as-judge** across accuracy, completeness, citation quality and efficiency,
  plus human review of a sample. As ever, the judge should be independent of the generator.
