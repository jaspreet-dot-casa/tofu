---
id: d4-irreversible-actions
track: d4
order: 6
title: Designing tools that cannot fire by accident
summary: Why a dry_run flag is not a safeguard, how token binding makes the unsafe path unrepresentable, and where retry logic belongs.
minutes: 6
courseChapter: tooling
---

Give a model a tool that deletes things and it will, sooner or later, delete something. The
exam's position on this is consistent and worth internalising: **a constraint that lives in
prose is a request, and a constraint that lives in the schema is a guarantee.**

## The dry-run trap

A common design gives one tool a `dry_run: boolean` parameter — call it `true` to preview, call
it `false` to commit. Then production monitoring shows the agent calling it with `false`
directly, skipping the preview nobody could enforce.

::: trap Every fix that leaves one tool in place is a weaker fix
Adding "always call with `dry_run: true` first" to the tool description, with few-shot
examples, is still asking the model to comply. Time-window validation on the server ("only
allow `false` if a matching `true` came in within 60 seconds") is a heuristic that a slow user
breaks and a fast agent games. Annotating the tool as needing confirmation depends on the
orchestration layer honouring the annotation.
:::

## Token binding: split the tool in two

```text
  ╭────────────────────╮   token   ╭─────────────────────╮
  │  preview_remove()  ├──────────▶│  execute_remove()   │
  │  returns impact +  │           │  requires token     │
  │  single-use token  │           │  no token → refuse  │
  ╰────────────────────╯           ╰─────────────────────╯
        the only path to execution runs through preview
```

::: key-fact Make the unsafe call impossible to express
`execute_remove_member` requires a single-use token that only `preview_remove_member` can mint.
There is no argument list that executes without a preview, because the schema does not contain
one. This is enforcement at the code level rather than compliance at the model level — which
is why it beats every description-based alternative.
:::

The same instinct generalises. Whenever a question offers you a choice between "tell the model
to do it in the right order" and "make the wrong order unrepresentable", the second is the
answer.

## Where retry logic belongs

A related judgement call. Suppose a search tool fails 12% of the time: 8% network timeouts that
succeed on retry, and 4% query-syntax errors that will never succeed no matter how many times
you try. Right now both come back looking identical, and the agent burns retries on the
hopeless 4%.

::: key-fact The tool knows which error it hit; the model is guessing
Handle transient failures **inside the tool** — retry with backoff, deterministically. Return
the permanent failures immediately, with the parameter-validation detail that would let the
caller fix the call.
:::

Why the alternatives lose:

- **A `retryable: true` flag on every error.** Better than nothing, but it hands a decision the
  tool can make deterministically to a model that has to interpret it. Reach for this only when
  the *caller* genuinely has to choose — for example when retrying costs real money.
- **Uniform exponential backoff on everything.** Wastes the whole backoff schedule on errors
  that are structurally incapable of succeeding.
- **Few-shot examples teaching the model to tell the error types apart.** Prompt-level
  compliance for something the tool already knows for certain.

::: exam-tip The abstraction-boundary question
"Who has definitive knowledge of this?" answers most tool-design questions in this domain. If
the tool knows, the tool should decide. If only the user can know — a genuine trade-off, an
irreversible action, a contradiction in what they have asked for — it goes back to the user.
:::
