---
id: d4-mcp-architecture
track: d4
order: 3
title: MCP architecture and primitives
summary: Host, client and server; the three server primitives; and the field-naming difference that catches people out.
minutes: 7
courseChapter: mcp
---

The Model Context Protocol is how tools get to Claude from outside your own application code.
The exam tests the architecture precisely rather than conceptually.

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

The host runs one **client** per connection, and each client maintains a dedicated link to
exactly one **server**. It is built on JSON-RPC 2.0 and split into a data layer (lifecycle,
primitives, notifications) and a transport layer (connection, framing, authorisation).

## The three server primitives

::: key-fact Tools, resources, prompts
- **Tools** — model-invoked actions, called via `tools/call`. The model decides to use them.
- **Resources** — context data, read via `resources/read`. Browsable, read-only content
  catalogues.
- **Prompts** — reusable templates. User- or application-invoked, not model-invoked.
:::

The distinction the exam wants is *who invokes*. A tool is something Claude decides to call. A
resource is data made available to be read. A prompt is a template a person or application
picks.

Clients can expose their own capabilities back to servers: sampling (`sampling/createMessage`),
elicitation (`elicitation/create`) and logging. Discovery across all of them uses `*/list`
methods.

## Transports

| Transport | Locality | Notes |
|---|---|---|
| **stdio** | Local process | Single client, no network, command and args |
| **Streamable HTTP** | Remote | HTTP POST plus optional SSE; bearer, API-key or custom-header auth, OAuth recommended |
| `sse` | — | Deprecated |
| `ws` | Remote | WebSocket, header auth only |

::: exam-tip Anchor on cardinality and locality
stdio is local, one client, no network. Streamable HTTP is remote, many clients, HTTP with
optional SSE. That pair of facts answers most transport questions without needing anything
else.
:::

## Configuration and scope in Claude Code

Add servers with `claude mcp add` (or `add-json`). Three scopes:

| Scope | File | Shared |
|---|---|---|
| **local** (default) | `~/.claude.json` | No — you, this project only |
| **project** | `.mcp.json` at the repo root | **Yes, committed** — prompts for approval |
| **user** | `~/.claude.json` | No — you, all your projects |

::: key-fact MCP scope precedence does not merge
Precedence is **local > project > user > plugin > claude.ai connector**, and the
highest-priority entry wins **whole**. Fields are not merged between scopes. This is
different from permission rules, which do merge — the exam likes putting the two side by side.
:::

Tools are namespaced `mcp__<server>__<tool>`. Manage with `claude mcp list / get / remove`
and the `/mcp` command.

Environment variables expand with `${VAR}` syntax, which is how a committed `.mcp.json`
references secrets without containing them:

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
The Claude API uses `input_schema`, `is_error`, `tool_use_id`. MCP uses `inputSchema`,
`outputSchema`, `isError`, `structuredContent`. Questions hinge on picking the field name
that matches the layer being described, and both spellings will be offered.
:::
