---
id: d1-subagent-isolation
track: d1
order: 5
title: Subagent context isolation
summary: What a subagent inherits, what it does not, and the single most-tested consequence of getting that wrong.
minutes: 7
courseChapter: advanced-agents
---

This is the highest-value fact in the biggest domain. It is also the one people get wrong most
often, because the obvious guess is exactly backwards.

## The fact

::: key-fact A subagent starts from nothing
A subagent runs in its **own fresh context window**. It does **not** get the coordinator's
conversation history. Everything it needs must be written into the prompt that starts it. Only
its final message comes back to the parent.
:::

Think of it as handing a task to a contractor who has never met you. They know only what is
written on the job sheet. When they are done, they hand back a single report — not their
notes, not the phone calls they made.

Two consequences follow directly:

1. **Information does not flow down on its own.** If the coordinator learned something in turn
   3 and the subagent needs it, the coordinator has to write it into the delegation prompt.
   "The subagent can see the earlier findings" is a wrong answer.
2. **Detail does not flow up.** The parent gets the subagent's final message and nothing else.
   Not its reasoning along the way, not its tool calls, not the files it read.

## Why this is a good thing

This isolation is the reason multi-agent systems work at all:

- **Fewer tokens.** The coordinator's window stays small, because ten files were read in ten
  separate windows and it only receives ten summaries.
- **Better focus.** Less context means less to get distracted by. One subagent looking at one
  file with four tools is more reliable than one agent looking at forty files with twenty
  tools.
- **Least privilege.** Each subagent gets only the tools its job needs.
- **Tailored instructions.** Each one can have a system prompt written for its single job.

::: key-fact Less context per subagent means better results
When a question offers "give the subagent the full conversation history so it has more
information", that is the wrong direction.
:::

## When isolation is the wrong choice

There is a flip side, and the exam tests it:

::: trap Subagents are wrong when the work shares changing state
If the pieces need to see each other's work as it develops — a negotiation, an iterative
refinement, anything where step 4 depends on what step 3 just learned — isolation actively
hurts. Each agent is working from an out-of-date snapshot.

That is a job for one agent with one continuous context, or a step-by-step workflow. Not a
fan-out.
:::

## In Claude Code specifically

Subagents are started through the `Agent` tool (it used to be called `Task`, which still
works). A few configuration facts worth carrying:

- The `Agent` tool must be in `allowedTools` for delegation to be approved automatically.
  Without it, Claude will not delegate.
- Subagents are markdown files with YAML frontmatter. `name` and `description` are required.
  `description` is what Claude reads when deciding whether to delegate.
- Optional frontmatter includes `tools`, `disallowedTools`, `model`, `permissionMode`,
  `mcpServers`, `hooks`, `memory`, `effort`, and `isolation`.
- Precedence, highest first: managed policy, then the `--agents` CLI flag, then
  `.claude/agents/`, then `~/.claude/agents/`, then plugins.
- `model` defaults to whatever the parent is using.

::: exam-tip The description field is what does the routing
Just like with tools, Claude decides whether to delegate to a subagent by reading its
`description`.

A subagent that never gets used usually has a vague description, not a configuration bug.
:::
