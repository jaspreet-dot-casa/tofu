---
id: d2-permission-modes
track: d2
order: 4
title: Permission modes and plan mode
summary: The six modes, what each actually permits, and when plan mode earns its extra round trip.
minutes: 6
courseChapter: cc-config
---

A permission mode sets how much Claude Code is allowed to do on its own during a session.

The exam gives you a situation and asks which mode fits. So learn what each one actually
allows, not just its name.

## The modes

| Mode | Allows |
|---|---|
| `default` | Reads only; everything else asks first |
| `acceptEdits` | Auto-approves file edits plus common filesystem commands (`mkdir`, `touch`, `rm`, `mv`, `cp`, `sed`) |
| `plan` | Read-only research, then shows you a plan to approve before any edits |
| `auto` | Autonomy decided by a classifier (research preview) |
| `dontAsk` | Only pre-approved `allow` rules and read-only commands; **everything else is refused** rather than asked about |
| `bypassPermissions` | Skips permission checks entirely |

::: key-fact dontAsk refuses, it does not ask
This is what makes `dontAsk` the right answer for CI.

In a pipeline there is nobody there to answer a prompt, so a mode that *asks* would just hang
forever. `dontAsk` fails safely: anything not explicitly allowed is refused, and the run
either continues or fails in a predictable way.
:::

::: trap bypassPermissions in a pipeline
`--dangerously-skip-permissions` is the CLI version, and the name is the clue.

It is for throwaway containers and isolated VMs. Unless a question explicitly says the run is
sandboxed, the safe CI answer is `dontAsk` plus an explicit `--allowedTools` list — not
bypass.
:::

Remember from the last lesson: even in `bypassPermissions`, `deny` rules and explicit `ask`
rules still apply, and protected paths are still protected.

## Plan mode

Plan mode makes Claude research without changing anything, then show you a plan you approve
before anything gets written.

**Use plan mode when:**

- the change spans several files;
- there are a few reasonable approaches and picking the wrong one is expensive;
- you do not know the codebase;
- the refactor touches things all over the place.

**Just let it work when:**

- it is a one-file fix;
- there is a clear stack trace pointing at the cause;
- the fix is obvious;
- speed matters more than a review step.

::: exam-tip Plan mode is about the cost of being wrong
Plan mode buys you a checkpoint before any work happens.

That is worth an extra round trip when a wrong approach means undoing changes across ten
files. It is dead weight when the fix is a typo.

Questions mentioning "unfamiliar codebase", "several possible approaches" or "large refactor"
are pointing at plan mode.
:::

## Autonomy comes in layers

The mode is one control among several. A well-built system uses more than one:

- **Permission mode** sets the baseline.
- **`allow` / `deny` / `ask` rules** carve out specifics — and they combine across levels.
- **Hooks** make judgement calls at the time, and can rewrite or block individual calls.
- **`max_turns` and `max_budget_usd`** limit the run itself.
- **Human approval checkpoints** gate the genuinely high-stakes steps.

A question describing an agent that should work freely on routine tasks but must never deploy
without sign-off is describing exactly this layering: a permissive mode, plus an explicit deny
or a hook on the deployment path.
