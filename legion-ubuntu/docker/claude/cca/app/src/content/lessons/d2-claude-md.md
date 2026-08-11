---
id: d2-claude-md
track: d2
order: 2
title: CLAUDE.md, memory, and what "guidance" really means
summary: The file hierarchy, what belongs in each level, path-scoped rules, and the crucial fact that none of it is enforcement.
minutes: 7
courseChapter: cc-config
---

`CLAUDE.md` is how you tell Claude about your project. It is not how you make Claude do
something. Holding those two apart is worth several marks.

## The hierarchy

Files load in this order, and later ones layer on top:

| Location | Scope | In version control | Loaded |
|---|---|---|---|
| Managed policy | Organisation | n/a | Always |
| `~/.claude/CLAUDE.md` | User | No | Always, for this user |
| `./CLAUDE.md` or `./.claude/CLAUDE.md` | Project | **Yes** | Always, for everyone |
| `subdirectory/CLAUDE.md` | Directory | Yes | Only when working in that directory |
| `./CLAUDE.local.md` | Local | No | Always, for this checkout |

::: key-fact Team standards go in the project file
If a scenario says "the whole team should follow this convention", the answer is the
project-level file, because it is the one that is committed. A user-level file only affects
one person's machine, and a question offering it as the way to share a standard is offering
a distractor.
:::

## What belongs in it

**Include**: coding standards, test and build commands, architectural decisions, file
organisation, review criteria — the things a new engineer would need told.

**Exclude**: secrets and API keys (it is committed), and personal preferences (they belong
at user level).

## Imports and directory scoping

Files can import others with `@path` syntax, up to four hops deep, resolved relative to the
importing file. The `#` shortcut appends an entry from within a session, and `/memory`
manages what is there.

For rules that should only apply to some files, use `.claude/rules/` with `paths` glob
patterns in the frontmatter. Those rules load **only** when the matching files are being
edited, which keeps the always-on context small:

```yaml
---
paths:
  - "src/api/**/*.ts"
---
Every endpoint must validate its request body with a Zod schema before use.
```

::: exam-tip Why path-scoped rules exist
Not just tidiness — context economy. Everything in the top-level `CLAUDE.md` is loaded on
every single request. Rules that matter for 5% of files should not be paying rent in 100% of
contexts.
:::

## CLAUDE.md is not enforcement

This is the fact the exam actually tests.

::: key-fact CLAUDE.md is guidance, and guidance can be ignored
`CLAUDE.md` content is loaded as a user message after the system prompt. It is author-written
instruction, not configuration the runtime enforces. Claude will usually follow it. Usually
is not a guarantee.
:::

::: trap "Add it to CLAUDE.md" as the answer to a hard requirement
When a scenario says an action must **always** happen, must **never** be permitted, or must
be **guaranteed** — `CLAUDE.md` is the wrong answer every time. The right answer is a hook
(to guarantee something happens) or a `permissions.deny` rule (to guarantee something cannot).
This single substitution is worth more marks than any other fact in this domain.
:::

## Auto memory is a different thing

Do not confuse `CLAUDE.md` with auto memory:

- **`CLAUDE.md`** — you write it, it is loaded every session, it describes the project.
- **Auto memory** — Claude writes it, per repository, under
  `~/.claude/projects/<project>/memory/`. `MEMORY.md` is the index (first 200 lines or 25KB);
  individual topic files load on demand.

One is your instructions to Claude. The other is Claude's notes to itself.

::: exam-tip AGENTS.md
Claude Code reads `CLAUDE.md`, not `AGENTS.md`. If a project standardises on `AGENTS.md`,
import it or symlink it — do not assume it is picked up.
:::
