## The brief

An internal assistant works its way around a large codebase and takes over engineering grunt
work, using the built-in tools plus a few MCP servers.

## Tool selection

Most of this scenario is knowing which built-in fits which job — and preferring the specific
tool over `Bash`.

| The task | The tool |
|---|---|
| Find every place `processPayment` is called | **Grep** — searches file contents |
| Find the test files for the auth module | **Glob** — matches file paths |
| Read a specific config file | **Read** |
| Change a timeout value | **Edit** — anchored, and fails loudly if the anchor is missing |
| Create a new migration | **Write** |
| Run the test suite | **Bash** |

::: key-fact Prefer the dedicated tool over Bash
`Grep` over `bash grep`. `Glob` over `bash find`. `Read` over `bash cat`.

They return structured results and — the part the exam cares about — permission rules can limit
them precisely. `Bash` is a far broader grant.
:::

## Why the wrong tool gets picked

::: trap "Claude keeps choosing the wrong tool" is a description problem
The fix is a better tool description — what it does, when to use it, when **not** to, and what
it does not return. Or merging tools that overlap.

It is **not** forcing `tool_choice`, and it is **not** upgrading the model. Description quality
is the single biggest influence on which tool gets picked.
:::

## How many tools

Four to five tools per agent is the sweet spot. Past roughly **18**, accuracy measurably drops.

When an assistant needs more than that, split it into subagents rather than adding to one:

| Subagent | Tools |
|---|---|
| Explorer | `Read`, `Grep`, `Glob` — read-only |
| Editor | `Read`, `Edit`, `Write` |
| Runner | `Bash` |

One change, two benefits: least privilege, and better tool selection.

## MCP integration

Adding GitHub and Postgres servers:

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

Decisions the exam probes:

- **Scope** — team-wide goes in `.mcp.json` (committed, prompts for approval). Personal goes in
  local or user scope in `~/.claude.json`.
- **Precedence** — local > project > user > plugin > connector, and the winning entry applies
  **as a whole**. Fields are not merged. (Permission rules *do* merge — the contrast is the
  point.)
- **Transport** — stdio for a local process, Streamable HTTP for remote with OAuth. `sse` is
  deprecated.
- **Secrets** — use `${VAR}` expansion. Never a literal token in a committed file.
- **Namespacing** — tools arrive as `mcp__github__create_issue`, so two servers can both offer
  a `search`.

## Empty results versus failures

A search tool returning `[]` because nothing matched is a success. Returning `[]` because the
index is down is a failure.

If the tool cannot tell them apart, the assistant will confidently report that a function has
no callers.

## What the exam will ask

- Grep versus Glob versus Bash for a specific job
- How to fix a tool being mis-picked (description, not model)
- What happens as the tool count grows
- Which MCP scope, and how precedence gets resolved
- stdio versus Streamable HTTP
