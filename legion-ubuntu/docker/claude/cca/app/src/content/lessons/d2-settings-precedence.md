---
id: d2-settings-precedence
track: d2
order: 1
title: Settings precedence and the permissions exception
summary: The five-level settings hierarchy, and the one rule that does not follow it.
minutes: 6
courseChapter: cc-config
---

Claude Code reads settings from five places. When two of them disagree, one wins.

Most configuration questions are really asking which one. There is one ordering to learn, and
one exception to it — and the exception is where the marks are.

## The order

Highest priority first. The one nearer the top wins:

1. **Managed / enterprise policy** — system directories
   (`/etc/claude-code/` on Linux, `/Library/Application Support/ClaudeCode/` on macOS,
   `C:\Program Files\ClaudeCode\` on Windows)
2. **CLI flags**
3. **`.claude/settings.local.json`** — project-local, gitignored, just for you
4. **`.claude/settings.json`** — project, committed, shared with the team
5. **`~/.claude/settings.json`** — your user settings

Managed policy sits at the top so an organisation can set something an individual cannot
override. That is the entire point of it.

## The exception

::: key-fact Permission rules add up; they do not replace each other
Normally the highest level wins and the rest are ignored.

**Permission rules (`allow` / `ask` / `deny`) work differently — they combine across every
level.** A `deny` set in your user settings still applies when the project settings say
nothing about it. And a project `deny` cannot be removed by a more specific local file.
:::

This is deliberate. Permissions are a safety mechanism. A safety mechanism you could switch
off by accident, just by adding a more specific config file, would be worthless.

::: trap "The project settings replaced my deny rule"
They did not. Permission rules stack up.

If a question describes a tool call being blocked even though the project settings allow it,
look for a `deny` somewhere else. Deny wins, and because the rules combine, it is still
active.
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

Matching works on the start of the command, split at the space. So `Bash(git diff *)` covers
`git diff` and `git diff --staged`, but not `git difftool`.

## Protected paths

Some paths are never auto-approved, no matter what your `allow` rules say:

- `.git`
- `.claude`
- `.mcp.json` and `.claude.json`
- shell startup files such as `.zshrc` and `.bashrc`

::: key-fact allow rules cannot pre-approve a protected path
Only `bypassPermissions` mode skips these checks.

Going the other way: `deny` rules and explicit `ask` rules still apply **even in
`bypassPermissions`**. The escape hatch is not total.
:::

The reason is worth understanding. These are exactly the files you would edit to weaken the
permission system itself. A safety system that let you quietly switch it off would not be a
safety system.

## The question shape

Almost every settings question is one of these:

- "Where should this go so the whole team gets it?" → project `.claude/settings.json`,
  committed.
- "Where should this go so only I get it?" → `~/.claude/settings.json` or
  `.claude/settings.local.json`.
- "Why is this still blocked?" → a `deny` at another level, or a protected path.
- "How do we stop someone overriding this?" → managed policy.
