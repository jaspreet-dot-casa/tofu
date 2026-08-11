---
id: d2-permission-modes
track: d2
order: 4
title: Permission modes and plan mode
summary: The six modes, what each actually permits, and when plan mode earns its extra round trip.
minutes: 6
courseChapter: cc-config
---

Permission modes set the baseline autonomy for a session. The exam asks which one fits a
described situation, so learn what each permits rather than just its name.

## The modes

| Mode | Permits |
|---|---|
| `default` | Reads only; everything else prompts |
| `acceptEdits` | Auto-approves file edits plus common in-scope filesystem commands (`mkdir`, `touch`, `rm`, `mv`, `cp`, `sed`) |
| `plan` | Read-only research, then presents a plan for approval before any edits |
| `auto` | Classifier-gated autonomy (research preview) |
| `dontAsk` | Only pre-approved `allow` rules and read-only commands; **everything else is denied** rather than prompted |
| `bypassPermissions` | Skips permission checks entirely |

::: key-fact dontAsk denies, it does not prompt
This is the distinction that makes `dontAsk` the right answer for CI. In a pipeline there is
nobody to answer a prompt, so a mode that *asks* would hang. `dontAsk` fails closed:
anything not explicitly allowed is refused, and the run continues or fails deterministically.
:::

::: trap bypassPermissions in a pipeline
`--dangerously-skip-permissions` is the CLI equivalent, and the name is the hint. It is for
isolated containers and disposable VMs. Unless a scenario explicitly says the run is
sandboxed, the safe CI answer is `dontAsk` plus an explicit `--allowedTools` list — not
bypass.
:::

Remember from the previous lesson: even in `bypassPermissions`, `deny` rules and explicit
`ask` rules still apply, and protected paths are still protected.

## Plan mode

Plan mode makes Claude research read-only, then present a plan you approve before anything
is written.

**Use plan mode when:**

- the change spans multiple files;
- there are several defensible approaches and picking wrong is expensive;
- the codebase is unfamiliar;
- the refactor has cross-cutting concerns.

**Use direct execution when:**

- it is a single-file fix;
- there is a clear stack trace pointing at the cause;
- the path is obvious;
- speed matters more than the review step.

::: exam-tip The plan-mode question is about cost of being wrong
Plan mode buys a checkpoint before work happens. That is worth a round trip when a wrong
approach means undoing changes across ten files, and it is dead weight when the fix is a
typo. Scenario stems mentioning "unfamiliar codebase", "several possible approaches" or
"large refactor" are pointing at plan mode.
:::

## Autonomy is layered

Modes are one control among several, and a well-designed system uses more than one:

- **Permission mode** sets the baseline.
- **`allow` / `deny` / `ask` rules** carve out specifics — and merge across scopes.
- **Hooks** apply dynamic judgement and can rewrite or block individual calls.
- **`max_turns` and `max_budget_usd`** bound the run itself.
- **Human approval checkpoints** gate the genuinely high-stakes steps.

A question describing an agent that must be autonomous for routine work but must never
deploy without sign-off is describing this layering: permissive mode, explicit deny or a
hook on the deployment path.
