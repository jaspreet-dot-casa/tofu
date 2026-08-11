## The brief

Unstructured documents become validated records at volume, cheaply, with a human review path
for anything uncertain.

## Guaranteeing the shape

Ranked, most reliable first:

1. **Structured Outputs** — `output_config.format` with `type: json_schema`. Constrained
   sampling, always valid.
2. **Forced tool use** — a tool whose `input_schema` is the target, plus `tool_choice` and
   `strict: true`.
3. Asking in the prompt. Probabilistic.
4. **Prefilling with `{`** — returns a **400** on Claude 4.6+. Always the wrong option.

::: key-fact Schemas fix syntax, not semantics
A schema guarantees the JSON parses and the fields are present and correctly typed. It
guarantees nothing about the values. A hallucinated invoice number is perfectly schema-valid,
so a programmatic validation layer is not optional.
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

Three deliberate affordances: **nullable** for genuinely absent data, **`"unclear"`** so
ambiguity has an honest home instead of forcing a guess, and **`"other"` plus a detail
string** so an unexpected type is captured rather than crammed into the nearest wrong bucket.

Each of these also doubles as a routing signal for human review.

## Validation and retry

On failure, send back the **original document**, the **failed extraction**, and the
**specific validation errors**. "That was invalid, try again" produces a differently-wrong
answer.

::: trap Retries cannot create missing data
If the document does not contain a PO number, retrying produces a hallucinated one. Retry
fixes format mismatches, misreads and misclassification. It cannot fix absence — that is what
the nullable and `"unclear"` paths are for. Cap attempts at two or three.
:::

## Cost

::: key-fact This is the one scenario where Batch is right
Overnight bulk extraction with no user waiting: **50% cheaper**, up to 24 hours, no SLA. Use
`custom_id` per request to correlate results, which do not return in submission order.

If the same pipeline gains an interactive mode where a user uploads a document and waits,
that path must be real-time. Same system, different answer.
:::

Cache the schema and instruction block — a large stable prefix hit thousands of times is the
textbook caching case. Keep the document content *after* the breakpoint, since it varies.

## Quality measurement

::: trap 97% aggregate accuracy can hide a broken field
If one document type is 8% of the corpus and its date field fails 60% of the time, the
aggregate barely moves. Sample by **document type and field** — stratified, not uniform — and
set thresholds per field and per type.
:::

Two review routes, both needed:

- **Exception-based** — schema returned `"unclear"`, validation failed after retries, a
  required field is null, a value is out of range, two passes disagreed.
- **Stratified sampling** of everything, including records the system was confident about.
  This is the only route that finds confident errors.

## What the exam will ask

- Structured Outputs versus tool_use versus prefill
- What a schema does and does not guarantee
- What a retry can and cannot fix
- Batch versus real-time in the same system
- Why aggregate accuracy is the wrong metric
