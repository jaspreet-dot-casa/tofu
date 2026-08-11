---
id: d5-compaction-editing
track: d5
order: 3
title: Compaction, context editing and retrieval
summary: Three different tools for three different symptoms, and how to tell from a question stem which one is wanted.
minutes: 6
courseChapter: sessions
---

There are three ways to stop a context filling up. They are not interchangeable.

The exam gives you a symptom and expects you to name the matching tool.

## The three

::: key-fact Match the tool to the symptom
- **Compaction** — the *conversation* is long. The API summarises the earlier turns for you, so
  it can keep going past the limit.
- **Context editing** — the *tool results* are bulky. Clear out old tool outputs or thinking
  blocks while leaving the conversation itself alone.
- **Retrieval (RAG)** — the *body of documents* is huge and only a small slice is ever
  relevant. Fetch just what this question needs.
:::

A long chat is a compaction problem. Forty big file reads is a context-editing problem. A
10,000-document knowledge base is a retrieval problem.

Answering "use a bigger window" to any of them is the trap from the context-rot lesson.

## Compaction

The API summarises earlier turns on its side, so a long-running conversation can continue with
very little work from you.

It is in beta: pass the `anthropic-beta` header `compact-2026-01-12` and include a
`{"type": "compact_20260112"}` edit in `context_management`.

Claude Code offers the same thing as `/compact`.

::: exam-tip PreCompact exists for a reason
Summarising is lossy. Things get left out.

If some state matters and would be lost in a summary, save it before compaction happens. That
is exactly what the `PreCompact` hook is for.
:::

## Context editing

Beta header `anthropic-beta: context-management-2025-06-27`, with a `context_management.edits`
array:

- **`clear_tool_uses_20250919`** — clears old tool results once you pass a trigger (default
  100k input tokens). Options: `keep` (default 3 tool uses), `clear_at_least`, `exclude_tools`,
  `clear_tool_inputs`.
- **`clear_thinking_20251015`** — trims old thinking blocks. `keep` takes a number of thinking
  turns, or `"all"`.

The response tells you what was removed in `context_management.applied_edits`.

## Thinking blocks

::: key-fact The API strips old thinking for you — except during a tool-use cycle
Previous thinking blocks get removed from later turns automatically.

**But** when you return a `tool_result` for a tool call that came with thinking, you must send
that entire thinking block back untouched, signature intact. Editing, reordering, filtering or
rebuilding it produces a 400 `invalid_request_error`. Include `redacted_thinking` blocks too.
:::

This is a classic wrong answer: an option suggesting you strip thinking blocks to save context
during a tool loop. That is the one place you must not.

## Subagent offloading

The fourth option, and often the best one for bulk work: give each unit its own subagent.

Ten files become ten separate contexts. Each returns a focused summary. The coordinator reads
ten summaries instead of ten files.

This is Domain 1's isolation principle used as a context strategy — and it is why the two
domains keep pointing at each other.

## Built-in context awareness

Some models are told about their own budget: a `<budget:token_budget>` value, plus
`<system_warning>` updates after tool calls telling them how much capacity is left.

It helps a model pace itself on a long task. It is not a substitute for enforcing a budget in
your own loop.
