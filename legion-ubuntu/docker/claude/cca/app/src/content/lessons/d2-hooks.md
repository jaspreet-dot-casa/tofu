---
id: d2-hooks
track: d2
order: 3
title: Hooks, lifecycle events and the exit-code trap
summary: The only mechanism that guarantees an action happens or is blocked — and the exit code that catches everyone out.
minutes: 8
courseChapter: cc-config
---

If `CLAUDE.md` is advice, hooks are rules.

A hook is a command that runs automatically at a set moment — before a tool runs, after an
edit, when a session starts. When a question demands a guarantee, this is the lesson it is
testing.

## What a hook is

A command configured in `settings.json` under `hooks`, listed against the moment it should
fire. Hooks can be `command`, `http`, `mcp_tool`, `prompt` or `agent` types.

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
| `PostToolUse` | After a tool finishes | Run linters, check output, log |
| `UserPromptSubmit` | On each user message | Add context, audit |
| `Stop` / `SubagentStop` | When a turn ends | Notify, checkpoint |
| `SessionStart` / `SessionEnd` | Session lifecycle | Setup, teardown |
| `PreCompact` | Before compaction | Save state that is about to be summarised away |
| `Notification` | Status changes | Alerting |

## The exit-code trap

This is the most-tested detail in the domain, and it genuinely surprises people.

::: key-fact Hook exit codes
- **0** — success. Stdout is read as JSON for structured control.
- **2** — **blocking error**. Stderr goes back to Claude; JSON output is skipped.
- **any other non-zero, including 1** — non-blocking error. Execution **carries on**.
:::

::: trap Exit 1 does not block
Everything you know from shell scripting says any non-zero exit means failure and stops
everything. Here, only **2** blocks.

A validation hook written to `exit 1` on failure will log an error and then let the operation
happen anyway. Questions about "the hook ran but the dangerous command executed regardless"
are pointing straight at this.
:::

## Structured control from PreToolUse

A `PreToolUse` hook that exits 0 can print JSON to stdout to control what happens next:

```json
{
  "hookSpecificOutput": {
    "permissionDecision": "deny",
    "permissionDecisionReason": "Writes to production config are not allowed from here."
  }
}
```

`permissionDecision` accepts `allow`, `deny`, `ask` and `defer`.

A hook can also return `updatedInput` to **rewrite** the tool call before it runs. That is
useful for forcing a flag, restricting a path, or hiding an argument.

## The rule that matters

::: key-fact Hooks are the only way to guarantee something
Hooks and permission rules are the only mechanisms that reliably make an action happen or stop
it from happening.

Everything else — `CLAUDE.md`, system prompts, examples, carefully worded instructions — is a
request, not a rule.
:::

This is the *determinism test* mental model: if something could fail quietly and that would
matter, it needs to be enforced in code, not asked for in a prompt.

## Hook or permission rule?

Both are reliable. They do different jobs.

- **Permission rule** — a fixed policy. "This tool, on these paths, is denied." Nothing runs;
  it is just a matching rule.
- **Hook** — a decision made at the time, or a side effect. "Run this checker and decide", or
  "after every edit, run the formatter." A hook can look at the actual arguments, call out to
  a service, and rewrite the call.

If you can decide from the tool name and arguments alone, a permission rule is simpler and
cheaper. If you need logic, or you need something to *happen* rather than be *stopped*, use a
hook.
