import { defineQuestions } from './types';

export const devtools = defineQuestions('devtools', [
	{
		id: 'dev-01',
		domain: 'd4',
		lesson: 'd4-builtin-tools',
		stem: 'The assistant must find every call site of processPayment across a large repository. Which tool?',
		options: [
			{ text: 'Grep — regex search over file contents.', why: 'Correct. You know what the code says, not where it lives.' },
			{ text: 'Glob — pattern matching over file paths.', why: 'Wrong. Glob matches names and paths, not contents.' },
			{ text: 'Read, over each file in turn.', why: 'Wrong. Enormously wasteful, and it will not scale past a small repo.' },
			{ text: 'Bash running grep.', why: 'Works, but the dedicated tool returns structured results and can be scoped by permission rules precisely. Bash is a far broader grant.' }
		],
		answer: 0,
		explanation:
			'Grep for contents, Glob for paths, Read for a known file. Prefer the dedicated tool over Bash — it is structured and it is scopable.'
	},
	{
		id: 'dev-02',
		domain: 'd4',
		lesson: 'd4-tool-anatomy',
		stem: 'The assistant frequently calls the wrong MCP tool when two servers expose similar capabilities. What is the intended fix?',
		options: [
			{
				text: 'Improve the tool descriptions with explicit boundary statements naming the alternative tool.',
				why: 'Correct. Descriptions are the primary routing mechanism.'
			},
			{
				text: 'Force tool_choice to the correct tool.',
				why: 'Wrong. Forcing removes selection entirely and breaks every case that needs the other tool.'
			},
			{
				text: 'Switch to a more capable model.',
				why: 'Wrong. A better model cannot infer intent that was never written down.'
			},
			{
				text: 'Disable one of the MCP servers.',
				why: 'A blunt workaround that removes capability instead of disambiguating it.'
			}
		],
		answer: 0,
		explanation:
			'Tool-selection accuracy depends far more on the description prose than on names or schemas. Three to four sentences: what it does, when to use it, when NOT to, and what it does not return.'
	},
	{
		id: 'dev-03',
		domain: 'd4',
		lesson: 'd4-mcp-architecture',
		stem: 'A team-wide MCP server should be available to everyone who clones the repository. Which scope?',
		options: [
			{
				text: 'Project scope — .mcp.json at the repository root, committed.',
				why: 'Correct. It is the shared, version-controlled scope, and it prompts for approval on first use.'
			},
			{
				text: 'Local scope in ~/.claude.json.',
				why: 'Wrong. Private to one person and one project.'
			},
			{
				text: 'User scope in ~/.claude.json.',
				why: 'Wrong. Applies to all of one person\'s projects, and is still not shared with the team.'
			},
			{
				text: 'A plugin.',
				why: 'Possible in principle, but plugin scope sits below the others in precedence and is not the documented answer for repository-shared servers.'
			}
		],
		answer: 0,
		explanation:
			'MCP scopes: local (default, private), project (.mcp.json, committed, shared), user (all your projects). Precedence is local > project > user > plugin > connector.'
	},
	{
		id: 'dev-04',
		domain: 'd4',
		lesson: 'd4-mcp-architecture',
		stem: 'The same server name appears at local and project scope with different configurations. What happens?',
		options: [
			{
				text: 'The local entry wins entirely — MCP entries are not merged field by field.',
				why: 'Correct. The highest-priority entry applies whole.'
			},
			{
				text: 'The two configurations merge, with local fields overriding project fields.',
				why: 'Wrong. That is how permission rules behave, not MCP entries — the exam deliberately contrasts them.'
			},
			{
				text: 'Project wins because it is version controlled.',
				why: 'Wrong. Local is higher precedence than project for MCP servers.'
			},
			{
				text: 'A configuration error is raised.',
				why: 'Wrong. The collision resolves silently by precedence.'
			}
		],
		answer: 0,
		explanation:
			'MCP precedence does not merge — contrast with permission rules, which merge across every scope. Knowing both behaviours and which applies where is the examinable point.'
	},
	{
		id: 'dev-05',
		domain: 'd4',
		lesson: 'd4-mcp-architecture',
		stem: 'A local MCP server runs as a subprocess on the developer\'s machine. Which transport?',
		options: [
			{ text: 'stdio.', why: 'Correct — local process I/O, one client, no network.' },
			{ text: 'Streamable HTTP.', why: 'Wrong. That is for remote servers with many clients.' },
			{ text: 'SSE.', why: 'Wrong, and deprecated.' },
			{ text: 'WebSocket.', why: 'Wrong. Remote, header auth only, and not the local-process transport.' }
		],
		answer: 0,
		explanation:
			'Anchor on locality and cardinality: stdio is local, single client, no network. Streamable HTTP is remote, many clients, HTTP POST with optional SSE and OAuth.'
	},
	{
		id: 'dev-06',
		domain: 'd4',
		lesson: 'd4-mcp-architecture',
		stem: 'A committed .mcp.json needs a GitHub token. How is it referenced?',
		options: [
			{
				text: 'Environment variable expansion: "GITHUB_TOKEN": "${GITHUB_TOKEN}".',
				why: 'Correct. The file can be committed without containing the secret.'
			},
			{
				text: 'The literal token value, since .mcp.json is gitignored.',
				why: 'Wrong. Project-scope .mcp.json is committed by design.'
			},
			{
				text: 'A path to a secrets file readable at startup.',
				why: 'Not the documented mechanism; ${VAR} expansion is.'
			},
			{
				text: 'Tokens cannot be used with project-scope servers.',
				why: 'Wrong. That is exactly what variable expansion enables.'
			}
		],
		answer: 0,
		explanation:
			'${VAR} expansion is how a committed configuration references a secret it does not contain. Never commit raw credentials.'
	},
	{
		id: 'dev-07',
		domain: 'd4',
		lesson: 'd4-mcp-architecture',
		stem: 'Which MCP primitive is a read-only catalogue of context data rather than an action Claude invokes?',
		options: [
			{ text: 'Resources.', why: 'Correct — browsable read-only content, read via resources/read.' },
			{ text: 'Tools.', why: 'Wrong. Tools are model-invoked actions called via tools/call.' },
			{ text: 'Prompts.', why: 'Wrong. Prompts are reusable templates, user- or application-invoked.' },
			{ text: 'Sampling.', why: 'Wrong. Sampling is a client capability exposed back to servers, not a server primitive.' }
		],
		answer: 0,
		explanation:
			'The three server primitives are tools (model-invoked actions), resources (read-only context data) and prompts (templates). The distinction the exam wants is who invokes.'
	},
	{
		id: 'dev-08',
		domain: 'd4',
		lesson: 'd4-builtin-tools',
		stem: 'The assistant needs to change one timeout value inside a large existing config file. Which tool?',
		options: [
			{
				text: 'Edit — anchored replacement that fails loudly if the anchor is missing or ambiguous.',
				why: 'Correct, and the failure mode is a feature.'
			},
			{
				text: 'Write, reconstructing the file with the new value.',
				why: 'Wrong. Rewriting a large file risks silently dropping everything the model did not reproduce.'
			},
			{
				text: 'Bash with sed.',
				why: 'Works, but it is a much broader permission grant than a scoped Edit and is harder to review.'
			},
			{
				text: 'Read then Write.',
				why: 'Still a full-file overwrite, with the same risk of dropping content.'
			}
		],
		answer: 0,
		explanation:
			'Edit requires an exact text anchor and fails if it is not unique or not present — the edit cannot silently apply in the wrong place. Write is for new files or genuine full replacements.'
	},
	{
		id: 'dev-09',
		domain: 'd4',
		lesson: 'd4-tool-scoping',
		stem: 'A read-only exploration subagent is being defined. Which tool set is appropriate?',
		options: [
			{ text: 'Read, Grep, Glob.', why: 'Correct. Everything needed to explore, nothing that mutates.' },
			{
				text: 'Read, Grep, Glob, Bash — in case it needs to run something.',
				why: 'Wrong. "In case" is how universal tool access creeps in; Bash makes a read-only agent capable of anything.'
			},
			{ text: 'All available tools, for flexibility.', why: 'Wrong. Degrades routing accuracy and widens blast radius.' },
			{ text: 'Read only.', why: 'Too narrow — it could not locate anything without Grep or Glob.' }
		],
		answer: 0,
		explanation:
			'Scope tools to the role. Four to five per agent is the sweet spot, and least privilege falls out of the same decision.'
	},
	{
		id: 'dev-10',
		domain: 'd4',
		lesson: 'd4-tool-errors',
		stem: 'An MCP tool is called with an argument that is not in its input schema. How does that surface?',
		options: [
			{
				text: 'As a JSON-RPC protocol error with a numeric code such as -32602.',
				why: 'Correct. A malformed request is a protocol error, not a tool result.'
			},
			{
				text: 'As a normal result with isError: true.',
				why: 'Wrong. That is for a tool that ran and failed, which the model can react to.'
			},
			{
				text: 'As a 429 from the Claude API.',
				why: 'Wrong. 429 is rate limiting and unrelated.'
			},
			{
				text: 'The argument is silently dropped.',
				why: 'Wrong. Schema violations are reported, not ignored.'
			}
		],
		answer: 0,
		explanation:
			'Two error paths: a tool that ran and failed returns a normal result with isError true, so the model can react. A malformed request is a protocol-level error for your code to fix.'
	},
	{
		id: 'dev-11',
		domain: 'd1',
		lesson: 'd1-subagent-isolation',
		stem: 'The assistant needs to summarise twenty files, and the coordinator context keeps overflowing. Best approach?',
		options: [
			{
				text: 'Spawn a subagent per file; each returns a focused summary and the coordinator synthesises twenty summaries.',
				why: 'Correct. Twenty isolated windows instead of one overloaded one.'
			},
			{
				text: 'Move to a 1M-token context model and read all twenty in one pass.',
				why: 'Wrong. Capacity is not attention — the middle files will be the ones that get missed.'
			},
			{
				text: 'Concatenate the files and ask for one summary.',
				why: 'Wrong. Worst of both — maximum context pressure and maximum lost-in-the-middle.'
			},
			{
				text: 'Compact the conversation between each file read.',
				why: 'Lossy and unnecessary; the files are independent, so isolation is cleaner than summarising the coordinator\'s own history.'
			}
		],
		answer: 0,
		explanation:
			'Subagent offloading is the context strategy that falls out of the isolation principle: less context per agent means more focused and more reliable.'
	},
	{
		id: 'dev-12',
		domain: 'd4',
		lesson: 'd4-tool-anatomy',
		stem: 'How many tools should a single agent typically have before selection accuracy becomes a concern?',
		options: [
			{
				text: 'Four to five is the sweet spot; accuracy degrades noticeably past roughly 18.',
				why: 'Correct.'
			},
			{ text: 'Up to 50, since selection is schema-driven.', why: 'Wrong. Selection is description-driven and degrades well before that.' },
			{ text: 'Exactly 10, as a hard platform limit.', why: 'Wrong. There is no such platform limit; the effect is gradual.' },
			{ text: 'There is no practical limit.', why: 'Wrong — this is precisely the universal-tool-access anti-pattern.' }
		],
		answer: 0,
		explanation:
			'Four to five per agent, degrading past roughly 18. When more are needed, split across subagents rather than adding to one.'
	},
	{
		id: 'dev-13',
		domain: 'd4',
		lesson: 'd4-tool-errors',
		stem: 'A code-search tool returns an empty array when its index is rebuilding. What must change?',
		options: [
			{
				text: 'Distinguish the two cases explicitly — an index failure returns isError with a category and retryability; a genuine no-match returns an empty success.',
				why: 'Correct.'
			},
			{
				text: 'Have the tool retry internally until the index is ready.',
				why: 'Hides the condition and can block for an unbounded time; the caller loses the ability to decide.'
			},
			{
				text: 'Return null instead of an empty array.',
				why: 'Still ambiguous — it just moves the same conflation to a different value.'
			},
			{
				text: 'Nothing; the assistant will infer the index is rebuilding from context.',
				why: 'Wrong. It has no signal to infer from, and will report that the symbol has no call sites.'
			}
		],
		answer: 0,
		explanation:
			'A valid empty result and an access failure must be distinguishable, both in the return value and in the tool description. Otherwise a failure is reported as a confident fact.'
	},
	{
		id: 'dev-14',
		domain: 'd2',
		lesson: 'd2-permission-modes',
		stem: 'The assistant should read freely but require approval before any file modification. Which mode?',
		options: [
			{ text: 'default — reads only, everything else prompts.', why: 'Correct, and it matches the requirement exactly.' },
			{ text: 'acceptEdits.', why: 'Wrong. It auto-approves file edits, which is the opposite of the requirement.' },
			{ text: 'dontAsk.', why: 'Wrong. It denies rather than prompting, so approval is never possible.' },
			{ text: 'plan.', why: 'Close, but plan mode gates on an up-front plan rather than approving individual modifications.' }
		],
		answer: 0,
		explanation:
			'default permits reads and prompts for everything else. dontAsk fails closed and is for CI; acceptEdits auto-approves edits; plan mode gates on an approved plan.'
	},
	{
		id: 'dev-15',
		domain: 'd4',
		lesson: 'd4-tool-scoping',
		stem: 'A single manage_repository tool takes an action parameter switching between search, read, edit, commit and push. What is wrong with this?',
		options: [
			{
				text: 'Its description cannot honestly say when to use it, and permissions cannot distinguish a read from a push.',
				why: 'Correct. The boundary is too coarse on both the selection and the safety axis.'
			},
			{
				text: 'Nothing — consolidating tools improves selection accuracy.',
				why: 'Wrong. Consolidation helps only where tools genuinely overlap; this bundles unrelated operations.'
			},
			{
				text: 'Tools cannot take enum parameters.',
				why: 'Wrong. Enums are perfectly valid in an input schema.'
			},
			{
				text: 'It exceeds the tool-count limit on its own.',
				why: 'Wrong — it is one tool. The problem is what it contains, not how many there are.'
			}
		],
		answer: 0,
		explanation:
			'The description test: if you cannot write a clear three-sentence description of when to use a tool and when not to, the boundary is wrong. Here it also collapses read and write into one permission grant.'
	},
	{
		id: 'dev-16',
		domain: 'd4',
		lesson: 'd4-tool-anatomy',
		stem: 'Which is a server tool rather than a client tool?',
		options: [
			{
				text: 'web_search — it executes on Anthropic infrastructure and returns results directly.',
				why: 'Correct, and it carries its own usage-based pricing.'
			},
			{ text: 'A custom search_orders tool you defined.', why: 'Client tool — it runs in your application and you run the loop.' },
			{ text: 'The bash tool.', why: 'Client tool — an Anthropic-schema tool that still executes in your environment.' },
			{ text: 'The text_editor tool.', why: 'Client tool, same reasoning.' }
		],
		answer: 0,
		explanation:
			'Server tools — web_search, web_fetch, code_execution — execute on Anthropic infrastructure, use versioned type strings, and are priced separately. Client tools execute in your application.'
	}
]);
