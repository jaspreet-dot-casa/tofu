---
id: d3-explicit-criteria
track: d3
order: 1
title: Explicit, testable criteria
summary: Why vague guidance fails, what a testable criterion looks like, and how to structure a system prompt.
minutes: 6
courseChapter: reliability
---

The most common prompt defect on this exam is not a missing technique. It is an instruction
nobody could grade.

## Vague versus testable

> "Be conservative when flagging issues."

Conservative compared to what? A reviewer given this will flag differently on Tuesday than it
did on Monday, and you have no way to say which run was correct.

> "Only flag issues of severity high or above that have a direct security impact."

Now the instruction is a predicate. You can look at any flagged issue and say whether it
should have been flagged.

::: key-fact Every criterion must be testable
If you cannot look at an output and mechanically decide whether it satisfied the instruction,
the instruction is not a criterion — it is a mood. Replacing vague guidance with explicit
criteria is the single highest-yield prompt fix and a recurring correct answer.
:::

Other pairs worth recognising:

| Vague | Testable |
|---|---|
| "Summarise briefly" | "Summarise in at most three sentences" |
| "Escalate if unsure" | "Escalate if the policy lookup returns no exact match" |
| "Use a professional tone" | "Do not use exclamation marks, emoji, or first-person plural" |
| "Return relevant results" | "Return the five results with the highest score, descending" |

## Structuring a system prompt

A reliable order:

1. **Role** — one sentence. "You are a support agent for an e-commerce returns desk."
2. **Explicit criteria** — a numbered list.
3. **Boundary statements** — what is out of scope, stated as "Do not…".
4. **Output format** — with an example.

Keep it under roughly 2000 tokens. A system prompt long enough to bury its own instructions
has the same lost-in-the-middle problem as any other long context.

::: exam-tip System prompt versus user turn
Stable instructions and persona go in the top-level `system` parameter. Task-specific input
goes in the user turn. Beyond being cleaner, this matters for prompt caching — a stable
system prefix is cacheable, and interleaving variable content into it is what breaks the
cache.
:::

## Tell it what to do, not what to avoid

"Write in flowing prose" outperforms "do not use markdown". Positive instructions describe a
target; negative ones describe a space of things to avoid and leave the target unspecified.

This generalises: whenever a prompt is a list of prohibitions, ask what the desired output
actually looks like and say that instead.

::: trap Fixing a behaviour problem by adding more prohibitions
A prompt that has accumulated six "do not" clauses is usually one missing positive
specification. And if the behaviour genuinely must never happen, you are in hook and
permission-rule territory, not prompt territory.
:::

## Where prompting stops

Prompting shapes behaviour. It does not guarantee it. Two limits the exam tests directly:

- **Ordering and compliance** are not promptable. "Always call `validate` before `submit`" is
  a compliance requirement and needs a programmatic gate, not an instruction. Few-shot
  examples do not enforce tool ordering.
- **Format guarantees** are not promptable. "Respond with valid JSON" is probabilistic; a
  schema is not.

Both come up again in the next two lessons.
