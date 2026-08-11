---
id: d2-skills-commands
track: d2
order: 5
title: Skills, slash commands and subagent definitions
summary: How custom commands and skills are defined, what the frontmatter controls, and which wins when names collide.
minutes: 6
courseChapter: cc-config
---

Reusable behaviour in Claude Code comes in three packages: slash commands, skills and
subagents. They overlap enough that the exam tests the boundaries.

## Commands and skills are the same thing now

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

- **`description`** — what Claude matches on when deciding to use this. Vague descriptions
  are why skills do not fire.
- **`allowed-tools` / `disallowed-tools`** — least privilege for this one job.
- **`context: fork`** — run in an isolated subagent instead of the main conversation. Use it
  when the skill produces a lot of intermediate output that would otherwise pollute the main
  context.
- **`paths`** — scope the skill to matching files.

## Argument and content interpolation

Inside a command or skill body:

- `$ARGUMENTS` — everything passed after the command.
- `$ARGUMENTS[N]` or `$N` — indexed, zero-based, so `$0` is the first argument.
- `` !`command` `` — injects the output of a shell command at load time.
- `@file` — injects a file's contents.
- `${CLAUDE_SKILL_DIR}` — the skill's own directory, for bundled scripts and templates.

::: exam-tip Injected command output is evaluated when the skill loads
`` !`git diff --staged` `` puts the current diff into the prompt. That is powerful for
review commands and a trap for anything expensive or side-effecting — it runs every time the
skill is invoked.
:::

## Subagent definitions

Subagents are markdown files with YAML frontmatter, where the body is the system prompt.
Required: `name` and `description`. Optional: `tools`, `disallowedTools`, `model`,
`permissionMode`, `mcpServers`, `hooks`, `memory`, `effort`, `isolation`.

Precedence, highest first: managed policy → `--agents` CLI flag (JSON, session-only) →
`.claude/agents/` (project) → `~/.claude/agents/` (user) → plugin.

Built-ins worth knowing: **Explore** (read-only search), **Plan** (read-only design), and a
general-purpose agent with the full tool set.

::: key-fact model defaults to inherit
A subagent with no `model` runs on the parent's model. Questions that assume subagents
default to a cheaper tier are wrong — if you want Haiku subagents under an Opus lead, you
have to say so.
:::

## Which package for which job

| You want | Use |
|---|---|
| A repeatable prompt the user triggers by name | Slash command / skill |
| A specialised worker Claude delegates to on its own | Subagent |
| Something that must always run on every edit | Hook |
| Project facts everyone should have loaded | `CLAUDE.md` |

The distinction between the first two is who initiates. A user types `/review`. Claude
decides on its own to hand work to a subagent, based on that subagent's `description`.
