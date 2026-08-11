---
id: d2-claude-md
track: d2
order: 2
title: CLAUDE.md, memory, and what "guidance" really means
summary: The file hierarchy, what belongs in each level, path-scoped rules, and the crucial fact that none of it is enforcement.
minutes: 7
courseChapter: cc-config
---

`CLAUDE.md` is how you tell Claude about your project.

It is not how you make Claude do something. Keeping those two apart is worth several marks.

## The hierarchy

Files load in this order, and later ones layer on top of earlier ones:

| Location | Scope | In version control | Loaded |
|---|---|---|---|
| Managed policy | Organisation | n/a | Always |
| `~/.claude/CLAUDE.md` | User | No | Always, for this user |
| `./CLAUDE.md` or `./.claude/CLAUDE.md` | Project | **Yes** | Always, for everyone |
| `subdirectory/CLAUDE.md` | Directory | Yes | Only when working in that directory |
| `./CLAUDE.local.md` | Local | No | Always, for this checkout |

::: key-fact Team standards go in the project file
If a question says "the whole team should follow this convention", the answer is the
project-level file. It is the one that gets committed.

A user-level file only affects one person's machine. If a question offers that as the way to
share a team standard, it is a wrong answer.
:::

## What belongs in it

**Put in**: coding standards, test and build commands, architecture decisions, how files are
organised, review criteria. The things you would tell a new engineer on day one.

**Leave out**: secrets and API keys (the file is committed), and personal preferences (those
belong in your user-level file).

## Imports and directory scoping

Files can pull in other files with `@path`, up to four hops deep, resolved relative to the
importing file. The `#` shortcut adds an entry from inside a session, and `/memory` manages
what is there.

For rules that should only apply to some files, use `.claude/rules/` with `paths` glob
patterns in the frontmatter. Those rules load **only** when a matching file is being edited,
which keeps the always-on context small:

```yaml
---
paths:
  - "src/api/**/*.ts"
---
Every endpoint must validate its request body with a Zod schema before use.
```

::: exam-tip Why path-scoped rules exist
It is not just tidiness. Everything in the top-level `CLAUDE.md` gets loaded on **every single
request**.

A rule that only matters for 5% of your files should not be taking up space in 100% of your
contexts.
:::

## CLAUDE.md does not enforce anything

This is the fact the exam actually tests.

::: key-fact CLAUDE.md is advice, and advice can be ignored
`CLAUDE.md` is loaded as a user message after the system prompt. It is something you wrote,
not a setting the system enforces.

Claude will usually follow it. Usually is not a guarantee.
:::

::: trap "Add it to CLAUDE.md" as the answer to a hard requirement
When a question says an action must **always** happen, must **never** be allowed, or must be
**guaranteed** — `CLAUDE.md` is wrong every time.

The right answer is a hook (to make something happen) or a `permissions.deny` rule (to make
something impossible). This one swap is worth more marks than any other fact in this domain.
:::

## Auto memory is a different thing

Do not mix up `CLAUDE.md` and auto memory:

- **`CLAUDE.md`** — you write it, it loads every session, it describes the project.
- **Auto memory** — Claude writes it, one set per repository, under
  `~/.claude/projects/<project>/memory/`. `MEMORY.md` is the index (first 200 lines or 25KB);
  individual topic files load only when needed.

One is your instructions to Claude. The other is Claude's notes to itself.

::: exam-tip AGENTS.md
Claude Code reads `CLAUDE.md`, not `AGENTS.md`. If a project has standardised on `AGENTS.md`,
import it or symlink it. Do not assume it gets picked up.
:::
