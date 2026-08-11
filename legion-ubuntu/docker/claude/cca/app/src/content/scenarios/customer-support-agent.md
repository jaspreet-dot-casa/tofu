## The brief

A support agent handles returns, billing and account issues, aiming to resolve 80%+ of cases
on first contact. It should act confidently where the policy is clear, and hand over cleanly
where it is not.

## The architecture

A **single agent**, not a multi-agent system.

The work happens in order, it shares one running conversation, and it fits comfortably in one
context window. A coordinator handing off to a "returns agent", a "billing agent" and an
"account agent" is exactly the over-engineering that the *start simple* rule exists to prevent.
It would also break apart the conversation state that makes the agent useful in the first
place.

Tools, kept tight:

| Tool | Purpose |
|---|---|
| `search_orders` | Order history by email, reference or date |
| `check_refund_policy` | Applies current policy to a specific order |
| `issue_refund` | The only tool that changes anything — gated |
| `escalate_to_human` | Structured handover |

Four tools. Comfortably inside the range where the model picks accurately.

## The escalation rules

This is what the scenario is really testing.

::: key-fact Escalate on
The customer asks for a human · the policy is unclear · nothing has worked after several
attempts · the action cannot be undone or is high-value.
:::

::: trap Do not escalate on
The customer being annoyed · the model saying it is not confident · a task that is just
complicated when the policy is actually clear.
:::

Escalation has to be a **fixed rule in code**, checked against facts your system owns:

```text
refund_amount > 500                    → escalate
policy_lookup returned no exact match  → escalate
resolution_attempts >= 3               → escalate
customer typed "speak to a human"      → escalate
sentiment == "angry"                   → do NOT escalate on this alone
```

Asking the model "how confident are you?" and escalating on a low number is the anti-pattern.
Models are bad at judging their own confidence, and they fail exactly on the cases you needed
to catch.

## Context in a long conversation

Twenty turns in, the order number from turn 2 is buried in the middle of the context — the
worst possible place for it.

The fix is a **structured block of case facts, kept at the top of the prompt**:

```json
{
  "customer_id": "C-88213",
  "order_ref": "ORD-4417",
  "issue": "damaged_on_arrival",
  "policy_applied": "damaged_goods_30d",
  "refund_authorised": null,
  "attempts": 2
}
```

Facts get added to it as they are established, and it is re-inserted at the top of every
request. Now the critical data sits where attention is strongest, and nothing depends on the
model remembering turn 2.

Trim bulky tool output as you go, too. A full order payload with 40 fields, repeated across ten
turns, is most of your window spent on data nobody needed twice.

## Sessions

The customer calls back tomorrow: **resume**. Same thread, full history, continuity intact.

Trying out two possible resolutions without messing up the real conversation: **fork**. Nothing
in the fork goes back to the parent.

## Cost

A long policy document in the system prompt, many requests against it, all within a short
window. That is the textbook **prompt caching** case.

Cache the policy block. Put the per-customer content after the breakpoint.

::: trap Never Batch here
A customer is waiting. Batch gives no promise about timing and can take up to 24 hours.

Cost pressure in an interactive workflow is solved by caching, and by routing simple queries to
a cheaper model. Never by Batch.
:::

## What the exam will ask

- Which signal legitimately triggers escalation — and which one is the trap
- Why the confidence score is the wrong trigger, and what replaces it
- Where the order number should live after twenty turns
- Resume versus fork
- Why not multi-agent
- Why not Batch
