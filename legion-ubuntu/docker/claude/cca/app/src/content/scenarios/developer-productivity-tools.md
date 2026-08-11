## The brief

An internal assistant navigates a large codebase and absorbs engineering grunt work, using
the built-in tools plus a few MCP servers.

## Tool selection

Most of this scenario is knowing which built-in fits which job, and preferring the specific
tool over `Bash`.

| The task | The tool |
|---|---|
| Find every call site of `processPayment` | **Grep** — content search |
| Find the test files for the auth module | **Glob** — path matching |
| Read a specific config file | **Read** |
| Change a timeout value | **Edit** — anchored, fails loudly if the anchor is missing |
| Create a new migration | **Write** |
| Run the test suite | **Bash** |

::: key-fact Prefer the dedicated tool over Bash
`Grep` over `bash grep`, `Glob` over `bash find`, `Read` over `bash cat`. They return
structured results and — the part the exam cares about — they can be scoped by permission
rules precisely. `Bash` is a far broader grant.
:::

## Why the wrong tool gets picked

::: trap "Claude keeps choosing the wrong tool" is a description problem
The fix is a better tool description — what it does, when to use it, when **not** to, what it
does not return — or consolidating overlapping tools. It is **not** forcing `tool_choice`,
and it is **not** upgrading the model. Description quality is the single biggest lever on
selection accuracy.
:::

## Tool count

Four to five tools per agent is the sweet spot. Past roughly **18**, selection accuracy
degrades measurably. When an assistant needs more, split it into subagents rather than adding
to one:

| Subagent | Tools |
|---|---|
| Explorer | `Read`, `Grep`, `Glob` — read-only |
| Editor | `Read`, `Edit`, `Write` |
| Runner | `Bash` |

Least privilege and better routing, from the same change.

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

- **Scope** — team-wide goes in `.mcp.json` (committed, prompts for approval). Personal goes
  local or user scope in `~/.claude.json`.
- **Precedence** — local > project > user > plugin > connector, and the winning entry applies
  **whole**. Fields are not merged. (Contrast with permission rules, which *do* merge.)
- **Transport** — stdio for a local process, Streamable HTTP for remote with OAuth. `sse` is
  deprecated.
- **Secrets** — `${VAR}` expansion, never a literal token in a committed file.
- **Namespacing** — tools arrive as `mcp__github__create_issue`, so two servers can both
  expose `search`.

## Empty results versus failures

A search tool returning `[]` because nothing matched is a success. Returning `[]` because the
index is down is a failure. If the tool cannot distinguish them, the assistant will
confidently report that a function has no callers.

## What the exam will ask

- Grep versus Glob versus Bash for a specific job
- How to fix mis-selection (description, not model)
- What happens as the tool count grows
- Which MCP scope, and how precedence resolves
- stdio versus Streamable HTTP
