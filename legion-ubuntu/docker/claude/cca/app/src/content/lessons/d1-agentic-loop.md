---
id: d1-agentic-loop
track: d1
order: 1
title: The agentic loop and stop_reason
summary: The four-step cycle every agent runs, what each stop_reason means, and the loop-control mistakes the exam tests.
minutes: 9
courseChapter: agentic-loop
---

Everything in this domain sits on top of one small cycle. If you can write it from memory,
a surprising number of questions answer themselves.

## The cycle

```text
send request  →  check stop_reason  →  execute tool  →  return tool_result  →  repeat
```

Concretely:

1. You send a request with a prompt and a set of tool definitions.
2. Claude evaluates the state and either produces text or asks for tools. Asking for tools
   comes back as `stop_reason: "tool_use"` with one or more `tool_use` content blocks, each
   carrying an `id`, a `name` and an `input`.
3. **Your code** executes those tools. The model never runs anything itself.
4. You send back a user message containing `tool_result` blocks, each referencing the
   matching `tool_use_id`.
5. Repeat until Claude answers with `stop_reason: "end_turn"`.

::: key-fact The loop is yours, not the model's
Claude requests tool calls; your application executes them and decides whether to continue.
"The model executes the tool" is a distractor. This also means every guardrail — turn caps,
token budgets, permission checks — lives in your loop, which is exactly where the exam
expects you to put them.
:::

## Reading stop_reason

Branching on `stop_reason` is not optional. The values you need to recognise:

| Value | Meaning | What you do |
|---|---|---|
| `tool_use` | Claude wants one or more tools run | Execute, return `tool_result`, continue |
| `end_turn` | Claude finished naturally | Stop the loop |
| `max_tokens` | Output hit the cap mid-answer | Continue or retry with a larger cap — the answer is truncated |
| `stop_sequence` | A configured stop sequence was produced | Stop |
| `refusal` | Claude declined | Do not retry blindly; surface it |
| `pause_turn` | A long-running server tool needs another round trip | Send the response back to continue |
| `model_context_window_exceeded` | The window filled | Compact, trim, or restart with less context |

::: trap Treating end_turn and tool_use as the only two cases
A loop written as `while (stop_reason === 'tool_use')` silently treats `max_tokens` and
`refusal` as successful completions and hands a truncated or refused answer downstream as
though it were finished. Scenario questions about "the agent reported success but the output
was incomplete" are usually pointing at exactly this.
:::

## Conversation history

Each iteration appends to the same message list: the assistant turn containing the
`tool_use` blocks, then the user turn containing the `tool_result` blocks. Drop either and
the next request is incoherent — the model sees a request for a tool with no result, or a
result with no request.

Two ordering rules worth knowing precisely:

- `tool_result` blocks must come **first** in the content array of the user message that
  carries them.
- If extended thinking is on, the unmodified thinking block that accompanied the tool call
  must be returned alongside the `tool_result`, signature intact. Editing, reordering or
  reconstructing it produces a 400.

## Signalling tool failure

When a tool runs and fails, you do not throw. You return a `tool_result` with
`is_error: true` and a useful message in `content`:

```json
{
  "type": "tool_result",
  "tool_use_id": "toolu_01A...",
  "is_error": true,
  "content": "Rate limited by the billing API (429). Retry after 30s."
}
```

Claude will typically retry a couple of times before giving up and telling the user. A bare
`"error"` string gives it nothing to act on; a structured message lets it choose a different
approach.

::: exam-tip Distinguish the two error paths
A tool that **ran and failed** is a normal result with an error flag — `is_error: true` on
the Claude API, `isError: true` in MCP. A **malformed request** (unknown tool, bad
arguments) is a protocol-level error: a 400 from the Claude API, or a JSON-RPC error code
like `-32602` in MCP. Questions love to swap these two.
:::

## Bounding the loop

An agentic loop that can call tools can, in principle, run forever. Every production loop
needs at least:

- a **maximum turn count**, so a stuck agent terminates;
- a **cumulative token ceiling** across the whole loop, not per request;
- a **wrap-up injection** at around 80% of the budget, telling the agent to summarise and
  conclude, with a hard stop enforced in code at 100%.

::: key-fact The 80/100 pattern
Ask for a graceful wrap-up at 80% of the token budget; enforce the stop programmatically at
100%. Relying only on the polite request is prompt-based enforcement of something that must
be guaranteed — and it is the wrong half of the pattern to keep if a question makes you
choose.
:::
