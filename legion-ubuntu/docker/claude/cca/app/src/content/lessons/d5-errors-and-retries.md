---
id: d5-errors-retries
track: d5
order: 4
title: API errors, retries and graceful degradation
summary: Which status codes are retryable, what to do with the ones that are not, and the header you will wish you logged.
minutes: 6
courseChapter: reliability
---

Reliability questions come down to a table you either know or do not.

## The error taxonomy

| Code | Type | Retryable |
|---|---|---|
| 400 | `invalid_request_error` | **No** — fix the request |
| 401 | `authentication_error` | **No** |
| 402 | `billing_error` | **No** |
| 403 | `permission_error` | **No** |
| 404 | `not_found_error` | **No** |
| 413 | `request_too_large` | **No** — reduce it |
| 429 | `rate_limit_error` | **Yes** — honour `Retry-After` |
| 500 | `api_error` | **Yes** |
| 504 | `timeout_error` | **Yes** |
| 529 | `overloaded_error` | **Yes** |

::: key-fact Retry 429, 500, 504 and 529 with exponential backoff; never blindly retry a 4xx
The 4xx family (except 429) means the request itself is wrong. Retrying it produces the same
error, more slowly and more expensively. On a 429, honour the `Retry-After` header rather
than guessing at a backoff.
:::

## The request id

::: key-fact Every response carries a `request-id` header
It looks like `req_018Ee…`, appears as `request_id` in error JSON and on SDK response
objects, and it is what support will ask for. A question mentioning "debugging a production
failure" almost always expects this to be the artefact you captured.
:::

Log it on every request, not only failures. You cannot retroactively capture the id of the
call that went wrong.

## Streaming

Stream long requests over SSE to avoid idle-connection timeouts. Two facts:

- New event types may be added, so unknown event types must be handled gracefully rather than
  throwing. Expect `ping` events.
- **Errors can arrive after a 200.** A stream that has begun successfully can still deliver
  an `overloaded_error` event partway through. Error handling belongs inside the stream
  consumer, not only around the initial call.

For jobs beyond roughly ten minutes, or very high volume with no deadline, use the Batch API
instead of a long stream.

## Reliability patterns

Three worth knowing by name:

- **Circuit breaker** — after N consecutive failures, stop retrying and switch to a fallback.
  Reset after a cooldown. Prevents a struggling dependency from being hammered.
- **Idempotency** — design tool calls so a retry is safe. This is what makes automatic retry
  viable at all; retrying a non-idempotent refund is worse than failing.
- **Graceful degradation** — continue with whatever is available and **report the
  degradation** in the output. Partial results labelled as partial are useful; partial
  results presented as complete are dangerous.

::: trap Silent degradation
Returning a partial answer without saying it is partial is the same anti-pattern as the
silent subagent failure. The consumer has no way to know a third of the sources were
unreachable, and will treat the answer as authoritative.
:::

## Crash recovery

For long multi-step workflows, checkpoint to a manifest so a crash does not mean starting
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

On resume, load the manifest and inject it into the new prompt. This is the concrete answer
to the *recovery question*: can this system recover at 3am with no human present?
