---
id: d3-explicit-criteria
track: d3
order: 1
title: Explicit, testable criteria
summary: Why vague guidance fails, what a testable criterion looks like, and how to structure a system prompt.
minutes: 6
courseChapter: reliability
---

The most common prompt problem on this exam is not a missing technique. It is an instruction
nobody could mark.

## Vague versus testable

> "Be conservative when flagging issues."

Conservative compared to what? A reviewer given this will flag things differently on Tuesday
than it did on Monday, and you have no way to say which run was right.

> "Only flag issues of severity high or above that have a direct security impact."

Now you can check it. Look at any flagged issue and say yes or no: should that have been
flagged?

::: key-fact Every instruction must be checkable
If you cannot look at an output and mechanically decide whether it followed the instruction,
it is not an instruction. It is a mood.

Replacing vague guidance with checkable criteria is the single highest-value prompt fix, and a
recurring correct answer.
:::

More pairs worth recognising:

| Vague | Checkable |
|---|---|
| "Summarise briefly" | "Summarise in at most three sentences" |
| "Escalate if unsure" | "Escalate if the policy lookup returns no exact match" |
| "Use a professional tone" | "Do not use exclamation marks, emoji, or first-person plural" |
| "Return relevant results" | "Return the five results with the highest score, highest first" |

## How to structure a system prompt

A reliable order:

1. **Role** — one sentence. "You are a support agent for an e-commerce returns desk."
2. **Criteria** — a numbered list of checkable rules.
3. **Boundaries** — what is out of scope, written as "Do not…".
4. **Output format** — with an example.

Keep it under roughly 2000 tokens. A system prompt long enough to bury its own instructions
has the same problem as any other long context: the middle gets ignored.

::: exam-tip System prompt versus user turn
Stable instructions and persona go in the top-level `system` parameter. The specific task input
goes in the user turn.

That is tidier, but it also matters for prompt caching. A system prefix that never changes can
be cached. Mixing variable content into it is what breaks the cache.
:::

## Say what you want, not what you do not

"Write in flowing prose" works better than "do not use markdown".

A positive instruction describes a target. A negative one describes a space of things to
avoid, and leaves the target unsaid.

This generalises. Whenever a prompt is a list of prohibitions, ask what the output should
actually look like, and say that instead.

::: trap Fixing behaviour by adding more prohibitions
A prompt that has collected six "do not" clauses is usually missing one clear positive
instruction.

And if the behaviour genuinely must never happen, you are in hook and permission-rule
territory, not prompt territory.
:::

## Where prompting stops

Prompting shapes behaviour. It does not guarantee it. Two limits the exam tests directly:

- **Ordering cannot be prompted.** "Always call `validate` before `submit`" is a rule that
  must hold every time, so it needs a gate in your code. Examples do not enforce tool
  ordering.
- **Format cannot be prompted.** "Respond with valid JSON" is a request. A schema is a
  guarantee.

Both come up again in the next two lessons.
