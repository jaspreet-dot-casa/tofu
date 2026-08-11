---
id: d1-workflows-vs-agents
track: d1
order: 2
title: Workflows versus agents, and "start simple"
summary: The definitional line the exam draws between the two, and why the least autonomous adequate design keeps winning.
minutes: 6
courseChapter: agentic-loop
---

This is a definitional distinction, and the exam uses the definitions precisely. Learn the
anchor phrases.

## The line

::: key-fact The two definitions
A **workflow** orchestrates Claude and tools through **predefined code paths**. A system is
an **agent** when the model **dynamically directs its own process** and decides which tools
to use and in what order.
:::

The anchor phrases are the giveaway. "Predefined code paths" in a question stem means
workflow. "The model decides how to proceed" means agent.

## The trade

| | Workflow | Agent |
|---|---|---|
| Predictability | High | Lower |
| Cost | Lower | Higher |
| Latency | Lower | Higher |
| Handles open-ended tasks | Poorly | Well |
| Debuggability | Straightforward | Harder |

Agents buy flexibility with tokens, latency and predictability. That is a real trade, not a
technicality — an agentic system uses roughly four times the tokens of a plain chat
interaction, and a multi-agent one around fifteen times.

## Start simple

The foundational rule, and one the exam applies relentlessly:

::: key-fact Use the least autonomous solution that solves the problem
A single well-constructed prompt beats a workflow. A workflow beats a single agent. A single
agent beats a multi-agent system. Escalate only when the simpler option demonstrably cannot
do the job.
:::

So when a scenario describes a task that is well understood and repeats the same way every
time — classify this ticket, extract these fields, run these four steps in order — the
correct answer is a workflow, even when the question dangles an elegant multi-agent design
in front of you.

::: trap Reaching for multi-agent because the task sounds big
"Big" is not the criterion. Multi-agent is justified when subtasks are genuinely
**independent**, **parallelisable**, and individually large enough that one context window
cannot hold them. A large but sequential task with shared evolving state is a bad fit for
multi-agent and a good fit for a workflow or a single agent — the coordination overhead buys
you nothing and the ~15x token premium buys you less.
:::

## When an agent is right

Reach for an agent when:

- the number of steps cannot be known ahead of time;
- the path depends on what earlier steps discover;
- the task is open-ended enough that enumerating the branches is impractical.

Debugging an unfamiliar failure, exploring a codebase, and open-ended research all qualify.
Formatting a document does not.

## What this looks like in a question

A scenario describes a document pipeline: extract fields, validate them, enrich from a
lookup service, format the output. It always runs in that order. The distractors will offer
a coordinator agent with specialised subagents, and it will sound sophisticated.

It is a workflow. The steps are known, fixed and sequential. Prompt chaining with a
validation checkpoint between steps is the correct design, and it is cheaper, faster and
easier to debug than anything with an agent in it.
