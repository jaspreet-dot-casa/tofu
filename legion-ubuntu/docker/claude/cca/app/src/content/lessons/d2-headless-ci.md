---
id: d2-headless-ci
track: d2
order: 6
title: Headless mode and CI/CD
summary: The flags that make a pipeline run safe, reproducible and parseable — and the review pattern that makes its output worth reading.
minutes: 7
courseChapter: ci-cd
---

Running Claude Code in a pipeline has three requirements a terminal session does not: it must
never wait for input, its output must be machine-readable, and it must behave the same way on
every run.

## The flags

```bash
claude -p "Review the staged diff against our checklist" \
  --output-format json \
  --allowedTools "Read,Grep,Glob" \
  --permission-mode dontAsk \
  --max-turns 20 \
  --bare
```

| Flag | Why |
|---|---|
| `-p` / `--print` | Non-interactive. Without it the process waits for input and the job hangs. |
| `--output-format` | `text`, `json` or `stream-json`. `json` adds `result`, `session_id`, `total_cost_usd` and metadata. |
| `--json-schema <path>` | Validates the output against a schema so the pipeline can branch on it safely. |
| `--allowedTools` / `--disallowedTools` | Least privilege, using permission-rule syntax. |
| `--permission-mode dontAsk` | Fails closed instead of prompting. |
| `--max-turns` | Bounds the run. |
| `--append-system-prompt` | Job-specific instructions without editing committed config. |
| `--bare` | Skips auto-discovery of hooks, skills, plugins, MCP, auto memory and `CLAUDE.md`. |

::: key-fact --bare is the reproducibility flag
It makes a run depend only on what you passed it, rather than on whatever configuration
happens to exist on the runner. That is what you want in CI, and it also starts faster. If a
question describes CI results that differ between machines, missing `--bare` is a good
suspect.
:::

::: trap --dangerously-skip-permissions in a pipeline
It is the equivalent of `bypassPermissions`. Unless the scenario says the job runs in an
isolated container, the intended answer is `dontAsk` with an explicit `--allowedTools` list.
:::

## Session isolation

Each pipeline job should get a fresh session. Sharing a session between PR reviews leaks one
PR's context into the next one's review, which produces confident, wrong, cross-contaminated
feedback. Use `--resume` deliberately within a job if you need continuity, never across jobs.

## Independent review

::: key-fact The generator must not review its own work
An instance reviewing output it produced still carries the reasoning that produced the
mistake, and reliably fails to see it. This is generator bias. Automated review must run in a
**separate session without the generator's context**.
:::

The pattern that follows from this, for a code review pipeline:

1. **Per-file passes** — one focused review per file, catching local issues without the
   context of the whole diff diluting attention.
2. **One cross-file pass** — catching the integration issues no single file shows.
3. **Aggregate** into structured output the pipeline can act on.

## Structured output for pipelines

Free text is not actionable. Ask for a schema and validate it:

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

With that, the job can fail the build on any `high`, post the findings as review comments,
and stay silent when the array is empty. With prose, it can only paste a blob into a comment
and hope somebody reads it.

::: exam-tip Combine the guarantees
A CI question's best answer usually stacks several mechanisms: `-p` so it does not hang,
`--bare` so it is reproducible, `dontAsk` plus `--allowedTools` so it is scoped, a schema so
the output is parseable, and a separate session so the review is honest.
:::
