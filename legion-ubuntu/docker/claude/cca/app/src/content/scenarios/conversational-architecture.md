## The brief

A multi-turn assistant — a tutor, a shopping helper, a support chat — has to stay coherent over
dozens of turns. It must remember what matters, keep behaving the way it was told to, work out
what the user actually wants when they say two incompatible things, and never let a chat turn
into an irreversible action nobody confirmed.

This scenario is unusual: almost none of it is about the model. It is about the plumbing you
build around a **stateless** API.

## Start here: nothing is remembered

::: key-fact The Claude API keeps no server-side conversation state
Every request is standalone. If turn 12 is to know what happened in turn 3, your application
has to put turn 3 back into the `messages` array of request 12. There is no `session_id`, no
server-side memory, no hidden profile of the user.
:::

```text
  turn 1        turn 2              turn 3
╭────────╮   ╭───────────╮   ╭──────────────────╮
│ [u1]   │   │ [u1,a1,u2]│   │ [u1,a1,u2,a2,u3] │   every request resends
╰───┬────╯   ╰─────┬─────╯   ╰────────┬─────────╯   the whole history
    ▼              ▼                  ▼
  ╭───────────────────────────────────────────╮
  │  Claude API — stateless, forgets each time │
  ╰───────────────────────────────────────────╯
```

Two exam answers fall straight out of this picture:

- **"The assistant forgot what I said two messages ago."** Your app is not appending prior
  turns to `messages`. It is not a context-window overflow, and it is not a missing vector
  database.
- **"Latency and cost climb as the conversation gets long."** Of course they do — every request
  carries the entire history. The model is not writing longer replies and it is not building a
  profile of the user.

## Memory: match the strategy to the decay

There are three broad strategies and the exam wants the one that fits the *symptom*, not the
most sophisticated one available.

| Symptom | Strategy |
|---|---|
| One long session, running hot on tokens, a few facts must survive exactly | Extract critical facts to a structured block, summarise the chat, keep recent turns verbatim |
| Preferences from earlier in a long session keep getting dropped | Hybrid: summarise older turns, keep recent ones verbatim |
| Months of sessions; user asks "what did we conclude about X?" | Semantic retrieval over stored history |

::: trap Summarising everything loses exactly what you needed
Numbers, dates, quantities and allergies are the first casualties of summarisation — they come
back as "about", "roughly", "a few". Anything that must survive precisely gets **extracted into
a structured block**, not summarised.
:::

Two failure modes to recognise as wrong answers:

- **Just make the window bigger** (25 message pairs → 50). Delays the same problem by one
  conversation. It is not a fix.
- **Semantic search for everything.** Right for months of archived discussion, overkill for a
  single 40-minute session — and it can miss context that matters but is not semantically
  similar to the current question.

## Instruction drift

The assistant follows the system prompt for ten or fifteen turns, then quietly stops.
Token limits are nowhere in sight.

::: key-fact Drift is a ratio problem, not an attention problem
As the assistant's own replies pile up, the system prompt is a shrinking fraction of the
conversation. The model increasingly pattern-matches to its own recent output rather than to
the original instructions. This happens at 2,500 tokens, long before any context limit.
:::

What works, in rough order of preference:

1. **Replace verbose declarative rules with few-shot examples.** A 2,800-token block of abstract
   rules must be re-reasoned every turn. Demonstrations are matched, not reasoned about.
2. **Re-inject the constraints periodically** at conversation breakpoints, as user-role
   messages.
3. **Prefill the assistant turn** when the problem is a specific surface tic — the samey
   "Certainly! I'd be happy to help!" opener. Prefilling starts the reply mid-answer so the
   greeting never gets generated.

What does not work: moving the guidelines into the first user message (weaker authority than a
system prompt), putting them in the first assistant message (the model deviates from its own
prior statements happily), or starting a fresh conversation every twenty turns (that is
destroying the context, not managing it).

::: exam-tip Behavioural guidelines live in the system prompt
Persistent tone, reasoning style, and "always ask a clarifying question" rules belong in the
system prompt — not prepended to every user message, not in environment variables.
:::

## Ambiguity, contradiction, and when to just get on with it

These look similar and have opposite answers.

- **The user contradicts themselves** — "I have very low risk tolerance" and "I want to
  maximise returns". These cannot both be satisfied. Surface the conflict and ask. Do not
  silently take the most recent statement, and do not paper over it with a balanced answer.
- **The user is merely vague** — "can you help with the report?" Interrogating them costs you
  the conversation; abandonment rates in this scenario run 35–40%. **State your assumptions
  explicitly, proceed, and invite correction.**

::: trap Silent defaults are not the same as stated assumptions
Both proceed without asking. Only one leaves the user able to notice you guessed wrong.
:::

A structured intake form and a stack of clarifying questions are both *more* friction, not
less — reliably wrong when the stated problem is abandonment.

## Real-time events mid-conversation

A webhook fires while the user is chatting. Attach the update as a prefix to the next user
message: it lands at a natural boundary, needs no session rebuild, and does not confuse who
said what. Rebuilding the system prompt is cumbersome, a synthetic user message muddles
attribution, and polling a status tool every turn burns calls on an event that rarely happens.

## Tools that must not fire by accident

A chat interface plus a destructive tool is the dangerous combination in this scenario.

::: key-fact Enforce it in the schema, not in the description
A `dry_run: boolean` flag asks the model to behave. Two tools — `preview_x` returning a
single-use token, and `execute_x` requiring that token — make the unsafe path structurally
impossible to express.
:::

```text
  ╭────────────────────╮   token   ╭─────────────────────╮
  │  preview_remove()  ├──────────▶│  execute_remove()   │
  │  returns impact +  │           │  requires token     │
  │  single-use token  │           │  no token → refuse  │
  ╰────────────────────╯           ╰─────────────────────╯
        the only path to execution runs through preview
```

The same instinct applies to errors. If a tool fails 8% of the time on network timeouts and 4%
on unfixable query-syntax errors, do not hand the model a `retryable` flag and hope. The tool
knows which is which: retry the timeouts inside the tool with backoff, and return the syntax
errors immediately with the parameter details that would fix them.

## What the exam will ask

- Why the assistant "forgot" — and that the answer is your `messages` array, every time
- Which memory strategy fits a stated symptom
- What actually stops instruction drift, and why bigger prompts do not
- Contradiction (ask) versus vagueness (assume out loud and proceed)
- How to make a destructive tool impossible to call unconfirmed
