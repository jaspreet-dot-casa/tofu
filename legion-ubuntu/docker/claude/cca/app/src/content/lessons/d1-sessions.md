---
id: d1-sessions
track: d1
order: 6
title: Sessions, resuming and forking
summary: How conversation state persists between runs, the difference between resuming and forking, and when each is correct.
minutes: 6
courseChapter: sessions
---

A session is a persisted conversation. Getting the resume/fork distinction right is worth a
question or two on its own, and it shows up inside the support and CI/CD scenarios.

## Resume

Continuing a session picks up the existing conversation with its **full history intact**.
Everything that was said, every tool result, every decision — still there.

```bash
claude --resume <session_id>
```

`--continue` does the same for the most recent session without needing the id.

Use it when the work is genuinely a continuation: the same customer, the same investigation,
the same task picked up after an interruption.

## Fork

Forking creates an **independent branch** from the session's current state.

::: key-fact Forks do not propagate back
A forked session starts with a copy of the history and then diverges. Nothing that happens
in the fork appears in the original. If a question describes work done in a fork and then
asks what the parent sees, the answer is: nothing.
:::

Use it when you want to try something from a known state without contaminating the original —
exploring an alternative approach, running a risky experiment, or branching one investigation
into several.

## Choosing between them

| The scenario wants | Use |
|---|---|
| Pick up where we left off, same thread | Resume |
| Several independent explorations from one starting point | Fork |
| Work that must not affect the original conversation | Fork |
| A support agent handling the customer's follow-up call | Resume |

::: exam-tip Session isolation in CI
Pipeline jobs should not share a session. Each PR review is an independent piece of work, and
sharing state between them leaks one PR's context into another's review. "Session isolation"
in a CI/CD question means a fresh session per job, not resuming a long-lived one.
:::

## Sessions versus context

Two different concerns that questions sometimes blur:

- A **session** is persistence — does the conversation survive between invocations.
- A **context window** is capacity — how much of that conversation fits in the next request.

Resuming a very long session does not magically exempt it from the context limit. A long
resumed conversation still needs compaction or trimming, which is Domain 5's territory. If a
question describes an agent that resumed successfully but then started behaving
inconsistently, the problem is context, not the session.

## Skills that fork

Claude Code skills can declare `context: fork` in their frontmatter, which runs the skill in
an isolated subagent rather than in the main conversation. The reason is practical: a skill
that produces a lot of intermediate output would otherwise fill the main context with noise.
Forking keeps the main thread clean and returns only the result.
