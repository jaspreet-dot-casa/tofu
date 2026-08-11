---
id: orientation-blueprint
track: orientation
order: 1
title: The blueprint, and how it is actually scored
summary: What the CCA-F asks, how the five domains are weighted, and why a scaled 720 is not the same as 72%.
minutes: 7
courseChapter: intro
---

The Claude Certified Architect – Foundations exam is not a vocabulary test. It is sixty
multiple-choice questions wrapped around a handful of production scenarios, and almost every
one of them asks the same underlying question: *given this brief, which architectural choice
is correct, and why are the other three wrong in ways a real engineer would find tempting?*

## The shape of the paper

| | |
|---|---|
| Questions | 60, multiple choice — one correct answer, three distractors |
| Time | 120 minutes |
| Scoring | scaled 100–1000, **720 to pass** |
| Draw | 4 scenarios selected at random from a pool of 6, roughly 15 questions each |
| Delivery | Pearson VUE, online-proctored or test centre |
| Conditions | closed book, no documentation, no Claude |
| Cost | USD $125 |
| Validity | 1 year, with a free renewal assessment before expiry |

Two minutes per question sounds generous until you meet a scenario preamble that runs half a
page. Budget accordingly — there is a whole lesson on that.

::: key-fact Scaled scoring is not a percentage
720 out of 1000 does **not** mean "get 72% right". The scale runs from 100, not 0, so the
900 points above the floor are what you are actually competing for. Questions are also
weighted by domain rather than counted flat. Treat 720 as a threshold on a scale, not as a
raw mark you can compute in your head mid-exam.
:::

## The five domains

Every question belongs to exactly one domain, and the domains are weighted. This is the
single most useful fact for planning revision, because it tells you where the marks live.

| Domain | Weight | ≈ questions |
|---|---|---|
| Agentic Architecture & Orchestration | 27% | 16 |
| Claude Code Configuration & Workflows | 20% | 12 |
| Prompt Engineering & Structured Output | 20% | 12 |
| Tool Design & MCP Integration | 18% | 11 |
| Context Management & Reliability | 15% | 9 |

Agentic architecture is more than a quarter of the paper on its own, and it is also the
domain the other four keep referring back to — a tool-design question is usually really a
question about which agent should hold that tool. Start there.

## Scenario-based, not concept-based

The six scenarios in the pool are all recognisable production briefs: a customer support
agent, a code-generation rollout, a multi-agent research system, an internal developer
assistant, a CI/CD review pipeline, and a document extraction service. You will see four of
them.

This matters for how you revise. Learning "what is hub-and-spoke" gets you very little.
Learning "in a research system where one subagent has died, what does the coordinator return
to the user, and why is returning an empty result the wrong answer" gets you the mark.

::: exam-tip Read the question type before the options
Roughly half the questions are "which of these should you do", and roughly half are "which
of these should you **not** do" or "what is the flaw in this design". Misreading the polarity
is the cheapest way to lose a mark you actually knew. Find the verb before you read the
options.
:::

## The single most useful heuristic

If you remember one thing from this whole site, make it this:

::: key-fact Programmatic enforcement beats prompt-based guidance
When a scenario says something must *always* happen, must *never* happen, or must be
*guaranteed*, the answer is a hook, a permission rule, a schema, or a validation gate — not
an instruction in a prompt or a line in `CLAUDE.md`. Prompts are probabilistic. Code is not.
:::

An enormous share of the distractors on this exam are "add an instruction telling Claude to
always do X". They are almost always wrong, and they are wrong for a reason worth internalising
rather than memorising: a model can decline to follow an instruction, and a system that
depends on it declining not to has no failure mode you can reason about.

## What this site is, and is not

The official Exam Guide lives in Anthropic's Partner Academy and is the source of truth for
domains, task statements and sample questions. The lessons here are a synthesis built from
the public blueprint, the freeCodeCamp course, and the underlying Claude and MCP
documentation. The questions are written in the exam's style — they are practice, not leaked
items.

Use this to find your gaps. Use the official guide to confirm the scope.
