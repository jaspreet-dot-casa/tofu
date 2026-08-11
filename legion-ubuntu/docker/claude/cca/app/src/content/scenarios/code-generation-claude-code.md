## The brief

A team rolls Claude Code out across a shared repository. Everyone should inherit the same
standards, everyone should get the same commands, and certain things must never happen by
accident.

## Where each thing lives

This scenario is a configuration-placement exam in disguise. The question is always *which
file*.

| Requirement | Goes in |
|---|---|
| Team coding standards, test commands, architecture notes | `./CLAUDE.md` or `./.claude/CLAUDE.md` — **committed** |
| One engineer's personal preferences | `~/.claude/CLAUDE.md` |
| Rules that apply only to `src/api/**` | `.claude/rules/` with `paths` glob frontmatter |
| A command the team can run | `.claude/commands/` or `.claude/skills/` — committed |
| Team-wide MCP servers | `.mcp.json` at the repo root — committed |
| A personal API token | environment variable, referenced as `${TOKEN}` |
| Something that must **always** run | a **hook** |
| Something that must **never** be permitted | a `permissions.deny` rule |

::: key-fact The commit test
"Should the whole team get this?" is the same question as "is this file in version control?".
User-level configuration cannot be a team standard, however sensible its contents.
:::

## Guidance versus enforcement

The pivotal distinction.

`CLAUDE.md` says *"always run the formatter after editing"*. Claude will usually do it. On the
run where it does not, nothing tells you.

A `PostToolUse` hook on `Edit` runs the formatter every time, because it is code:

```json
{
  "hooks": {
    "PostToolUse": [
      { "matcher": "Edit", "command": "npx prettier --write \"$TOOL_OUTPUT_PATH\"" }
    ]
  }
}
```

::: trap Exit 1 does not block
For a `PreToolUse` validator, only exit code **2** blocks the operation and feeds stderr back
to Claude. Exit 0 succeeds (stdout parsed as JSON for structured control), and any other
non-zero — including 1 — is a non-blocking error that lets the operation proceed.
:::

## Permissions

Merge, do not override. A `deny` at any scope stands, and no `allow` elsewhere removes it.
Protected paths (`.git`, `.claude`, `.mcp.json`, `.claude.json`, shell rc files) are never
auto-approved outside `bypassPermissions` — because those are exactly the files that could be
used to disarm the permission system.

## Plan mode

Use it for multi-file changes, unfamiliar areas, refactors with cross-cutting concerns, and
anywhere several approaches are defensible. Skip it for single-file fixes with a clear stack
trace. The criterion is the cost of taking the wrong approach, not the size of the task.

## Custom commands

```yaml
---
description: Review the staged diff against our API checklist
allowed-tools: [Read, Grep, Glob]
argument-hint: "[optional path]"
context: fork
---
Review this diff: !`git diff --staged`
```

Points the exam cares about: `description` is what Claude matches on; `allowed-tools`
is least privilege; `context: fork` keeps noisy output out of the main conversation; and
`` !`command` `` executes on every invocation.

## What the exam will ask

- Which file makes a standard apply to the whole team
- Why `CLAUDE.md` cannot guarantee a formatter runs
- Which hook exit code actually blocks
- When plan mode is worth the round trip
- Why an `allow` rule cannot open a protected path
