---
id: d3-structured-output
track: d3
order: 3
title: Guaranteeing structured output
summary: Structured Outputs, forced tool use, the prefill trap, and the difference between syntax errors and semantic ones.
minutes: 8
courseChapter: reliability
---

"Make it always return valid JSON" is one of the most common real requirements. It is also one
of the most commonly wrong-answered exam questions.

## The ranking

Most reliable to least:

1. **Structured Outputs** — `output_config.format` with `type: json_schema`. The model is
   physically prevented from producing anything that breaks the schema.
2. **Forced tool use** — define a tool whose `input_schema` is the object you want, then set
   `tool_choice` to `any` or to that specific tool. Add `strict: true` to guarantee the input
   matches the schema.
3. **Asking nicely in the prompt.** Usually works. Not a guarantee, so not an answer to
   "guaranteed".
4. **Prefilling** the assistant turn with `{`. See below — this is now an error.

::: key-fact Prefill is a trap answer
Prefilling the last assistant turn to force JSON **returns a 400 on Claude 4.6+ models**. If
an option offers it, that option is wrong.

Use Structured Outputs instead, or enums for classification, or a system-prompt instruction to
answer with no preamble.
:::

## What schemas fix, and what they do not

::: key-fact A schema fixes the shape, not the truth
A schema guarantees the JSON parses, every required field is there, and every type is right.

It guarantees **nothing** about whether the values are correct. A completely made-up invoice
number fits the schema perfectly.
:::

So a production extraction pipeline needs both: a schema for the shape, and your own
validation code for the meaning — checking totals add up, verifying identifiers exist, range
checks.

## Designing schemas for messy reality

Documents will not always contain what you asked for. Plan for that:

- **Nullable fields** for data that is genuinely not there.
- **An `"unclear"` option** for when the document is ambiguous, so the model has an honest
  place to put uncertainty instead of guessing.
- **An `"other"` category plus a free-text detail field**, so something unexpected gets
  captured rather than forced into the nearest wrong box.

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

::: exam-tip Why "unclear" beats leaving the field out
Without it, an ambiguous document forces a choice between a wrong value and a missing one. And
neither one can be told apart from a genuine reading.

An explicit "unclear" is a signal you can act on — it can send that record to the human-review
queue.
:::

## Limits worth knowing

Structured Outputs support enums, `const`, `anyOf`, `allOf`, `$ref` and the common string
formats.

They do **not** support recursive schemas, or numeric and length limits like `minimum` and
`maxLength`. Up to 20 strict tools per request.

Where a constraint is not supported, check it in your own validation code instead.

## tool_choice

| Value | Behaviour |
|---|---|
| `auto` | Default when tools are present — Claude may reply with text or call a tool |
| `any` | Must call some tool, its choice which |
| `{ "type": "tool", "name": "X" }` | Must call that specific tool |
| `none` | Default when no tools are present |

Forcing `any` or a named tool prefills an assistant turn, so you get no preamble text. And, as
the previous lesson covered, neither one works with extended thinking.

`disable_parallel_tool_use: true` inside `tool_choice` limits it to one tool call per turn.
Combined with `any`, that means exactly one.
