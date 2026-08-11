---
id: d4-tool-scoping
track: d4
order: 5
title: Scoping tools across a distributed system
summary: Least privilege per agent role, namespacing overlapping tools, and where a tool boundary should fall.
minutes: 5
courseChapter: mcp
---

Once a system has several agents and several MCP servers, the interesting question stops being
"what tools exist" and becomes "who is allowed to see which".

## Scope by role, not by convenience

::: key-fact Giving everyone every tool is one of the seven anti-patterns
It makes selection worse, it means a single mistake can do more damage, and it makes the system
harder to reason about.

Give each agent the four or five tools its role actually needs.
:::

A research system, scoped properly:

| Agent | Tools |
|---|---|
| Coordinator | `Agent` (delegation) and nothing else |
| Search | `web_search`, `Grep`, `Glob` |
| Analysis | `Read`, `code_execution` |
| Reporting | `Write` |

Look at the coordinator. Its job is to break up, hand out, and combine. Give it the workers'
tools and it will start doing the work itself — which destroys the isolation the whole design
exists to provide.

## Where one tool should end and another begin

A good tool does one job, with a clear input and a clear output. There are two ways to get it
wrong:

- **Too broad** — one `manage_order` tool with an `action` parameter that switches between
  lookup, refund and cancellation. The description cannot honestly say when to use it, because
  it does six different things. So the model cannot pick it well.
- **Too narrow** — eleven tools that are really one search with different filters. Now you are
  pressing against the tool-count ceiling for no benefit.

::: exam-tip The description test
If you cannot write a clear three-sentence description saying when to use a tool and when not
to, the boundary is in the wrong place.

That is not a writing problem. It is a design problem showing up as one.
:::

## Tools that overlap

When two tools could both plausibly answer the same request, fix it in the descriptions. Name
the other tool explicitly:

> "Use this to look up order **history**. Do NOT use it to check refund eligibility — call
> `check_refund_policy`, which applies the current policy rules."

Namespacing helps too. MCP tools already arrive named `mcp__<server>__<tool>`, which is why two
MCP servers can both offer a `search` without clashing.

## Merge or split?

| Symptom | Fix |
|---|---|
| Claude picks between two similar tools inconsistently | Sharpen both descriptions and name the other one; consider merging |
| Agent has 20+ tools and keeps misrouting | Split the work across subagents |
| One tool's description needs the word "or" three times | Split the tool |
| Two tools are never used apart | Merge them |

::: trap Solving a routing problem with tool_choice
Forcing a specific tool removes the model's ability to choose *at all*.

That is fine when you genuinely always want that tool. It is wrong when the problem was that it
sometimes chooses badly. Forcing is a control, not a fix for a vague description.
:::
