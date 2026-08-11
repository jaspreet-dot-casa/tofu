## The brief

Automated code review, test generation and PR feedback run headless in a pipeline. Nothing
may hang waiting for input, output must be machine-parseable, and results must be
reproducible across runners.

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

Every flag is load-bearing:

| Flag | Without it |
|---|---|
| `-p` | The process waits for input and the job hangs |
| `--output-format json` | Output is prose the pipeline cannot branch on |
| `--json-schema` | Nothing validates the shape before you parse it |
| `--allowedTools` | Broader privilege than the job needs |
| `--permission-mode dontAsk` | A prompt appears with nobody to answer it |
| `--max-turns` | The run is unbounded |
| `--bare` | Behaviour depends on whatever config exists on the runner |

::: key-fact dontAsk fails closed
It permits only pre-approved `allow` rules and read-only commands, and **denies** everything
else rather than prompting. That is precisely what you want where no human is present.
:::

::: trap --dangerously-skip-permissions
The equivalent of `bypassPermissions`. Correct only when the scenario explicitly says the job
runs in an isolated, disposable container. Otherwise the answer is `dontAsk` plus an explicit
allowlist.
:::

::: key-fact --bare is the reproducibility flag
It skips auto-discovery of hooks, skills, plugins, MCP, auto memory and `CLAUDE.md`, so the
run depends only on what you passed. If CI results differ between machines, suspect its
absence.
:::

## Session isolation

Every job gets a fresh session. Sharing one across PR reviews leaks one PR's context into the
next, producing confident cross-contaminated feedback. Use `--resume` within a job if you need
continuity; never across jobs.

## Independent review

::: key-fact The generator must not review its own work
An instance reviewing its own output still carries the reasoning that produced the mistake.
Review runs in a separate session with no generator context.
:::

The full pattern:

1. **Per-file passes** — focused attention, catches local defects.
2. **One cross-file pass** — catches the integration defects no single file shows.
3. **Aggregate** into structured findings.

Neither pass substitutes for the other. A single whole-diff review spreads attention too thin;
per-file reviews alone never see two files at once.

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

Now the job can fail the build on any `high`, post findings as review comments, and stay
silent on an empty array.

## Cost

The checklist and standards are a large stable prefix hit on every PR — cache it. Do not reach
for Batch: a PR check is a blocking workflow and Batch has no latency guarantee.

## What the exam will ask

- Which flag stops the job hanging
- `dontAsk` versus `bypassPermissions`
- What `--bare` buys
- Why the generator cannot review itself
- Why per-file and cross-file passes are both needed
