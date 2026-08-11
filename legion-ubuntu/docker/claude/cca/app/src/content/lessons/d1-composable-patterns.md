---
id: d1-composable-patterns
track: d1
order: 3
title: The five composable patterns
summary: Prompt chaining, routing, parallelisation, orchestrator-workers and evaluator-optimiser — and how to recognise which one a scenario is describing.
minutes: 9
courseChapter: orchestration
---

There are five standard ways to put an agentic system together. They come from Anthropic's
*Building Effective Agents*, and the exam expects you to name one from a description.

Real systems mix several. Questions usually describe one cleanly and ask you to spot it.

## 1. Prompt chaining

Break the task into fixed steps in a fixed order. Give each step its own focused prompt. Put a
check in your code between each one.

```text
Extract → Validate → Enrich → Format
```

Use it when you know the steps in advance and they do not change.

The checks are the whole point. Each one can reject bad output and retry before the error
spreads to the next step.

## 2. Routing

Sort the input into a category first, then send it to a handler built for that category —
usually a different prompt, sometimes a different model.

Use it when your inputs fall into clearly different types that need different treatment.

Sending easy queries to Haiku and hard ones to Opus is the classic cost saving. The exam likes
it as the answer to "how do we cut cost without hurting quality".

## 3. Parallelisation

Running several calls at once. It comes in two flavours, and telling them apart is examinable:

- **Sectioning** — split the work into separate pieces and run them at the same time.
  Reviewing twelve files at once, one call per file.
- **Voting** — run the *same* job several times and compare. Use it when one pass is not
  reliable enough: three separate security reviews, flag anything two of them agree on.

::: exam-tip Sectioning versus voting
Different pieces of work, run at once → **sectioning**.

The same work, run several times to be more confident → **voting**.

A question about a reviewer that sometimes misses things is pointing at voting, not at a
bigger model.
:::

## 4. Orchestrator-workers

A lead model breaks the task up as it goes, hands the pieces to workers, then combines what
comes back.

What separates this from parallelisation: the pieces are **not known in advance**. The
orchestrator works out what they are while running, based on what it finds. That flexibility
is the only reason to accept the extra cost.

This is the pattern behind multi-agent research systems. It is what the exam means when it
talks about coordinators and subagents.

## 5. Evaluator-optimiser

One model produces the work. A second one criticises it against clear, stated criteria. The
first one revises. Repeat until the critic is happy or you hit a limit on rounds.

Use it where quality can be measured against stated criteria and where another round genuinely
helps — translation, writing to a spec, code that has to pass a checklist.

::: key-fact The critic has to be a separate instance
Do not let the same instance that wrote the work review it. And do not give the critic the
writer's reasoning.

An instance reviewing its own output still holds the thinking that caused the mistake, so the
mistake still looks right to it. This is called **generator bias**, and it comes up again in
the CI/CD scenario.
:::

## Choosing between them

| The question says | The pattern |
|---|---|
| Fixed steps, known in advance, checks between them | Prompt chaining |
| Different kinds of input needing different handling | Routing |
| Separate pieces, all known up front | Parallelisation (sectioning) |
| One unreliable judgement, want more confidence | Parallelisation (voting) |
| Pieces discovered while running, then combined | Orchestrator-workers |
| Output must meet criteria, and revising helps | Evaluator-optimiser |

::: trap Orchestrator-workers is not "parallel with extra steps"
If you can list the pieces before the work starts, it is sectioning. You do not need an
orchestrator to decide anything.

Paying a coordinator to work out a list you already had is exactly the over-engineering that
the "start simple" rule exists to stop.
:::
