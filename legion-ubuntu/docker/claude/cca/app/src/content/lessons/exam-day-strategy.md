---
id: orientation-exam-day
track: orientation
order: 3
title: Exam-day strategy and the time budget
summary: How to spend 120 minutes, how to read a scenario-based distractor, and the reasoning checklist to run on every question.
minutes: 7
courseChapter: scenarios
---

Sixty questions. 120 minutes. Four scenarios you have never seen in this exact mix.

The people who run out of time are almost never the ones who did not know the material. They
are the ones who read every scenario write-up three times.

## The time budget

| Minutes | Doing |
|---|---|
| 0–10 | Read all four scenario write-ups. Get the shape of everything before answering anything. |
| 10–90 | Work through the scenarios, about 20 minutes each. |
| 90–110 | Anything left over, plus the questions you skipped. |
| 110–120 | Review everything you flagged. |

Two minutes per question is the average, not the target. Easy questions should take forty
seconds, so the genuinely hard ones can have four minutes.

::: exam-tip Flag and move
There is no penalty for guessing and no bonus for answering in order. If a question has not
clicked in ninety seconds, put down your best guess, flag it, and move on. A flagged question
with a guess in it costs you nothing and might be right. A blank one is worth zero for
certain.
:::

## How to read a question

Every question is doing one of a few jobs. Work out which one before you read the options:

1. **"Which should you do?"** — pick the right design.
2. **"Which should you NOT do?"** / **"What is the flaw?"** — the question is flipped, and
   three of the four options are things you would happily do.
3. **"Why did this fail?"** — find the cause, not the symptom.
4. **"What is the trade-off?"** — usually cost, speed, or reliability pulling against each
   other.

## The checklist to run on every question

::: key-fact Four things to ask before you answer
1. **Which domain is this?** That tells you which set of rules applies.
2. **Is it a "what" or a "what not"?** Get the direction right.
3. **Does it say "always", "never", "guaranteed", or "must"?** If so, pick the mechanism that
   enforces it — hook, permission rule, schema, gate — over anything prompt-based.
4. **Would the simpler option do the job?** The exam keeps rewarding the least complicated
   design that meets the requirement.
:::

## The wrong answers are the whole exam

Wrong answers here are not obviously wrong. They sound like good engineering. Each one fails
for a specific reason you can learn. The ones that keep coming back:

- **"Add an instruction to the system prompt."** That is a request, where the question asked
  for a guarantee.
- **"Use a bigger context window."** Does not fix attention; usually makes it worse.
- **"Have the model report its confidence and escalate when it is low."** Models are bad at
  judging their own confidence.
- **"Give the agent access to all the tools."** The more tools it has, the worse it picks.
- **"Switch to a more capable model."** Sometimes right, but on this exam it is usually
  hiding a design problem — most often a vague tool description.
- **"Use the Batch API."** Right for overnight work. Badly wrong anywhere a person is
  waiting.
- **"Let the same instance review its own output."** It cannot see its own mistake. The
  reviewer has to be a separate one.

::: trap "More capable model" is rarely the answer
If a question describes Claude choosing the wrong tool, the fix is nearly always a better tool
description or fewer tools available. It is not a model upgrade, and it is not forcing
`tool_choice`. Upgrading the model is the exam's favourite way to look helpful while dodging
the real design flaw.
:::

## Before you sit

Closed book, proctored, no Claude and no documentation. That has one practical effect on how
you revise: anything that is a *number* — cache TTLs, minimum cacheable tokens, retryable
status codes, hook exit codes — has to be genuinely memorised, because you cannot look it up.

That is what the flashcard decks on this site are for. Everything else you can work out from
the mental models.
