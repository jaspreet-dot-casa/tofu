---
id: d2-headless-ci
track: d2
order: 6
title: Headless mode and CI/CD
summary: The flags that make a pipeline run safe, reproducible and parseable — and the review pattern that makes its output worth reading.
minutes: 7
courseChapter: ci-cd
---

Running Claude Code in a pipeline has three requirements that a terminal session does not:

1. It must never wait for input, because nobody is there to type.
2. Its output must be readable by a machine.
3. It must behave the same way every run.

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
| `--json-schema <path>` | Checks the output against a schema so the pipeline can branch on it safely. |
| `--allowedTools` / `--disallowedTools` | Only the tools the job needs, using permission-rule syntax. |
| `--permission-mode dontAsk` | Refuses instead of asking. |
| `--max-turns` | Puts a limit on the run. |
| `--append-system-prompt` | Job-specific instructions without editing committed config. |
| `--bare` | Skips auto-loading of hooks, skills, plugins, MCP, auto memory and `CLAUDE.md`. |

::: key-fact --bare is what makes a run repeatable
With it, the run depends only on what you passed in — not on whatever configuration happens to
exist on that particular runner. That is what you want in CI, and it starts faster too.

If a question describes CI results that differ between machines, a missing `--bare` is a good
suspect.
:::

::: trap --dangerously-skip-permissions in a pipeline
It is the same as `bypassPermissions`.

Unless the question says the job runs in an isolated container, the intended answer is
`dontAsk` with an explicit `--allowedTools` list.
:::

## One session per job

Every pipeline job should get a fresh session.

Sharing a session between PR reviews leaks one PR's context into the next one's review. You
get confident, wrong feedback about the wrong code.

Use `--resume` on purpose within a job if you need continuity. Never across jobs.

## Independent review

::: key-fact Whatever wrote the code must not review it
An instance reviewing its own output still holds the reasoning that produced the mistake — so
the mistake still looks correct to it. This is called generator bias.

Automated review has to run in a **separate session with none of the writer's context**.
:::

That leads directly to the review pattern for a code-review pipeline:

1. **One pass per file** — a focused review of each file on its own, catching local problems
   without the whole diff diluting attention.
2. **One pass across files** — catching the integration problems that no single file shows.
3. **Combine** into structured output the pipeline can act on.

## Structured output for pipelines

Free text is not actionable. Ask for a schema and check it:

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

With that, the job can fail the build on any `high`, post the findings as review comments, and
stay quiet when the array is empty.

With prose, all it can do is paste a blob into a comment and hope somebody reads it.

::: exam-tip Stack the guarantees
The best answer to a CI question usually combines several mechanisms at once: `-p` so it does
not hang, `--bare` so it is repeatable, `dontAsk` plus `--allowedTools` so it is limited, a
schema so the output is parseable, and a separate session so the review is honest.
:::
