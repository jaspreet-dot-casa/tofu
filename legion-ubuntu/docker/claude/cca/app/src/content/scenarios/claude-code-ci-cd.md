## The brief

Automated code review, test generation and PR feedback, running headless in a pipeline.
Nothing may hang waiting for input, the output has to be readable by a machine, and results
must be the same on every runner.

## The invocation

```bash
claude -p "Review the staged diff against the checklist in docs/review.md" \
  --output-format json \
  --json-schema .github/review-schema.json \
  --allowedTools "Read,Grep,Glob" \
  --permission-mode dontAsk \
  --max-turns 20 \
  --bare
```

Every flag is doing a job:

| Flag | Without it |
|---|---|
| `-p` | The process waits for input and the job hangs |
| `--output-format json` | Output is prose the pipeline cannot act on |
| `--json-schema` | Nothing checks the shape before you parse it |
| `--allowedTools` | More privilege than the job needs |
| `--permission-mode dontAsk` | A prompt appears with nobody there to answer it |
| `--max-turns` | The run has no limit |
| `--bare` | Behaviour depends on whatever config happens to be on the runner |

::: key-fact dontAsk fails safely
It allows only pre-approved `allow` rules and read-only commands, and **refuses** everything
else rather than asking.

That is exactly what you want when there is no human present.
:::

::: trap --dangerously-skip-permissions
It is the same as `bypassPermissions`.

Only right when the question explicitly says the job runs in an isolated, disposable container.
Otherwise the answer is `dontAsk` plus an explicit allowlist.
:::

::: key-fact --bare is what makes runs repeatable
It skips auto-loading of hooks, skills, plugins, MCP, auto memory and `CLAUDE.md`, so the run
depends only on what you passed in.

If CI results differ between machines, suspect it is missing.
:::

## One session per job

Every job gets a fresh session.

Sharing one across PR reviews leaks one PR's context into the next, and you get confident
feedback about the wrong code. Use `--resume` within a job if you need continuity. Never across
jobs.

## Independent review

::: key-fact Whatever wrote the code must not review it
An instance reviewing its own output still holds the reasoning that produced the mistake, so
the mistake still looks right.

Review runs in a separate session with none of the writer's context.
:::

The full pattern:

1. **One pass per file** — focused attention, catches local problems.
2. **One pass across files** — catches the integration problems no single file shows.
3. **Combine** into structured findings.

Neither pass replaces the other. One whole-diff review spreads attention too thin. Per-file
reviews alone never see two files at once.

## Structured output

```json
{
  "verdict": "changes_requested",
  "findings": [
    {
      "file": "src/api/orders.ts",
      "line": 142,
      "severity": "high",
      "issue": "Unvalidated request body reaches the ORM."
    }
  ]
}
```

Now the job can fail the build on any `high`, post the findings as review comments, and stay
quiet when the array is empty.

## Cost

The checklist and standards are a large stable prefix hit on every PR — cache it.

Do not reach for Batch. A PR check blocks a merge, and Batch makes no promise about when it
will finish.

## What the exam will ask

- Which flag stops the job hanging
- `dontAsk` versus `bypassPermissions`
- What `--bare` buys you
- Why the writer cannot review its own work
- Why you need both per-file and cross-file passes
