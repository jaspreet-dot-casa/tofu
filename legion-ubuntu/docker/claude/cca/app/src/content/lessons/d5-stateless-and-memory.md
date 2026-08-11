---
id: d5-stateless-memory
track: d5
order: 6
title: Statelessness and conversation memory
summary: Why the API remembers nothing, what that costs as a chat grows, and which of the three memory strategies fits which kind of forgetting.
minutes: 8
courseChapter: scaling-context
---

Most of what looks like a model problem in a long conversation is an application problem. This
chapter is the one fact everything else hangs off, and the three repairs built on top of it.

## Nothing is remembered

::: key-fact The Claude API holds no server-side conversation state
Every request is standalone. For turn 12 to know what happened in turn 3, your application has
to put turn 3 back into the `messages` array of request 12. There is no `session_id` parameter,
no server-side history, no profile of the user being built behind the scenes.
:::

```text
  turn 1        turn 2              turn 3
╭────────╮   ╭───────────╮   ╭──────────────────╮
│ [u1]   │   │ [u1,a1,u2]│   │ [u1,a1,u2,a2,u3] │   every request resends
╰───┬────╯   ╰─────┬─────╯   ╰────────┬─────────╯   the whole history
    ▼              ▼                  ▼
  ╭────────────────────────────────────────────╮
  │  Claude API — stateless, forgets each time  │
  ╰────────────────────────────────────────────╯
```

Two exam answers fall straight out of that picture.

**"The assistant forgot what I told it two messages ago."** Your app is not appending prior
turns. It is not a context-window overflow — two messages cannot overflow anything — and it is
not a missing vector database.

**"Latency and cost climb as the conversation gets long."** Of course they do. Every request
carries the whole history, so every request is bigger than the last. The model is not writing
longer replies as it goes, and it is not doing extra processing to maintain a user profile.

::: trap Sessions in the SDK do not make the API stateful
Claude Code and the Agent SDK give you sessions you can resume and fork. That is the *SDK*
storing the transcript and replaying it for you. Underneath, every call is still the full
history going over the wire. Resuming a session is convenience, not server memory.
:::

## Three memory strategies, three different symptoms

Once a conversation gets long enough that you cannot resend all of it, you have to drop
something. The exam gives you a symptom and wants the strategy that fits it — not the most
sophisticated one on the list.

| Symptom | Strategy |
|---|---|
| One long session, running hot on tokens, a handful of facts must survive **exactly** | Extract critical facts into a structured block, summarise the general chat, keep recent turns verbatim |
| Preferences stated earlier in a long session keep getting dropped | Hybrid: summarise older turns, keep recent ones verbatim |
| Months of separate sessions; "what did we conclude about X?" | Semantic retrieval over stored history |

### Why the hybrid keeps winning

The hybrid answer — summarise the old, keep the recent verbatim — turns up as the right answer
more than any other, because it is the only one that addresses both halves of the problem at
once. Recent turns need to be exact for the conversation to stay coherent; older turns only
need their gist to survive.

::: trap Summarising everything destroys exactly what you needed
Numbers, dates, quantities, allergies and prices are the first casualties of summarisation.
They come back as "about", "roughly", "a few". Anything that must survive **precisely** gets
extracted into a structured block, not summarised into prose.
:::

Two wrong answers worth recognising on sight:

- **Make the window bigger.** Twenty-five message pairs to fifty. This delays the identical
  failure by one conversation. It is not a fix, and the exam will offer it.
- **Semantic search for everything.** Correct for months of archived discussion. Overkill for
  a single forty-minute session, and it can miss context that matters but happens not to be
  semantically similar to the current question.

### When retrieval genuinely is the answer

Scale is the tell. Three months of weekly sessions and 85,000 tokens of history, with a user
asking about a specific conclusion from six weeks ago — no summary retains that, and no
rolling window reaches it. Embedding the exchanges and retrieving the relevant ones on demand
is the only approach that scales that far *and* can surface a specific past exchange.

## Injecting something that happens mid-conversation

A webhook fires while the user is typing — their order shipped. The clean answer is to **prefix
the update onto the next user message**. It arrives at a natural boundary, needs no session
rebuild, and does not muddle who said what.

The alternatives all cost more than they return: rewriting the system prompt is architecturally
awkward, a synthetic user message confuses attribution, and forcing a status-check tool call on
every turn burns calls on an event that almost never fires.

::: exam-tip Reach for the cheapest mechanism that lands the information
Across this whole domain the pattern holds: prefix over rebuild, extract over summarise,
summarise over retrieve, and retrieve only when the scale genuinely demands it.
:::
