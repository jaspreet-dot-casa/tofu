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
multiple-choice questions built around a few realistic work situations.

Nearly every question asks the same thing in different clothes: *here is a situation — which
design choice is right, and why do the other three sound right but are not?*

::: key-fact The word "distractor"
A **distractor** is a wrong answer written to look correct. Every question has one right
answer and three distractors. This site uses the word constantly, because on this exam the
wrong answers are the hard part.
:::

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

Two minutes per question sounds like plenty. Then you meet a scenario write-up that runs half
a page. Plan your time — there is a whole lesson on how.

::: key-fact Scaled scoring is not a percentage
720 out of 1000 does **not** mean "get 72% right". The scale starts at 100, not 0. So the
real contest is over the 900 points above that floor. Questions are also worth different
amounts depending on their domain. Treat 720 as a line you have to cross, not a mark you can
work out in your head during the exam.
:::

## The five domains

Every question belongs to exactly one domain. The domains are not equal in size. This is the
single most useful fact for planning your revision, because it tells you where the marks are.

| Domain | Weight | ≈ questions |
|---|---|---|
| Agentic Architecture & Orchestration | 27% | 16 |
| Claude Code Configuration & Workflows | 20% | 12 |
| Prompt Engineering & Structured Output | 20% | 12 |
| Tool Design & MCP Integration | 18% | 11 |
| Context Management & Reliability | 15% | 9 |

Agentic architecture is more than a quarter of the paper by itself. It is also the domain the
other four keep pointing back to — a tool-design question is often really a question about
which agent should hold that tool. Start there.

## It is about situations, not definitions

The six scenarios in the pool are all normal-looking work briefs: a customer support agent, a
code-generation rollout, a multi-agent research system, an internal developer assistant, a
CI/CD review pipeline, and a document extraction service. You will get four of them.

This changes how you should revise. Learning "what is hub-and-spoke" earns you very little.
Learning "in a research system where one subagent has died, what should the coordinator tell
the user, and why is returning an empty result wrong" earns you the mark.

::: exam-tip Find out what the question wants before you read the options
About half the questions ask "which of these should you do". The other half ask "which should
you **not** do", or "what is wrong with this design". Missing that flip is the cheapest way
to lose a mark you actually knew. Find the verb first.
:::

## The single most useful rule

If you remember one thing from this whole site, make it this:

::: key-fact Enforce it in code, do not ask for it in a prompt
When a situation says something must *always* happen, must *never* happen, or must be
*guaranteed*, the answer is a hook, a permission rule, a schema, or a validation gate. It is
not an instruction in a prompt or a line in `CLAUDE.md`. A prompt is a request. Code is a
rule.
:::

A huge share of the wrong answers on this exam are some version of "add an instruction telling
Claude to always do X". They are nearly always wrong, and the reason is worth understanding
rather than memorising: a model can choose not to follow an instruction. If your system only
works when the model cooperates, you have no way to predict how it fails.

## What this site is, and is not

The official Exam Guide lives in Anthropic's Partner Academy. It is the source of truth for
the domains, the task statements and the sample questions. The lessons here are built from
the public blueprint, the freeCodeCamp course, and the Claude and MCP documentation. The
questions are written in the exam's style — they are practice, not leaked exam items.

Use this site to find your weak spots. Use the official guide to confirm the scope.
