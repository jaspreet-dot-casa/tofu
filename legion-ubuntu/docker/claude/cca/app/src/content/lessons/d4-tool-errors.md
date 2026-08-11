---
id: d4-tool-errors
track: d4
order: 2
title: Tool errors and the two error paths
summary: is_error versus protocol errors, which failures are retryable, and why an empty result is not an error.
minutes: 6
courseChapter: tooling
---

There are two completely different ways a tool call can go wrong, and they are handled
differently. The exam draws the line precisely.

## The two paths

::: key-fact A tool that ran and failed is not the same as a request that made no sense
- **The tool ran and failed** (API down, rate limited, record locked): return a normal result
  with an error flag on it — `is_error: true` on the Claude API, `isError: true` in MCP. The
  model sees it and can react.
- **The request was badly formed** (unknown tool, wrong arguments): this is a protocol error —
  a 400 from the Claude API, or a JSON-RPC code such as `-32602` in MCP. The model is not asked
  to fix this. Your code is.
:::

Get it backwards and you break things.

Return a badly-formed-request failure as a normal tool result, and you teach the model to keep
retrying something that can never work. Return a runtime failure as a protocol error, and you
deny it the chance to work around a temporary problem.

## Sorting failures

Every error your tools return should tell the caller one thing: could trying again possibly
help?

| Category | Retryable | Examples |
|---|---|---|
| Transient | **yes** | Timeout, rate limit, service unavailable |
| Validation | no | Invalid input, missing required field |
| Business logic | no | Insufficient balance, policy violation |
| Permission | no | Unauthorised, forbidden |
| Not found | no | The resource does not exist |

A well-structured error response says which category it is, whether to retry, what was tried,
and what else could be tried:

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

Claude will usually retry two or three times on an error result before giving up and explaining
to the user.

## Empty is not the same as failed

::: trap An empty result is not a failure
`search_orders` returning `[]` because the customer has no orders is a **successful** call with
a valid answer.

The same `[]` returned because the database was unreachable is a failure.

If your tool cannot tell the difference, neither can Claude — and it will confidently tell the
customer they have never ordered anything.
:::

Make the difference visible in the return value, and say so in the tool description.

## Failing silently is the anti-pattern

Returning nothing, or a vague "an error occurred", is one of the seven anti-patterns.

It stops anything from recovering. The caller cannot decide whether to retry, work around it,
carry on partially, or escalate — because it has nothing to decide with.

It gets worse in multi-agent systems. A subagent that fails quietly and returns an empty
summary is telling the coordinator that its area was clean. The coordinator then writes a
report claiming something nobody actually checked.

::: key-fact The recovery question
Ask of any design: *could this system recover at 3am with nobody watching?*

If the answer is no, it needs structured error information and checkpoints. This is one of the
five mental models, and it is the one that turns "handle errors" from a slogan into a test you
can actually apply.
:::
