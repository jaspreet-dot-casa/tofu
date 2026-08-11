---
id: d4-mcp-architecture
track: d4
order: 3
title: MCP architecture and primitives
summary: Host, client and server; the three server primitives; and the field-naming difference that catches people out.
minutes: 7
courseChapter: mcp
---

The Model Context Protocol (MCP) is the standard way to give Claude tools that live outside
your own application code.

The exam tests the architecture precisely, not vaguely. Learn the pieces and what connects to
what.

## Host, client, server

```text
╭──────────────────────────────────────────╮
│  HOST  (Claude Code, Claude Desktop)     │
│   ╭────────────╮      ╭────────────╮     │
│   │ MCP client │      │ MCP client │     │   one client per connection
│   ╰──────┬─────╯      ╰──────┬─────╯     │
╰──────────┼───────────────────┼───────────╯
           │                   │
    ╭──────▼─────╮      ╭──────▼──────╮
    │ MCP server │      │ MCP server  │
    │  (github)  │      │ (postgres)  │
    ╰────────────╯      ╰─────────────╯
```

The **host** is the app you use. It runs one **client** per connection, and each client holds a
dedicated link to exactly one **server**.

It is built on JSON-RPC 2.0, and split into a data layer (lifecycle, primitives, notifications)
and a transport layer (connection, framing, authorisation).

## The three things a server can offer

::: key-fact Tools, resources, prompts
- **Tools** — actions the model chooses to run, called via `tools/call`.
- **Resources** — data to read, fetched via `resources/read`. Browsable, read-only.
- **Prompts** — reusable templates. A person or the application picks these; the model does
  not.
:::

The distinction the exam wants is **who starts it**. A tool is something Claude decides to
call. A resource is data sitting there to be read. A prompt is a template a person picks.

Clients can offer capabilities back to servers too: sampling (`sampling/createMessage`),
elicitation (`elicitation/create`) and logging. Finding out what exists uses `*/list` methods.

### What resources are actually for

Resources are easy to dismiss as "tools but weaker". Their real job is to hand the agent a
**map** so it does not have to go exploring to find one.

Typical resources: a catalogue of every task in a project, a database schema, an API reference,
a set of issue summaries. Without them, an agent that needs to know what data exists has to
spend a run of exploratory tool calls — and a context window — discovering it.

::: exam-tip Exploratory calls are the symptom a resource cures
If a question describes an agent burning turns working out what is available before it can do
anything useful, the answer is to expose that structure as a resource.
:::

## Transports

| Transport | Where | Notes |
|---|---|---|
| **stdio** | Local process | Single client, no network, command and args |
| **Streamable HTTP** | Remote | HTTP POST plus optional SSE; bearer, API-key or custom-header auth, OAuth recommended |
| `sse` | — | Deprecated |
| `ws` | Remote | WebSocket, header auth only |

::: exam-tip Two facts answer most transport questions
stdio is **local**, **one** client, **no network**.

Streamable HTTP is **remote**, **many** clients, HTTP with optional SSE.

That pair usually settles it without needing anything else.
:::

## Configuration and scope in Claude Code

Add servers with `claude mcp add` (or `add-json`). There are three scopes:

| Scope | File | Shared |
|---|---|---|
| **local** (default) | `~/.claude.json` | No — you, this project only |
| **project** | `.mcp.json` at the repo root | **Yes, committed** — prompts for approval |
| **user** | `~/.claude.json` | No — you, all your projects |

::: key-fact MCP scopes do not combine
Precedence is **local > project > user > plugin > claude.ai connector**, and the
highest-priority entry wins **as a whole**. Fields are not merged between scopes.

This is the opposite of permission rules, which do combine. The exam likes putting the two
side by side.
:::

Tools are namespaced `mcp__<server>__<tool>`. Manage them with `claude mcp list / get / remove`
and the `/mcp` command.

Environment variables expand with `${VAR}` syntax. That is how a committed `.mcp.json` can
reference secrets without containing them:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" }
    }
  }
}
```

## The naming trap

::: trap Claude API is snake_case; MCP is camelCase
The Claude API uses `input_schema`, `is_error`, `tool_use_id`.

MCP uses `inputSchema`, `outputSchema`, `isError`, `structuredContent`.

Questions turn on picking the spelling that matches the layer being described — and both
spellings will be on offer.
:::
