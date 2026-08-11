---
id: orientation-exam-day
track: orientation
order: 3
title: Exam-day strategy and the time budget
summary: How to spend 120 minutes, how to read a scenario-based distractor, and the reasoning checklist to run on every question.
minutes: 7
courseChapter: scenarios
---

Sixty questions, 120 minutes, four scenarios you have never seen in this exact combination.
The candidates who run out of time are almost never the ones who did not know the material —
they are the ones who read every scenario preamble three times.

## The time budget

| Minutes | Doing |
|---|---|
| 0–10 | Read the scenario preambles. Get the shape of all four before answering anything. |
| 10–90 | Work the scenarios, roughly 20 minutes each. |
| 90–110 | Anything left over, plus the questions you skipped. |
| 110–120 | Review everything you flagged. |

Two minutes per question is the average, not the target. Easy questions should take forty
seconds so that the genuinely ambiguous ones can have four minutes.

::: exam-tip Flag and move
There is no penalty for guessing and no bonus for answering in order. If a question has not
resolved in ninety seconds, put down your best guess, flag it, and move. A flagged question
with an answer already in it costs you nothing and might be right; a blank one is guaranteed
to be worth zero.
:::

## How to read a scenario question

Every question is doing one of a small number of things. Identify which before you read the
options:

1. **"Which should you do?"** — pick the correct architecture.
2. **"Which should you NOT do?"** / **"What is the flaw?"** — the polarity is inverted, and
   three of the four options are things you would happily do.
3. **"Why did this fail?"** — diagnostic; find the mechanism, not the symptom.
4. **"What is the trade-off?"** — usually cost, latency, or reliability against each other.

## The checklist to run on every question

::: key-fact Four questions to ask before you answer
1. **Which domain is this?** It tells you which body of rules applies.
2. **Is this a "what" or a "what not"?** Get the polarity right.
3. **Does the scenario say "always", "never", "guaranteed", or "must"?** If so, prefer the
   deterministic mechanism — hook, permission rule, schema, gate — over any prompt-based one.
4. **Is the simplest option adequate?** The exam consistently rewards the least autonomous
   design that meets the requirement.
:::

## The distractors are the whole exam

Wrong answers on this paper are not obviously wrong. They are things that sound like good
engineering and fail for a specific, teachable reason. The recurring families:

- **"Add an instruction to the system prompt."** Probabilistic where the scenario demanded
  a guarantee.
- **"Use a bigger context window."** Does not fix attention; usually makes it worse.
- **"Have the model report its confidence and escalate below a threshold."** Self-reported
  confidence is poorly calibrated.
- **"Give the agent access to all the tools."** Selection accuracy degrades as tool count
  climbs.
- **"Switch to a more capable model."** Occasionally right, but on this exam it is usually
  a distractor hiding a design problem — most often a vague tool description.
- **"Use the Batch API."** Correct for overnight work, badly wrong anywhere a user is
  waiting.
- **"Let the same instance review its own output."** Generator bias; the reviewer needs to
  be independent.

::: trap "More capable model" is rarely the answer
If a scenario describes Claude choosing the wrong tool, the intended fix is almost always a
better tool description or fewer tools in scope — not a model upgrade and not forcing
`tool_choice`. Model upgrades are the exam's favourite way to look helpful while dodging the
actual design flaw.
:::

## Before you sit

Closed book, proctored, no Claude and no documentation. That has one practical consequence
for revision: anything that is a *number* — cache TTLs, minimum cacheable tokens, retryable
status codes, hook exit codes — has to be actually memorised, because you will not be able to
look it up. That is what the flashcard decks on this site are for. Everything else you can
reason your way to from the mental models.
