---
id: d5-errors-retries
track: d5
order: 4
title: API errors, retries and graceful degradation
summary: Which status codes are retryable, what to do with the ones that are not, and the header you will wish you logged.
minutes: 6
courseChapter: reliability
---

Reliability questions mostly come down to one table. You either know it or you do not.

## The error table

| Code | Type | Retry? |
|---|---|---|
| 400 | `invalid_request_error` | **No** — fix the request |
| 401 | `authentication_error` | **No** |
| 402 | `billing_error` | **No** |
| 403 | `permission_error` | **No** |
| 404 | `not_found_error` | **No** |
| 413 | `request_too_large` | **No** — make it smaller |
| 429 | `rate_limit_error` | **Yes** — obey `Retry-After` |
| 500 | `api_error` | **Yes** |
| 504 | `timeout_error` | **Yes** |
| 529 | `overloaded_error` | **Yes** |

::: key-fact Retry 429, 500, 504 and 529 with exponential backoff. Never blindly retry a 4xx
The 4xx codes (except 429) mean the request itself is wrong. Retrying gets you the same error,
just slower and more expensively.

On a 429, use the `Retry-After` header rather than guessing at a delay.
:::

## The request id

::: key-fact Every response carries a `request-id` header
It looks like `req_018Ee…`. It shows up as `request_id` in error JSON and on SDK response
objects, and it is the first thing support will ask you for.

A question mentioning "debugging a production failure" almost always wants this to be the thing
you captured.
:::

Log it on every request, not just the failures. You cannot go back and get the id of the call
that went wrong.

## Streaming

Stream long requests over SSE so the connection does not time out while idle. Two facts:

- New event types can be added later, so unknown event types must be handled quietly rather
  than throwing. Expect `ping` events.
- **Errors can arrive after a 200.** A stream that started fine can still deliver an
  `overloaded_error` event halfway through. So error handling belongs *inside* the stream
  consumer, not just around the initial call.

For jobs over roughly ten minutes, or very high volume with no deadline, use the Batch API
instead of a long stream.

## Three patterns worth knowing by name

- **Circuit breaker** — after N failures in a row, stop retrying and switch to a fallback.
  Reset after a cooldown. Stops you hammering a service that is already struggling.
- **Idempotency** — design tool calls so that running one twice is harmless. This is what makes
  automatic retry safe at all. Retrying a refund that is not idempotent is worse than just
  failing.
- **Graceful degradation** — carry on with whatever you have, and **say that you degraded**.
  Partial results labelled as partial are useful. Partial results presented as complete are
  dangerous.

::: trap Degrading quietly
Returning a partial answer without saying it is partial is the same anti-pattern as the
silently failing subagent.

Whoever reads it has no way to know a third of the sources were unreachable, and will treat the
answer as complete.
:::

## Crash recovery

For long multi-step jobs, save your progress to a manifest so a crash does not mean starting
over:

```json
{
  "workflow_id": "audit-2026-08-11",
  "completed_steps": ["clone", "scan:repo-a", "scan:repo-b"],
  "pending_steps": ["scan:repo-c", "synthesise"],
  "intermediate_results": { "repo-a": { "findings": 3 } },
  "checkpoint_timestamp": "2026-08-11T04:12:00Z"
}
```

On restart, load the manifest and put it into the new prompt.

This is the concrete answer to the *recovery question*: can this system recover at 3am with
nobody watching?
