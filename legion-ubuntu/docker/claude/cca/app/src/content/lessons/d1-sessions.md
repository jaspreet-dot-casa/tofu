---
id: d1-sessions
track: d1
order: 6
title: Sessions, resuming and forking
summary: How conversation state persists between runs, the difference between resuming and forking, and when each is correct.
minutes: 6
courseChapter: sessions
---

A session is a saved conversation. You can come back to it later.

There are two ways to come back to one, and knowing which is which is worth a question or two
on its own. It also shows up inside the support and CI/CD scenarios.

## Resume

Resuming picks up an existing conversation with its **full history still there**. Everything
that was said, every tool result, every decision.

```bash
claude --resume <session_id>
```

`--continue` does the same for the most recent session, without needing the id.

Use it when the work really is a continuation: the same customer, the same investigation, the
same task picked up after a break.

## Fork

Forking makes a **separate branch** from where the session is now.

::: key-fact Nothing in a fork goes back to the original
A forked session starts with a copy of the history and then goes its own way. Nothing that
happens in the fork shows up in the original.

If a question describes work done in a fork and asks what the parent sees, the answer is:
nothing.
:::

Use it when you want to try something from a known starting point without messing up the
original — testing another approach, running a risky experiment, or splitting one
investigation into several.

## Choosing between them

| The situation wants | Use |
|---|---|
| Pick up where we left off, same thread | Resume |
| Several separate explorations from one starting point | Fork |
| Work that must not affect the original conversation | Fork |
| A support agent handling the customer's follow-up call | Resume |

::: exam-tip Session isolation in CI
Pipeline jobs should not share a session. Each PR review is its own piece of work, and sharing
state between them leaks one PR's context into another's review.

"Session isolation" in a CI/CD question means a fresh session per job — not resuming a
long-lived one.
:::

## Sessions and context are different things

Questions sometimes blur these two, so keep them apart:

- A **session** is about saving. Does the conversation survive between runs?
- A **context window** is about capacity. How much of that conversation fits into the next
  request?

Resuming a very long session does not exempt it from the context limit. A long resumed
conversation still needs compacting or trimming, which is Domain 5's territory.

So if a question describes an agent that resumed fine but then started behaving oddly, the
problem is context, not the session.

## Skills that fork

Claude Code skills can set `context: fork` in their frontmatter. That runs the skill in a
separate subagent instead of in the main conversation.

The reason is practical. A skill that produces a lot of intermediate output would otherwise
clog the main context with noise. Forking keeps the main thread clean and returns only the
result.
