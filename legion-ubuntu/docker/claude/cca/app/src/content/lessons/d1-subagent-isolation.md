---
id: d1-subagent-isolation
track: d1
order: 5
title: Subagent context isolation
summary: What a subagent inherits, what it does not, and the single most-tested consequence of getting that wrong.
minutes: 7
courseChapter: advanced-agents
---

This is the highest-yield fact in the highest-weighted domain. It is also the one people get
wrong most often, because the intuitive model is exactly backwards.

## The fact

::: key-fact A subagent starts cold
A subagent runs in its **own fresh context window**. It does **not** inherit the
coordinator's conversation history. Everything it needs must be passed explicitly in the
prompt string that invokes it. Only its final message returns to the parent.
:::

Two consequences fall straight out:

1. **Context does not flow down automatically.** If the coordinator learned something in
   turn 3 and the subagent needs it, the coordinator must write it into the delegation
   prompt. "The subagent can see the earlier findings" is a distractor.
2. **Detail does not flow up.** The parent receives the subagent's final message and nothing
   else — not its intermediate reasoning, not its tool calls, not the files it read.

## Why this is a feature

Isolation is the reason multi-agent systems work at all:

- **Token efficiency.** The coordinator's window stays small because ten files were read in
  ten separate windows, and it only receives ten summaries.
- **Focus.** Less context per agent means less to be distracted by. A subagent looking at one
  file with four tools is more reliable than one agent looking at forty files with twenty
  tools.
- **Least privilege.** Each subagent can be given only the tools its job needs.
- **Specialised prompting.** Each can have a system prompt written for its single job.

::: key-fact The isolation principle
Less context per subagent means more focused and more reliable. When a question offers "give
the subagent the full conversation history so it has more information", that is the wrong
direction.
:::

## When isolation is the wrong choice

The flip side, and the exam tests it:

::: trap Subagents are wrong for shared evolving state
If subtasks need to see each other's work as it develops — a negotiation, an iterative
refinement, anything where step 4 depends on what step 3 just learned — isolation actively
hurts. Each agent works from a stale snapshot. That is a job for a single agent with one
continuous context, or a sequential workflow, not a fan-out.
:::

## In Claude Code specifically

Subagents are invoked through the `Agent` tool (formerly `Task`, still accepted as an alias).
A few configuration facts worth carrying:

- The `Agent` tool must be in `allowedTools` for delegation to be auto-approved. Without it,
  Claude will not delegate.
- Subagents are defined as markdown files with YAML frontmatter. `name` and `description` are
  required — `description` is what Claude matches against when deciding whether to delegate.
- Optional frontmatter includes `tools`, `disallowedTools`, `model`, `permissionMode`,
  `mcpServers`, `hooks`, `memory`, `effort`, and `isolation`.
- Precedence, highest first: managed policy, then the `--agents` CLI flag, then
  `.claude/agents/`, then `~/.claude/agents/`, then plugins.
- `model` defaults to inheriting the parent's.

::: exam-tip The description field is the routing mechanism
Just as with tools, Claude decides whether to delegate to a subagent by reading its
`description`. A subagent that never gets invoked usually has a vague description, not a
configuration bug.
:::
