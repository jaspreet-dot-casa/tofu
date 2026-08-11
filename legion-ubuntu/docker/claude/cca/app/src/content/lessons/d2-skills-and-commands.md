---
id: d2-skills-commands
track: d2
order: 5
title: Skills, slash commands and subagent definitions
summary: How custom commands and skills are defined, what the frontmatter controls, and which wins when names collide.
minutes: 6
courseChapter: cc-config
---

There are three ways to package reusable behaviour in Claude Code: slash commands, skills and
subagents. They overlap enough that the exam tests the boundaries between them.

## Commands and skills are now the same thing

Custom commands and skills have been merged. Both of these create `/deploy`:

```text
.claude/commands/deploy.md
.claude/skills/deploy/SKILL.md
```

::: key-fact When a skill and a command share a name, the skill wins
:::

Subdirectories create namespaces, so `.claude/commands/db/migrate.md` becomes `/db:migrate`.

## Frontmatter

```yaml
---
name: review-api
description: Review API handlers against the team's checklist
allowed-tools: [Read, Grep, Glob]
disallowed-tools: [Bash]
argument-hint: "<path to handler>"
model: sonnet
effort: high
context: fork
paths: ["src/api/**"]
---
```

The fields worth remembering:

- **`description`** — what Claude reads when deciding whether to use this. Vague descriptions
  are the reason skills do not fire.
- **`allowed-tools` / `disallowed-tools`** — give this one job only the tools it needs.
- **`context: fork`** — run in a separate subagent instead of the main conversation. Use it
  when the skill produces a lot of intermediate output that would otherwise clutter the main
  context.
- **`paths`** — limit the skill to matching files.

## Putting things into the prompt

Inside a command or skill body:

- `$ARGUMENTS` — everything typed after the command.
- `$ARGUMENTS[N]` or `$N` — one argument by position, counting from zero, so `$0` is the
  first.
- `` !`command` `` — runs a shell command and drops its output in.
- `@file` — drops a file's contents in.
- `${CLAUDE_SKILL_DIR}` — the skill's own directory, for bundled scripts and templates.

::: exam-tip Injected command output runs every time the skill loads
`` !`git diff --staged` `` puts the current diff into the prompt. Great for review commands.

A trap for anything slow or with side effects, though — it runs on every single invocation.
:::

## Subagent definitions

Subagents are markdown files with YAML frontmatter, where the body becomes the system prompt.

Required: `name` and `description`. Optional: `tools`, `disallowedTools`, `model`,
`permissionMode`, `mcpServers`, `hooks`, `memory`, `effort`, `isolation`.

Precedence, highest first: managed policy → `--agents` CLI flag (JSON, session-only) →
`.claude/agents/` (project) → `~/.claude/agents/` (user) → plugin.

Built-ins worth knowing: **Explore** (read-only search), **Plan** (read-only design), and a
general-purpose agent with the full tool set.

::: key-fact model defaults to inheriting the parent's
A subagent with no `model` set runs on whatever the parent is using.

Questions that assume subagents default to something cheaper are wrong. If you want Haiku
subagents under an Opus lead, you have to say so.
:::

## Which one for which job

| You want | Use |
|---|---|
| A repeatable prompt you trigger by name | Slash command / skill |
| A specialist worker Claude hands work to on its own | Subagent |
| Something that must run on every edit, no exceptions | Hook |
| Project facts everyone should have loaded | `CLAUDE.md` |

The difference between the first two is **who starts it**. You type `/review`. Claude decides
by itself to hand work to a subagent, based on that subagent's `description`.
