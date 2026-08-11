---
id: d2-hooks
track: d2
order: 3
title: Hooks, lifecycle events and the exit-code trap
summary: The only mechanism that guarantees an action happens or is blocked — and the exit code that catches everyone out.
minutes: 8
courseChapter: cc-config
---

If `CLAUDE.md` is guidance, hooks are enforcement. When a scenario demands a guarantee, this
is the lesson it is testing.

## What a hook is

A command configured in `settings.json` under `hooks`, keyed by lifecycle event. Hooks can be
`command`, `http`, `mcp_tool`, `prompt` or `agent` types.

```json
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash", "command": "python3 validate-command.py" }
    ],
    "PostToolUse": [
      { "matcher": "Edit", "command": "npx eslint --fix" }
    ]
  }
}
```

## The events

| Event | Fires | Typical use |
|---|---|---|
| `PreToolUse` | Before a tool runs | Block dangerous operations, rewrite inputs |
| `PostToolUse` | After a tool completes | Run linters, validate output, log |
| `UserPromptSubmit` | On each user message | Inject context, audit |
| `Stop` / `SubagentStop` | When a turn ends | Notify, checkpoint |
| `SessionStart` / `SessionEnd` | Session lifecycle | Setup, teardown |
| `PreCompact` | Before compaction | Persist state that is about to be summarised away |
| `Notification` | Status changes | Alerting |

## The exit-code trap

This is the single most-tested detail in the domain, and it is genuinely counter-intuitive.

::: key-fact Hook exit codes
- **0** — success. Stdout is parsed as JSON for structured control.
- **2** — **blocking error**. Stderr is fed back to Claude; JSON output is skipped.
- **any other non-zero** (including 1) — non-blocking error. Execution **continues**.
:::

::: trap Exit 1 does not block
The instinct from shell scripting is that any non-zero exit means failure and stops
everything. Here, only **2** blocks. A validation hook written to `exit 1` on failure will
log an error and let the operation proceed anyway. Questions about "the hook ran but the
dangerous command executed regardless" are pointing straight at this.
:::

## Structured control from PreToolUse

A `PreToolUse` hook exiting 0 can return JSON on stdout to control what happens next:

```json
{
  "hookSpecificOutput": {
    "permissionDecision": "deny",
    "permissionDecisionReason": "Writes to production config are not allowed from here."
  }
}
```

`permissionDecision` accepts `allow`, `deny`, `ask` and `defer`. A hook can also return
`updatedInput` to **rewrite** the tool call before it executes — useful for forcing a flag,
scoping a path, or redacting an argument.

## The rule that matters

::: key-fact Hooks are the only way to guarantee
Hooks and permission rules are the only mechanisms that deterministically guarantee an action
happens or is blocked. Everything else — `CLAUDE.md`, system prompts, few-shot examples,
politely worded instructions — is probabilistic.
:::

This is the *determinism test* mental model: if a silent failure is possible and would matter,
the requirement needs programmatic enforcement, not a prompt.

## Choosing hook against permission rule

Both are deterministic; they do different jobs.

- **Permission rule** — static policy. "This tool, on these paths, is denied." No process
  runs; it is a matching rule.
- **Hook** — dynamic policy and side effects. "Run this validator and decide", or "after every
  edit, run the formatter". A hook can inspect the actual arguments, call out to a service,
  and rewrite the call.

If the decision can be made from the tool name and arguments alone, a permission rule is
simpler and cheaper. If it needs logic, or if you need something to *happen* rather than be
*prevented*, use a hook.
