---
id: d1-hub-and-spoke
track: d1
order: 4
title: Hub-and-spoke coordination
summary: Why the coordinator owns every conversation, why spokes never talk to each other, and how failures stay contained.
minutes: 7
courseChapter: orchestration
---

When a scenario has more than one agent in it, the exam has one expected topology.

## The rule

::: key-fact Hub-and-spoke
The coordinator is the hub and manages **all** communication. Subagents are spokes: they
talk to the coordinator and to nobody else. There is no subagent-to-subagent channel.
:::

```text
                    ╭───────────────╮
          ╭─────────┤  COORDINATOR  ├─────────╮
          │         ╰───────┬───────╯         │
          ▼                 ▼                 ▼
     ╭─────────╮      ╭──────────╮      ╭───────────╮
     │ search  │      │ analysis │      │ synthesis │
     ╰─────────╯      ╰──────────╯      ╰───────────╯
       no lateral edges — spokes never talk to each other
```

## Why flat topologies are the wrong answer

A mesh where every agent can call every other agent looks more capable and is worse in every
dimension the exam cares about:

- **No single owner of state.** Nobody can answer "what has been done so far".
- **Failures cascade.** One agent's bad output becomes another's input with no checkpoint.
- **Cost is unbounded.** Agents can loop between each other indefinitely.
- **It is undebuggable.** There is no single trace to read.

With a hub, one subagent failing is contained: the coordinator sees the failure, records it,
and decides whether to retry, route around it, or degrade gracefully with partial results.

::: trap Letting a failure become silence
The isolation only helps if the failure is *reported*. A subagent that hits an error and
returns an empty result tells the coordinator nothing distinguishable from "there was
nothing to find". Return structured error context — what was attempted, what failed, what
partial results exist, what alternatives remain.
:::

## Parallel versus sequential delegation

- **Parallel** — the coordinator issues several delegations in a single response. Correct
  when the subtasks are independent.
- **Sequential** — the coordinator waits for one result before deciding the next delegation.
  Necessary when a later subtask depends on an earlier one's output.

The choice is driven entirely by dependency. If subtask B needs A's findings, it cannot run
concurrently with A, and the coordinator must pass A's output into B's prompt explicitly.

## What the coordinator is actually for

Three jobs, and only three:

1. **Decompose** the task into subtasks.
2. **Delegate**, passing each subagent exactly the context it needs.
3. **Synthesise** the returned summaries into one answer.

Note what is not on the list: doing the work. A coordinator that reads all twelve files
itself has no reason to exist, and it reintroduces the context pressure the subagents were
supposed to relieve.

::: exam-tip Recognising the topology question
Any stem containing "one specialised agent needs information another agent discovered" is
testing whether you know the answer routes **through** the coordinator. The subagents cannot
address each other, so the coordinator must receive the first result and include it in the
second delegation's prompt.
:::
