---
id: d2-settings-precedence
track: d2
order: 1
title: Settings precedence and the permissions exception
summary: The five-level settings hierarchy, and the one rule that does not follow it.
minutes: 6
courseChapter: cc-config
---

Configuration questions are mostly precedence questions. There is one ordering to learn and
one exception to it, and the exception is where the marks are.

## The hierarchy

Highest priority wins:

1. **Managed / enterprise policy** — system directories
   (`/etc/claude-code/` on Linux, `/Library/Application Support/ClaudeCode/` on macOS,
   `C:\Program Files\ClaudeCode\` on Windows)
2. **CLI flags**
3. **`.claude/settings.local.json`** — project-local, gitignored, personal
4. **`.claude/settings.json`** — project, committed, team-wide
5. **`~/.claude/settings.json`** — user

Managed policy exists so an organisation can set something an individual cannot override.
That is the whole point of it being at the top.

## The exception

::: key-fact Permission rules merge; they do not override
Settings normally override, highest level winning. **Permission rules (`allow` / `ask` /
`deny`) are different — they merge across every scope.** A `deny` rule set at the user level
still applies when a project's settings say nothing about it, and a project `deny` cannot be
removed by a more specific local file.
:::

This is deliberate: permissions are a safety mechanism, and a safety mechanism you can
accidentally drop by adding a more specific config file would be worthless.

::: trap "The project settings replaced my deny rule"
They did not. Permission rules accumulate. If a question describes a tool call being blocked
despite the project settings allowing it, look for a `deny` at another scope — deny wins, and
merging means it is still in force.
:::

## Rule syntax

Permission rules use a Bash-like matching syntax:

```json
{
  "permissions": {
    "allow": ["Bash(git diff *)", "Read(./src/**)"],
    "deny":  ["Read(./.env)", "Bash(rm -rf *)"],
    "ask":   ["Bash(git push *)"]
  }
}
```

Matching is prefix-based on the trailing space, so `Bash(git diff *)` covers `git diff`,
`git diff --staged` and so on, but not `git difftool`.

## Protected paths

Some paths are never auto-approved regardless of what your `allow` rules say:

- `.git`
- `.claude`
- `.mcp.json` and `.claude.json`
- shell startup files such as `.zshrc` and `.bashrc`

::: key-fact allow rules cannot pre-approve a protected path
Only `bypassPermissions` mode skips these checks. Conversely, `deny` rules and explicit `ask`
rules apply **even in `bypassPermissions`** — the escape hatch is not total.
:::

The reasoning is worth internalising: these are precisely the files that could be edited to
weaken the permission system itself. A configuration mechanism that allowed itself to be
silently disarmed would not be a configuration mechanism.

## The question shape

Almost every settings question is one of:

- "Where should this live so the whole team gets it?" → project `.claude/settings.json`,
  committed.
- "Where should this live so only I get it?" → `~/.claude/settings.json` or
  `.claude/settings.local.json`.
- "Why is this still blocked?" → a `deny` at another scope, or a protected path.
- "How do we stop someone overriding this?" → managed policy.
