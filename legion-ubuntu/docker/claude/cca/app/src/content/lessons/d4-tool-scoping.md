---
id: d4-tool-scoping
track: d4
order: 5
title: Scoping tools across a distributed system
summary: Least privilege per agent role, namespacing overlapping tools, and where a tool boundary should fall.
minutes: 5
courseChapter: mcp
---

Once a system has several agents and several MCP servers, the design question stops being
"what tools exist" and becomes "who can see which".

## Scope by role, not by convenience

::: key-fact Universal tool access is one of the seven anti-patterns
Giving every agent every tool degrades selection accuracy, widens the blast radius of a
mistake, and makes the system harder to reason about. Scope each agent to the four or five
tools its role needs.
:::

A research system, scoped properly:

| Agent | Tools |
|---|---|
| Coordinator | `Agent` (delegation) and nothing else |
| Search | `web_search`, `Grep`, `Glob` |
| Analysis | `Read`, `code_execution` |
| Reporting | `Write` |

Note the coordinator: its job is decompose, delegate, synthesise. Handing it the workers'
tools invites it to do the work itself, which defeats the isolation the architecture exists
to provide.

## Where a tool boundary belongs

A good tool does one job with a clear input and a clear output. Two failure modes:

- **Too coarse** — one `manage_order` tool taking an `action` parameter that switches between
  lookup, refund and cancellation. The description cannot honestly say when to use it,
  because it does six different things, and the model cannot select it well.
- **Too fine** — eleven tools that are really one search with different filters. Now you are
  against the tool-count ceiling for no benefit.

::: exam-tip The description test
If you cannot write a clear three-sentence description saying when to use a tool and when not
to, the boundary is wrong. That is not a writing problem, it is a design problem surfacing as
one.
:::

## Overlapping tools

When two tools could plausibly serve the same request, the fix is in the descriptions:
explicit boundary statements naming the other tool.

> "Use this to look up order **history**. Do NOT use it to check refund eligibility — call
> `check_refund_policy`, which applies the current policy rules."

Namespacing helps too. MCP tools already arrive namespaced as `mcp__<server>__<tool>`, which
is why two MCP servers can both expose a `search` without colliding.

## Consolidating versus splitting

| Symptom | Fix |
|---|---|
| Claude picks between two similar tools inconsistently | Sharpen both descriptions with boundary statements; consider merging |
| Agent has 20+ tools and misroutes | Split the work across subagents |
| One tool's description needs the word "or" three times | Split the tool |
| Two tools are never used independently | Merge them |

::: trap Solving a routing problem with tool_choice
Forcing a specific tool removes the model's ability to choose *at all*, which is fine when you
genuinely always want that tool and wrong when the problem was that it sometimes picks
incorrectly. Forcing is a control mechanism, not a fix for an ambiguous specification.
:::
