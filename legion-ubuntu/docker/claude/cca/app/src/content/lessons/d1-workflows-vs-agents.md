---
id: d1-workflows-vs-agents
track: d1
order: 2
title: Workflows versus agents, and "start simple"
summary: The definitional line the exam draws between the two, and why the least autonomous adequate design keeps winning.
minutes: 6
courseChapter: agentic-loop
---

"Workflow" and "agent" sound like loose words. On this exam they are not. Each has a precise
definition, and the questions use the exact wording. Learn the phrases.

## The line

::: key-fact The two definitions
A **workflow** moves Claude and its tools through **steps you wrote in advance**.

It is an **agent** when the model **decides its own path** — which tools to use, and in what
order.
:::

The wording gives it away. "Predefined code paths" in a question means workflow. "The model
decides how to proceed" means agent.

## What you give up

| | Workflow | Agent |
|---|---|---|
| Predictable | Very | Less so |
| Cost | Lower | Higher |
| Speed | Faster | Slower |
| Handles open-ended tasks | Badly | Well |
| Easy to debug | Yes | Harder |

Agents buy you flexibility. You pay for it in tokens, in speed, and in not knowing exactly
what will happen. That is a real trade, not a technicality: an agent uses roughly four times
the tokens of a plain chat, and a multi-agent system around fifteen times.

## Start simple

This is the foundational rule, and the exam applies it constantly:

::: key-fact Use the least independent thing that solves the problem
A single good prompt beats a workflow. A workflow beats one agent. One agent beats a
multi-agent system. Only move up when the simpler option clearly cannot do the job.
:::

So when a question describes a task that is well understood and happens the same way every
time — classify this ticket, pull out these fields, run these four steps in order — the answer
is a workflow. Even when the question dangles an elegant multi-agent design in front of you.

::: trap Reaching for multi-agent because the task sounds big
"Big" is not the test.

Multi-agent is justified when the pieces are genuinely **separate**, can **run at the same
time**, and are each large enough that one context window cannot hold them.

A big but step-by-step task, where each step builds on the last, is a bad fit. The
coordination costs you something and buys you nothing, and you are paying that ~15x token
premium for it.
:::

## When an agent is the right call

Reach for an agent when:

- you cannot know how many steps it will take;
- the path depends on what earlier steps find;
- the task is open-ended enough that listing all the branches is impractical.

Debugging an unfamiliar failure, exploring a codebase, and open-ended research all qualify.
Formatting a document does not.

## What this looks like in a question

A question describes a document pipeline: pull out the fields, check them, look up extra
details, format the output. It always runs in that order.

The wrong answers will offer you a coordinator agent with specialist subagents, and it will
sound impressive.

It is a workflow. The steps are known, fixed and sequential. Prompt chaining with a check
between each step is the right design — and it is cheaper, faster and easier to debug than
anything with an agent in it.
