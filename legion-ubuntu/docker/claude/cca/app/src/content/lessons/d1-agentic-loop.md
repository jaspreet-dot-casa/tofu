---
id: d1-agentic-loop
track: d1
order: 1
title: The agentic loop and stop_reason
summary: The four-step cycle every agent runs, what each stop_reason means, and the loop-control mistakes the exam tests.
minutes: 9
courseChapter: agentic-loop
---

An agent is a loop. The same four steps, over and over, until the job is done. Everything else
in this domain is built on top of it.

If you can write this loop out from memory, a surprising number of questions answer
themselves.

## The cycle

```text
send request  →  check stop_reason  →  execute tool  →  return tool_result  →  repeat
```

Step by step:

1. You send a request with a prompt and a list of tools Claude is allowed to use.
2. Claude looks at the situation. It either writes an answer, or it asks for a tool. Asking
   for a tool comes back as `stop_reason: "tool_use"`, along with one or more `tool_use`
   blocks. Each block has an `id`, a `name` and an `input`.
3. **Your code** runs those tools. Claude never runs anything itself.
4. You send back a user message with `tool_result` blocks in it. Each one points at the
   matching `tool_use_id`.
5. Repeat until Claude replies with `stop_reason: "end_turn"`.

::: key-fact The loop is yours, not the model's
Claude asks for tool calls. Your application runs them and decides whether to keep going.
"The model executes the tool" is a wrong answer. It also means every safety limit — turn caps,
token budgets, permission checks — lives in your loop. That is exactly where the exam expects
you to put them.
:::

## Reading stop_reason

`stop_reason` tells you why Claude stopped talking. You have to check it every time. These are
the values to know:

| Value | Meaning | What you do |
|---|---|---|
| `tool_use` | Claude wants one or more tools run | Run them, return `tool_result`, continue |
| `end_turn` | Claude finished normally | Stop the loop |
| `max_tokens` | The answer hit the length cap partway through | The answer is cut off — retry with a bigger cap, or continue |
| `stop_sequence` | Claude produced a stop sequence you configured | Stop |
| `refusal` | Claude declined | Do not just retry — show it to someone |
| `pause_turn` | A slow server-side tool needs another round trip | Send the response back to carry on |
| `model_context_window_exceeded` | The context window filled up | Compact, trim, or restart with less in it |

::: trap Treating end_turn and tool_use as the only two cases
Write your loop as `while (stop_reason === 'tool_use')` and you have quietly told it that
`max_tokens` and `refusal` mean "finished successfully". A cut-off or refused answer then gets
passed downstream as if it were complete.

Questions about "the agent reported success but the output was incomplete" are pointing
straight at this.
:::

## Conversation history

Every time round the loop, you add to the same message list. First the assistant turn holding
the `tool_use` blocks. Then the user turn holding the `tool_result` blocks.

Drop either one and the next request makes no sense. Claude sees a tool request with no result,
or a result with no request.

Two ordering rules to know exactly:

- `tool_result` blocks must come **first** in the content array of the user message that
  carries them.
- If extended thinking is switched on, you must send back the thinking block that came with
  the tool call, untouched, alongside the `tool_result`. Its signature has to stay intact.
  Editing it, reordering it, or rebuilding it gets you a 400 error.

## Telling Claude a tool failed

When a tool runs and fails, you do not throw an exception. You return a `tool_result` with
`is_error: true` and a message worth reading in its `content`:

```json
{
  "type": "tool_result",
  "tool_use_id": "toolu_01A...",
  "is_error": true,
  "content": "Rate limited by the billing API (429). Retry after 30s."
}
```

Claude will usually retry a couple of times, then give up and tell the user. A bare `"error"`
string gives it nothing to work with. A message like the one above lets it choose a different
approach.

::: exam-tip Two kinds of failure, and they are handled differently
A tool that **ran and failed** is a normal result with an error flag — `is_error: true` on the
Claude API, `isError: true` in MCP.

A **badly formed request** — unknown tool, wrong arguments — is a different thing entirely. It
is a protocol error: a 400 from the Claude API, or a JSON-RPC code like `-32602` in MCP.

Questions love to swap these two around.
:::

## Stopping the loop

A loop that can call tools can, in principle, run forever. Every production loop needs at
least three things:

- a **maximum number of turns**, so a stuck agent eventually stops;
- a **total token ceiling** for the whole loop, not per request;
- a **wrap-up message** at about 80% of the budget, telling the agent to summarise and
  finish — plus a hard stop in your code at 100%.

::: key-fact The 80/100 pattern
At 80% of the token budget, ask the agent to wrap up. At 100%, stop it in code.

Asking politely is not enforcement. If a question makes you choose between the two halves,
keep the code.
:::
