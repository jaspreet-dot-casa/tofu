## The brief

A team rolls Claude Code out across a shared repository. Everyone should get the same
standards, everyone should get the same commands, and some things must never happen by
accident.

## Where each thing lives

This scenario is a "which file does it go in" exam wearing a disguise.

| Requirement | Goes in |
|---|---|
| Team coding standards, test commands, architecture notes | `./CLAUDE.md` or `./.claude/CLAUDE.md` — **committed** |
| One engineer's personal preferences | `~/.claude/CLAUDE.md` |
| Rules that apply only to `src/api/**` | `.claude/rules/` with `paths` glob frontmatter |
| A command the team can run | `.claude/commands/` or `.claude/skills/` — committed |
| Team-wide MCP servers | `.mcp.json` at the repo root — committed |
| A personal API token | environment variable, referenced as `${TOKEN}` |
| Something that must **always** run | a **hook** |
| Something that must **never** be allowed | a `permissions.deny` rule |

::: key-fact The commit test
"Should the whole team get this?" is the same question as "is this file in version control?"

User-level configuration cannot be a team standard, no matter how sensible its contents.
:::

## Advice versus enforcement

This is the key distinction.

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
For a `PreToolUse` validator, only exit code **2** blocks the operation and sends stderr back
to Claude.

Exit 0 means success (stdout is read as JSON for structured control). Any other non-zero
code — including 1 — is a non-blocking error, and the operation goes ahead anyway.
:::

## Permissions

They combine; they do not replace each other. A `deny` at any level stands, and no `allow`
somewhere else removes it.

Protected paths (`.git`, `.claude`, `.mcp.json`, `.claude.json`, shell rc files) are never
auto-approved outside `bypassPermissions` — because those are exactly the files you would edit
to switch the permission system off.

## Plan mode

Use it for changes across several files, unfamiliar areas, refactors that touch a lot, and
anywhere more than one approach is reasonable.

Skip it for one-file fixes with a clear stack trace.

The test is the cost of taking the wrong approach — not the size of the task.

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

What the exam cares about here: `description` is what Claude matches on; `allowed-tools` keeps
privilege low; `context: fork` keeps noisy output out of the main conversation; and
`` !`command` `` runs on every single invocation.

## What the exam will ask

- Which file makes a standard apply to the whole team
- Why `CLAUDE.md` cannot guarantee a formatter runs
- Which hook exit code actually blocks
- When plan mode is worth the extra round trip
- Why an `allow` rule cannot open a protected path
