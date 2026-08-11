---
id: d1-composable-patterns
track: d1
order: 3
title: The five composable patterns
summary: Prompt chaining, routing, parallelisation, orchestrator-workers and evaluator-optimiser — and how to recognise which one a scenario is describing.
minutes: 9
courseChapter: orchestration
---

These five patterns come from Anthropic's *Building Effective Agents*, and the exam expects
you to name them from a description. They compose — real systems use several — but questions
usually describe one cleanly and ask you to identify or select it.

## 1. Prompt chaining

Break a task into fixed sequential steps, each with its own focused prompt, and put a
programmatic checkpoint between them.

```text
Extract → Validate → Enrich → Format
```

Use it when the decomposition is stable and known in advance. The checkpoints are the
point: each gate can reject and retry before the error propagates downstream.

## 2. Routing

Classify the input, then dispatch to a specialised handler — often a different prompt, and
sometimes a different model.

Use it when inputs fall into distinct categories that want genuinely different treatment.
Routing simple queries to Haiku and hard ones to Opus is the canonical cost optimisation,
and the exam likes it as a correct answer to "how do we cut cost without hurting quality".

## 3. Parallelisation

Two distinct flavours, and the distinction is examinable:

- **Sectioning** — split independent subtasks and run them concurrently. Reviewing twelve
  files at once, one call per file.
- **Voting** — run the *same* task several times and aggregate. Use it when a single pass is
  unreliable and you want confidence: three independent security reviews, flag anything two
  of them agree on.

::: exam-tip Sectioning versus voting
"Different pieces of work, run at once" is sectioning. "The same work, run several times to
raise confidence" is voting. A question describing a reviewer that misses issues
intermittently is pointing at voting, not at a bigger model.
:::

## 4. Orchestrator-workers

A lead model decomposes the task dynamically, delegates the pieces to workers, then
synthesises the results.

The distinction from parallelisation is that the subtasks are **not known in advance** — the
orchestrator decides what they are at run time based on what it finds. That dynamism is the
whole reason to accept the extra cost.

This is the pattern underneath multi-agent research systems, and it is the one the exam
means when it talks about coordinators and subagents.

## 5. Evaluator-optimiser

One model generates, a second critiques against explicit criteria, and the first revises.
Loop until the critic is satisfied or an iteration cap is hit.

Use it where quality is measurable against stated criteria and iteration genuinely helps —
translation, writing to a spec, code that must satisfy a checklist.

::: key-fact The evaluator must be independent
The critic should not be the same instance that produced the work, and it should not carry
the generator's reasoning context. An instance reviewing its own output retains the
reasoning that produced the mistake and reliably fails to see it. This is *generator bias*,
and it comes up again in the CI/CD scenario.
:::

## Choosing between them

| The scenario says | The pattern |
|---|---|
| Fixed steps, known in advance, gates between them | Prompt chaining |
| Distinct input categories wanting different handling | Routing |
| Independent pieces, all known up front | Parallelisation (sectioning) |
| One unreliable judgement, want confidence | Parallelisation (voting) |
| Subtasks discovered at run time, then synthesised | Orchestrator-workers |
| Output must meet criteria, iteration helps | Evaluator-optimiser |

::: trap Orchestrator-workers is not just "parallel with extra steps"
If the subtasks can be listed before the work starts, it is sectioning and you do not need an
orchestrator deciding anything. Paying for a coordinator to redundantly discover a list you
already had is exactly the over-engineering the "start simple" rule exists to prevent.
:::
