import { defineCards } from './index';

export const d4Cards = defineCards('d4', [
	{
		id: 'd4-c01',
		front: 'The three required tool fields',
		back: '`name` (matching `^[a-zA-Z0-9_-]{1,64}$`), `description`, `input_schema` (with type, properties, required).',
		lesson: 'd4-tool-anatomy'
	},
	{
		id: 'd4-c02',
		front: 'What is "by far the most important factor in tool performance"?',
		back: 'The **description**. Selection depends far more on the prose than on names or schemas.',
		lesson: 'd4-tool-anatomy'
	},
	{
		id: 'd4-c03',
		front: 'What belongs in a good tool description?',
		back: '3–4 sentences: what it does · when to use it AND when not to · what each parameter means · caveats, especially what it does **not** return and how it behaves on empty results.',
		lesson: 'd4-tool-anatomy'
	},
	{
		id: 'd4-c04',
		front: 'Optimal tool count per agent, and the degradation point',
		back: '4–5 is the sweet spot. Selection accuracy degrades noticeably past roughly **18**. Split across subagents rather than adding more.',
		lesson: 'd4-tool-anatomy'
	},
	{
		id: 'd4-c05',
		front: '"Claude keeps calling the wrong tool" — the fix?',
		back: 'A better description, or consolidating/namespacing overlapping tools. **Not** forcing `tool_choice`, and **not** a model upgrade.',
		lesson: 'd4-tool-anatomy'
	},
	{
		id: 'd4-c06',
		front: 'Client tools versus server tools',
		back: 'Client tools (yours, plus bash/text_editor) execute in **your** app; you run the loop. Server tools (`web_search`, `web_fetch`, `code_execution`) execute on Anthropic infrastructure, use versioned type strings, priced separately.',
		lesson: 'd4-tool-anatomy'
	},
	{
		id: 'd4-c07',
		front: 'The two error paths',
		back: 'Tool ran and failed → normal result with `is_error: true` (API) / `isError: true` (MCP). Malformed request → protocol error: 400 (API) or JSON-RPC code like `-32602` (MCP).',
		lesson: 'd4-tool-errors'
	},
	{
		id: 'd4-c08',
		front: 'Which error categories are retryable?',
		back: 'Transient only (timeout, rate limit, service unavailable). NOT retryable: validation, business logic, permission, not-found.',
		lesson: 'd4-tool-errors'
	},
	{
		id: 'd4-c09',
		front: 'Empty result versus failure',
		back: 'An empty result is a **successful** call with a valid answer. A failure must be distinguishable, or Claude confidently reports "no records exist" when the service is down.',
		lesson: 'd4-tool-errors'
	},
	{
		id: 'd4-c10',
		front: 'MCP architecture: host, client, server',
		back: 'The host runs **one client per connection**, each maintaining a dedicated link to **one server**. Built on JSON-RPC 2.0, split into data and transport layers.',
		lesson: 'd4-mcp-architecture'
	},
	{
		id: 'd4-c11',
		front: 'The three MCP server primitives',
		back: '**Tools** (model-invoked actions, `tools/call`) · **Resources** (read-only context data, `resources/read`) · **Prompts** (reusable templates, user/app-invoked). The distinction is who invokes.',
		lesson: 'd4-mcp-architecture'
	},
	{
		id: 'd4-c12',
		front: 'MCP transports',
		back: '**stdio** = local process, single client, no network. **Streamable HTTP** = remote, many clients, POST + optional SSE, OAuth recommended. `sse` deprecated. `ws` header-auth only.',
		lesson: 'd4-mcp-architecture'
	},
	{
		id: 'd4-c13',
		front: 'MCP scopes and precedence',
		back: 'local (`~/.claude.json`, default) > project (`.mcp.json`, committed) > user > plugin > claude.ai connector. Entries are **NOT merged** — the winner applies whole.',
		lesson: 'd4-mcp-architecture'
	},
	{
		id: 'd4-c14',
		front: 'MCP scope precedence versus permission rules',
		back: 'MCP entries do NOT merge (highest wins whole). Permission rules DO merge across every scope. The exam contrasts these deliberately.',
		lesson: 'd4-mcp-architecture'
	},
	{
		id: 'd4-c15',
		front: 'The API/MCP naming trap',
		back: 'Claude API is snake_case: `input_schema`, `is_error`, `tool_use_id`. MCP is camelCase: `inputSchema`, `outputSchema`, `isError`, `structuredContent`.',
		lesson: 'd4-mcp-architecture'
	},
	{
		id: 'd4-c16',
		front: 'How are MCP tools namespaced?',
		back: '`mcp__<server>__<tool>` — so two servers can both expose a `search`.',
		lesson: 'd4-mcp-architecture'
	},
	{
		id: 'd4-c17',
		front: 'Secrets in a committed `.mcp.json`',
		back: 'Environment variable expansion: `"API_KEY": "${API_KEY}"`. Never a literal credential.',
		lesson: 'd4-mcp-architecture'
	},
	{
		id: 'd4-c18',
		front: 'Grep, Glob, Read — which for what?',
		back: 'Grep = search file **contents** (regex). Glob = match file **paths**. Read = a specific file, with line ranges, images, PDFs.',
		lesson: 'd4-builtin-tools'
	},
	{
		id: 'd4-c19',
		front: 'Edit versus Write',
		back: 'Edit needs an exact text **anchor** and fails if it is missing or ambiguous — so it cannot silently apply in the wrong place. Write replaces the whole file.',
		lesson: 'd4-builtin-tools'
	},
	{
		id: 'd4-c20',
		front: 'Why prefer the dedicated tool over Bash?',
		back: 'Structured results, and — critically — they can be scoped precisely by permission rules. `Bash` is a far broader grant.',
		lesson: 'd4-builtin-tools'
	}
]);
