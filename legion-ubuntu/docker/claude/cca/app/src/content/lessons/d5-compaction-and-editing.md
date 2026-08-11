---
id: d5-compaction-editing
track: d5
order: 3
title: Compaction, context editing and retrieval
summary: Three different tools for three different symptoms, and how to tell from a question stem which one is wanted.
minutes: 6
courseChapter: sessions
---

There are three ways to stop a context filling up, and they are not interchangeable. The exam
gives you a symptom and expects the matching tool.

## The three

::: key-fact Match the tool to the symptom
- **Compaction** — the *conversation* is long. The API summarises earlier turns server-side
  so it can continue past the limit.
- **Context editing** — the *tool results* are bulky. Surgically clear old tool outputs or
  thinking blocks while leaving the conversation intact.
- **Retrieval (RAG)** — the *corpus* is large and only a fraction is ever relevant. Fetch
  only what the current question needs.
:::

A long chat is a compaction problem. Forty large file reads is a context-editing problem. A
10,000-document knowledge base is a retrieval problem. Answering "use a bigger window" to any
of them is the trap from the context-rot lesson.

## Compaction

Server-side summarisation of earlier turns, so a long-running conversation can continue with
minimal integration work on your side. It is a beta: pass the `anthropic-beta` header
`compact-2026-01-12` and include a `{"type": "compact_20260112"}` edit in
`context_management`.

Claude Code exposes the same idea as `/compact`.

::: exam-tip PreCompact exists for a reason
If state matters and would be lost in a summary, persist it before compaction happens — that
is what the `PreCompact` hook is for. Summarisation is lossy by construction.
:::

## Context editing

Beta header `anthropic-beta: context-management-2025-06-27`, with a
`context_management.edits` array:

- **`clear_tool_uses_20250919`** — clears old tool results past a trigger (default 100k input
  tokens). Options: `keep` (default 3 tool uses), `clear_at_least`, `exclude_tools`,
  `clear_tool_inputs`.
- **`clear_thinking_20251015`** — trims old thinking blocks; `keep` accepts a number of
  thinking turns or `"all"`.

The response reports what was removed in `context_management.applied_edits`.

## Thinking blocks

::: key-fact The API strips old thinking automatically — except during a tool-use cycle
Previous thinking blocks are removed from later turns for you. **But** when returning a
`tool_result` for a tool call that came with thinking, the entire unmodified thinking block,
signature intact, must be sent back. Editing, reordering, filtering or reconstructing it
produces a 400 `invalid_request_error`. Include `redacted_thinking` blocks too.
:::

This is a classic distractor: an option suggesting you strip thinking blocks to save context
during a tool loop. It is exactly the one place you must not.

## Subagent offloading

The fourth option, and often the best one for bulk work: spawn a subagent per unit. Ten files
become ten isolated contexts, each returning a focused summary, and the coordinator
synthesises ten summaries instead of reading ten files.

This is Domain 1's isolation principle applied as a context strategy — and it is why the two
domains keep referring to each other.

## Built-in context awareness

Some models receive their own budget information: a `<budget:token_budget>` value and
post-tool-call `<system_warning>` updates on remaining capacity. It helps a model pace itself
on a long task. It is not a substitute for enforcing a budget in your loop.
