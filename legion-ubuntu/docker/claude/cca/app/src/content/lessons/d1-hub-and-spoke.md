---
id: d1-hub-and-spoke
track: d1
order: 4
title: Hub-and-spoke coordination
summary: Why the coordinator owns every conversation, why spokes never talk to each other, and how failures stay contained.
minutes: 7
courseChapter: orchestration
---

When a question has more than one agent in it, the exam expects one shape. It is called
hub-and-spoke, and it works like a bicycle wheel: everything connects to the middle, nothing
connects around the rim.

## The rule

::: key-fact Hub-and-spoke
The coordinator is the hub and handles **all** communication. Subagents are the spokes. They
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

## Why "everyone talks to everyone" is the wrong answer

A design where every agent can call every other agent looks more capable. It is worse in every
way the exam cares about:

- **Nobody owns the state.** No one can answer "what has been done so far?"
- **Failures spread.** One agent's bad output becomes another's input, with nothing in
  between to catch it.
- **Cost has no ceiling.** Agents can bounce work between each other forever.
- **You cannot debug it.** There is no single trace to read.

With a hub, one subagent failing stays contained. The coordinator sees the failure, records
it, and decides whether to retry, work around it, or carry on with partial results.

::: trap A failure that turns into silence
Containing a failure only helps if the failure is *reported*.

A subagent that hits an error and returns an empty result tells the coordinator nothing. An
empty result looks exactly like "I looked, and there was nothing there."

Return structured error information instead: what you tried, what failed, what partial results
you have, and what else could be tried.
:::

## Running subagents at the same time, or one after another

- **At the same time** — the coordinator sends out several delegations in one response. Right
  when the pieces do not depend on each other.
- **One after another** — the coordinator waits for one result before deciding the next
  delegation. Needed when a later piece depends on an earlier one's output.

Dependency decides this, nothing else. If task B needs A's findings, it cannot run alongside
A. The coordinator has to take A's output and put it into B's prompt itself.

## What the coordinator is actually for

Three jobs, and only three:

1. **Break up** the task into pieces.
2. **Hand out** each piece, giving that subagent exactly the context it needs.
3. **Combine** the returned summaries into one answer.

Notice what is not on the list: doing the work.

A coordinator that reads all twelve files itself has no reason to exist. It also fills up its
own context window, which is the exact problem the subagents were there to prevent.

::: exam-tip Recognising the topology question
Any question containing "one specialised agent needs information another agent found" is
testing whether you know the answer goes **through** the coordinator.

The subagents cannot talk to each other. So the coordinator must take the first result and
include it in the second delegation's prompt.
:::
