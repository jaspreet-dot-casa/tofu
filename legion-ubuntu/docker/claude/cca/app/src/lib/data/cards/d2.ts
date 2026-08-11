import { defineCards } from './index';

export const d2Cards = defineCards('d2', [
	{
		id: 'd2-c01',
		front: 'Settings precedence, highest first',
		back: 'Managed/enterprise policy → CLI flags → `.claude/settings.local.json` → `.claude/settings.json` → `~/.claude/settings.json`.',
		lesson: 'd2-settings-precedence'
	},
	{
		id: 'd2-c02',
		front: 'The one exception to settings precedence',
		back: 'Permission rules (`allow`/`ask`/`deny`) **merge across all scopes** instead of overriding. A deny anywhere stands.',
		lesson: 'd2-settings-precedence'
	},
	{
		id: 'd2-c03',
		front: 'Protected paths',
		back: '`.git`, `.claude`, `.mcp.json`, `.claude.json`, shell rc files. Never auto-approved except under `bypassPermissions`; `allow` rules cannot pre-approve them.',
		lesson: 'd2-settings-precedence'
	},
	{
		id: 'd2-c04',
		front: 'What still applies even in `bypassPermissions`?',
		back: '`deny` rules and explicit `ask` rules. The escape hatch is not total.',
		lesson: 'd2-permission-modes'
	},
	{
		id: 'd2-c05',
		front: 'Where do team standards go?',
		back: 'Project-level `CLAUDE.md` (or `.claude/CLAUDE.md`) — because it is **committed**. User-level files are never shared.',
		lesson: 'd2-claude-md'
	},
	{
		id: 'd2-c06',
		front: 'Is CLAUDE.md enforcement?',
		back: 'No. It is author-written guidance loaded as a user message. Claude can ignore it. For guarantees use hooks or permission rules.',
		lesson: 'd2-claude-md'
	},
	{
		id: 'd2-c07',
		front: 'CLAUDE.md versus auto memory',
		back: 'CLAUDE.md = you write it, loaded every session. Auto memory = Claude writes it per repo under `~/.claude/projects/<project>/memory/`, index + on-demand topic files.',
		lesson: 'd2-claude-md'
	},
	{
		id: 'd2-c08',
		front: 'Hook exit codes',
		back: '**0** = success, stdout parsed as JSON. **2** = BLOCKS, stderr fed to Claude. **Any other non-zero (incl. 1)** = non-blocking error, execution continues.',
		lesson: 'd2-hooks'
	},
	{
		id: 'd2-c09',
		front: 'What can a PreToolUse hook return on exit 0?',
		back: '`hookSpecificOutput.permissionDecision` — `allow`/`deny`/`ask`/`defer` — and `updatedInput` to rewrite the tool call before it runs.',
		lesson: 'd2-hooks'
	},
	{
		id: 'd2-c10',
		front: 'Name the hook lifecycle events',
		back: '`PreToolUse`, `PostToolUse`, `UserPromptSubmit`, `Stop`, `SubagentStop`, `SessionStart`/`SessionEnd`, `PreCompact`, `Notification`.',
		lesson: 'd2-hooks'
	},
	{
		id: 'd2-c11',
		front: 'Which hook fires before summarisation, so state can be saved?',
		back: '`PreCompact`. Compaction is lossy by construction.',
		lesson: 'd2-hooks'
	},
	{
		id: 'd2-c12',
		front: 'The six permission modes',
		back: '`default` (reads only) · `acceptEdits` · `plan` · `auto` (classifier-gated) · `dontAsk` (**denies**, for CI) · `bypassPermissions` (isolated containers).',
		lesson: 'd2-permission-modes'
	},
	{
		id: 'd2-c13',
		front: 'Why is `dontAsk` the CI mode?',
		back: 'It fails closed — only pre-approved allow rules and read-only commands are permitted, everything else is **denied** rather than prompted. Nothing hangs.',
		lesson: 'd2-permission-modes'
	},
	{
		id: 'd2-c14',
		front: 'When is plan mode worth it?',
		back: 'Multi-file changes · several defensible approaches · unfamiliar codebase · cross-cutting refactor. Skip it for a single-file fix with a clear stack trace.',
		lesson: 'd2-permission-modes'
	},
	{
		id: 'd2-c15',
		front: 'Essential headless CI flags',
		back: '`-p` (non-interactive) · `--output-format json` · `--json-schema` · `--allowedTools` · `--permission-mode dontAsk` · `--max-turns` · `--bare`.',
		lesson: 'd2-headless-ci'
	},
	{
		id: 'd2-c16',
		front: 'What does `--bare` do?',
		back: 'Skips auto-discovery of hooks, skills, plugins, MCP, auto memory and CLAUDE.md. The reproducibility flag — the run depends only on what you passed.',
		lesson: 'd2-headless-ci'
	},
	{
		id: 'd2-c17',
		front: 'Skill versus command with the same name',
		back: 'The **skill** wins. Both `.claude/commands/x.md` and `.claude/skills/x/SKILL.md` create `/x`.',
		lesson: 'd2-skills-and-commands'
	},
	{
		id: 'd2-c18',
		front: 'What does `context: fork` do in skill frontmatter?',
		back: 'Runs the skill in an isolated subagent so verbose intermediate output never enters the main context. Only the result returns.',
		lesson: 'd2-skills-and-commands'
	},
	{
		id: 'd2-c19',
		front: 'Interpolation available in a command/skill body',
		back: '`$ARGUMENTS`, `$ARGUMENTS[N]`/`$N` (0-based), `` !`cmd` `` for shell output injection, `@file` for file contents, `${CLAUDE_SKILL_DIR}`.',
		lesson: 'd2-skills-and-commands'
	},
	{
		id: 'd2-c20',
		front: 'Where do path-scoped rules live, and why?',
		back: '`.claude/rules/` with `paths` glob frontmatter. They load only when matching files are edited — context economy, since top-level CLAUDE.md loads on **every** request.',
		lesson: 'd2-claude-md'
	}
]);
