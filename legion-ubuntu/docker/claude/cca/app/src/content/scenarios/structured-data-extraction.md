## The brief

Turn messy documents into checked records, at volume, cheaply, with a human review path for
anything uncertain.

## Guaranteeing the shape

Ranked, most reliable first:

1. **Structured Outputs** — `output_config.format` with `type: json_schema`. The model is
   physically prevented from breaking the schema.
2. **Forced tool use** — a tool whose `input_schema` is what you want, plus `tool_choice` and
   `strict: true`.
3. Asking in the prompt. Usually works, not a guarantee.
4. **Prefilling with `{`** — returns a **400** on Claude 4.6+. Always the wrong option.

::: key-fact A schema fixes the shape, not the truth
It guarantees the JSON parses and that the fields are present and correctly typed.

It guarantees nothing about the values. A completely invented invoice number fits the schema
perfectly. So your own validation layer is not optional.
:::

## Designing for messy documents

```json
{
  "invoice_total": { "type": ["number", "null"] },
  "currency": { "enum": ["AUD", "USD", "EUR", "unclear"] },
  "document_type": { "enum": ["invoice", "receipt", "statement", "other"] },
  "document_type_detail": { "type": ["string", "null"] }
}
```

Three deliberate escape hatches: **nullable** for data that is genuinely absent, **`"unclear"`**
so ambiguity has an honest home instead of forcing a guess, and **`"other"` plus a detail
string** so an unexpected type gets captured rather than crammed into the nearest wrong box.

Each one also doubles as a signal to send that record to a human.

## Validation and retry

When validation fails, send back the **original document**, the **failed attempt**, and the
**specific errors**.

"That was invalid, try again" just produces a differently-wrong answer.

::: trap Retries cannot create missing data
If the document does not contain a PO number, retrying produces a made-up one.

A retry fixes wrong formats, misreads and wrong categories. It cannot fix absence — that is
what the nullable and `"unclear"` paths are for. Cap attempts at two or three.
:::

## Cost

::: key-fact This is the one scenario where Batch is right
Overnight bulk extraction with nobody waiting: **50% cheaper**, up to 24 hours, no latency SLA
(no promise about speed).

Use `custom_id` on each request to match results back, because they do not come back in the
order you sent them.

If the same pipeline gains an interactive mode where a user uploads a document and waits, that
path must be real-time. Same system, different answer.
:::

Cache the schema and instruction block. A large stable prefix hit thousands of times is the
textbook caching case. Keep the document content *after* the breakpoint, since it changes every
time.

## Measuring quality

::: trap 97% overall accuracy can hide a completely broken field
If one document type is 8% of the corpus and its date field fails 60% of the time, the overall
number barely moves.

Sample by **document type and field** — stratified, not uniform — and set targets per field and
per type.
:::

Two review routes, and you need both:

- **By exception** — the schema returned `"unclear"`, validation failed after retries, a
  required field is null, a value is out of range, two passes disagreed.
- **By stratified sampling** of everything, including records the system was confident about.
  This is the only route that finds confident mistakes.

## What the exam will ask

- Structured Outputs versus tool_use versus prefill
- What a schema does and does not guarantee
- What a retry can and cannot fix
- Batch versus real-time inside the same system
- Why an overall accuracy number is the wrong measure
