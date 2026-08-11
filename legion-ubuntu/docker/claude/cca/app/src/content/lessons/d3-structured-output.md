---
id: d3-structured-output
track: d3
order: 3
title: Guaranteeing structured output
summary: Structured Outputs, forced tool use, the prefill trap, and the difference between syntax errors and semantic ones.
minutes: 8
courseChapter: reliability
---

"Make it always return valid JSON" is one of the most common real requirements and one of the
most commonly mis-answered exam questions.

## The ranking

From most to least reliable:

1. **Structured Outputs** — `output_config.format` with `type: json_schema`. Constrained
   sampling means the response is always schema-valid.
2. **Forced tool use** — define a tool whose `input_schema` is your target object, then set
   `tool_choice` to `any` or to that specific tool. Add `strict: true` for guaranteed
   schema-valid inputs.
3. **Asking nicely in the prompt.** Probabilistic. Not an answer to "guaranteed".
4. **Prefilling** the assistant turn with `{`. See below — this is now an error.

::: key-fact Prefill is a trap answer
Prefilling the last assistant turn to force JSON **returns a 400 on Claude 4.6+ models**. If
an option offers it, it is wrong. Replace those use cases with Structured Outputs, enums for
classification, or a system-prompt instruction to respond without preamble.
:::

## What schemas do and do not fix

::: key-fact Schemas eliminate syntax errors, not semantic ones
A schema guarantees the JSON parses, every required field is present, and every type matches.
It guarantees **nothing** about whether the values are correct. A hallucinated invoice
number is perfectly schema-valid.
:::

So a production extraction pipeline needs both: a schema for structure, and a programmatic
validation layer for meaning — cross-checking totals, verifying identifiers exist, range
checks.

## Schema design for messy reality

Documents will not always contain what you asked for. Design for that explicitly:

- **Nullable fields** for data that is legitimately absent.
- **An `"unclear"` enum value** for when the document is ambiguous, so the model has somewhere
  honest to put uncertainty instead of guessing.
- **An `"other"` category plus a free-text detail field**, so an unexpected type is captured
  rather than forced into the nearest wrong bucket.

```json
{
  "type": "object",
  "properties": {
    "invoice_total": { "type": ["number", "null"] },
    "currency":      { "enum": ["AUD", "USD", "EUR", "unclear"] },
    "document_type": { "enum": ["invoice", "receipt", "statement", "other"] },
    "document_type_detail": { "type": ["string", "null"] }
  },
  "required": ["invoice_total", "currency", "document_type"]
}
```

::: exam-tip Why "unclear" beats omitting the field
Without it, an ambiguous document forces a choice between a wrong value and a missing one,
and neither is distinguishable from a genuine reading. An explicit uncertainty value is a
routable signal — it can drive the human-review queue.
:::

## Limits worth knowing

Structured Outputs support enums, `const`, `anyOf`, `allOf`, `$ref` and the common string
formats. They do **not** support recursive schemas or numeric and length constraints such as
`minimum` and `maxLength`. Up to 20 strict tools per request.

Where a constraint is unsupported, enforce it in your validation layer instead.

## tool_choice

| Value | Behaviour |
|---|---|
| `auto` | Default when tools are present — Claude may reply with text or call a tool |
| `any` | Must call some tool, its choice which |
| `{ "type": "tool", "name": "X" }` | Must call that specific tool |
| `none` | Default when no tools are present |

Forcing `any` or a named tool prefills an assistant turn, so no preamble text is emitted —
and, as covered in the previous lesson, neither is compatible with extended thinking.

`disable_parallel_tool_use: true` inside `tool_choice` caps it at one tool call per turn;
combined with `any`, exactly one.
