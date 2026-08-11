---
id: d3-instruction-drift
track: d3
order: 7
title: Instruction drift over a long conversation
summary: Why a system prompt stops being obeyed around turn ten, why the token count is a red herring, and the three repairs in order of preference.
minutes: 7
courseChapter: reliability
---

The assistant follows its system prompt beautifully for ten or fifteen turns. Then it stops.
Nobody changed the prompt, and the conversation is nowhere near a token limit.

This has a name — instruction drift — and the exam tests whether you know what actually causes
it, because almost every plausible-sounding explanation is wrong.

## What is really happening

::: key-fact Drift is a ratio problem, not an attention problem
The system prompt is sent on every request and does not decay. What changes is everything
around it: as the assistant's own replies accumulate, the system prompt becomes a smaller and
smaller fraction of the conversation. The model increasingly pattern-matches against its own
recent output instead of the original instructions.
:::

```text
 turn 2                          turn 14
╭──────────────────╮            ╭──────────────────╮
│ ███ system       │            │ █ system         │
│ ░ history        │            │ ░░░░░░░░░░░░░░░  │
╰──────────────────╯            │ ░░░░░░ history   │
 prompt dominates               ╰──────────────────╯
                                 prompt is a rounding error
```

The critical detail: **this happens at 2,500 tokens**. It is not context-window pressure and it
is not the model's attention degrading over long inputs. If a question gives you a short
conversation and a drifting assistant, ratio is your answer.

::: trap "The system prompt is only sent once"
It is not. It goes with every single request — the API is stateless, so it has to. Anything
that explains drift by the prompt being sent once, or by the prompt "only establishing initial
behaviour", is wrong.
:::

## The three repairs, in order

### 1. Replace verbose rules with few-shot examples

A 2,800-token block of abstract, declarative rules is the most drift-prone thing you can write.
Every turn, the model has to re-reason from the rules to the behaviour. Concrete demonstrations
of the behaviour get matched instead of reasoned about, and matching survives a long
conversation far better.

This is the strongest fix when the rules describe something *demonstrable* — a tone, a
difficulty level, an output shape.

### 2. Re-inject the constraints periodically

Insert user-role reminders at conversation breakpoints, re-establishing the constraints every
few turns. This directly counteracts the ratio problem by topping the instructions back up.

It works, but it treats the symptom. Prefer it when the rules genuinely cannot be demonstrated
by example, or alongside fix 1.

### 3. Prefill the assistant turn

Narrow but effective for a *surface* tic — the identical "Certainly! I'd be happy to help!"
opener on every reply. Prefilling starts the assistant's message mid-answer, so the greeting is
never generated in the first place.

::: exam-tip Prefill fixes phrasing, not judgement
Prefill is the right answer for repetitive openings. It is the wrong answer for structured
output — that is what forced tool use is for — and it does nothing about behavioural drift.
:::

## What does not work

| Proposal | Why it is wrong |
|---|---|
| Move the guidelines into the first user message | Weaker authority than the system prompt, and it drifts the same way |
| Put them in the first assistant message | The model deviates from its own prior statements readily; it has no special standing |
| Start a fresh conversation every twenty turns | Destroys the context. That is abandoning the problem, not solving it |
| Lower the temperature | Controls randomness, not which instructions get followed |
| Validate every response and regenerate the bad ones | Corrective rather than preventive, and it doubles your latency and cost |
| Put the critical rules at the end of the prompt | Helps with lost-in-the-middle on turn one; does nothing about turn-fourteen drift |

That last row is worth dwelling on. Position within the prompt and drift across turns are two
different failures with two different fixes, and the exam will offer you the wrong one.

## Where behavioural guidelines belong

::: key-fact Persistent behaviour goes in the system prompt
Tone, reasoning style, "always ask a clarifying question first" — these are exactly what the
system prompt is for. Not prepended to every user message (redundant overhead), not in the
first assistant message (no authority), and certainly not in environment variables, which the
model never sees.
:::
