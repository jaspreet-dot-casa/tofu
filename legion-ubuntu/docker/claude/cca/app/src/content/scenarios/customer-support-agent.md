## The brief

A support agent handles returns, billing and account issues, targeting 80%+ first-contact
resolution. It must resolve confidently where policy is clear, and hand off cleanly where it
is not.

## The architecture

A **single agent**, not a multi-agent system. The work is sequential, shares one evolving
conversation, and fits comfortably in one context. A coordinator delegating to
"returns agent", "billing agent" and "account agent" is the over-engineering the *start
simple* rule exists to prevent — and it would fragment exactly the conversational state that
makes the agent useful.

Tools, scoped tightly:

| Tool | Purpose |
|---|---|
| `search_orders` | Order history by email, reference or date |
| `check_refund_policy` | Applies current policy to a specific order |
| `issue_refund` | The only mutating tool — gated |
| `escalate_to_human` | Structured handoff |

Four tools, comfortably inside the range where routing stays accurate.

## The escalation rules

This is what the scenario is really about.

::: key-fact Escalate on
Explicit request for a human · ambiguous policy · no progress after several attempts ·
irreversible or high-value actions.
:::

::: trap Do not escalate on
Customer frustration alone · a low self-reported confidence score · a task that is merely
complicated when the policy is clear.
:::

Escalation must be a **deterministic rule in code**, evaluated against facts the system owns:

```text
refund_amount > 500                    → escalate
policy_lookup returned no exact match  → escalate
resolution_attempts >= 3               → escalate
customer typed "speak to a human"      → escalate
sentiment == "angry"                   → do NOT escalate on this alone
```

Asking the model "how confident are you?" and thresholding on the answer is the anti-pattern.
Self-reported confidence is poorly calibrated and fails on precisely the cases you need to
catch.

## Context across a long conversation

Twenty turns in, the order number from turn 2 is deep in the middle of the context — the
worst place for it.

The fix is a **structured case-facts block, maintained at the top of the prompt**:

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

Facts get extracted into it as they are established, and it is re-injected at the top of every
request. Now the critical data is in the highest-attention region and no longer depends on the
model recalling turn 2.

Trim verbose tool output as you go. A full order payload with 40 fields, repeated across ten
turns, is most of your window spent on data nobody needed twice.

## Sessions

The customer calls back tomorrow: **resume**. Same thread, full history, continuity intact.

Exploring two possible resolutions without contaminating the real conversation: **fork**.
Nothing in the fork returns to the parent.

## Cost

Long policy documents in the system prompt, many requests against them, within a short
window — this is the textbook **prompt caching** case. Cache the policy block, put the
per-customer content after the breakpoint.

::: trap Never Batch here
A customer is waiting. Batch has no latency guarantee and can take up to 24 hours. Cost
pressure in an interactive workflow is solved by caching and by routing simple queries to a
cheaper model, never by Batch.
:::

## What the exam will ask

- Which signal legitimately triggers escalation — and which one is the trap
- Why the confidence score is the wrong gate, and what replaces it
- Where the order number should live after twenty turns
- Resume versus fork
- Why not multi-agent
- Why not Batch
