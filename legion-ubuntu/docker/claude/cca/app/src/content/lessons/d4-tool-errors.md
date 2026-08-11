---
id: d4-tool-errors
track: d4
order: 2
title: Tool errors and the two error paths
summary: is_error versus protocol errors, which failures are retryable, and why an empty result is not an error.
minutes: 6
courseChapter: tooling
---

Error handling is where tool design becomes reliability engineering, and the exam draws two
distinctions precisely.

## The two paths

::: key-fact A tool that ran and failed is not the same as a request that was malformed
- **The tool ran and failed** (API down, rate limited, record locked): return a normal result
  carrying an error flag — `is_error: true` on the Claude API, `isError: true` in MCP. The
  model sees it and can react.
- **The request was malformed** (unknown tool, bad arguments): this is a protocol-level
  error — a 400 from the Claude API, or a JSON-RPC error code such as `-32602` in MCP. The
  model is not asked to fix it; your code is.
:::

Returning a malformed-request failure as a normal tool result teaches the model to keep
retrying something structurally impossible. Returning a runtime failure as a protocol error
denies it the chance to route around a transient problem.

## Classifying failures

Every error your tools return should tell the caller whether trying again could possibly
help.

| Category | Retryable | Examples |
|---|---|---|
| Transient | **yes** | Timeout, rate limit, service unavailable |
| Validation | no | Invalid input, missing required field |
| Business logic | no | Insufficient balance, policy violation |
| Permission | no | Unauthorised, forbidden |
| Not found | no | The resource does not exist |

A structured error response carries the category, whether it is retryable, what was
attempted, and what alternatives exist:

```json
{
  "isError": true,
  "errorCategory": "transient",
  "isRetryable": true,
  "message": "Order service timed out after 5s.",
  "attempted": "search_orders(email=…)",
  "alternatives": ["Ask the customer for an order number and try search_by_reference"]
}
```

Claude will typically retry two or three times on an error result before giving up and
explaining to the user.

## The empty-result distinction

::: trap An empty result is not a failure
`search_orders` returning `[]` because the customer has no orders is a **successful** call
with a valid answer. The same `[]` returned because the database was unreachable is a
failure. If your tool cannot distinguish them, neither can Claude, and it will confidently
tell the customer they have never ordered anything.
:::

Make the distinction explicit in the return value, and state it in the tool description.

## Silent failure is the anti-pattern

Returning nothing, or a generic "an error occurred", is one of the seven anti-patterns. It
prevents recovery: the caller cannot decide whether to retry, route around, degrade, or
escalate, because it has no information to decide with.

This scales up to multi-agent systems, where it is worse. A subagent that fails silently and
returns an empty summary tells the coordinator that its area was clean. The coordinator then
synthesises a report asserting something nobody checked.

::: key-fact The recovery question
Ask of any design: *could this system recover at 3am with no human present?* If the answer is
no, it needs structured error context and checkpoints. This is one of the five mental models,
and it is the one that turns "handle errors" from a platitude into a test you can apply.
:::
