import { defineQuestions } from './types';

export const codeGen = defineQuestions('code-gen', [
	{
		id: 'cg-01',
		domain: 'd2',
		lesson: 'd2-claude-md',
		stem: 'Every engineer on the team should follow the same test-running convention. Where does it belong?',
		options: [
			{
				text: 'The project-level CLAUDE.md, committed to the repository.',
				why: 'Correct. Committed means everyone gets it on checkout.'
			},
			{
				text: 'Each engineer\'s ~/.claude/CLAUDE.md.',
				why: 'Wrong. User-level files are not shared and are not in version control — the convention would drift immediately.'
			},
			{
				text: 'CLAUDE.local.md in the repo root.',
				why: 'Wrong. Local files are gitignored by design; they are for personal overrides.'
			},
			{
				text: 'A comment at the top of the test runner script.',
				why: 'Wrong. Claude does not load arbitrary source comments as instructions.'
			}
		],
		answer: 0,
		explanation:
			'The commit test: "should the whole team get this?" is the same question as "is this file in version control?". Team standards go in the project file.'
	},
	{
		id: 'cg-02',
		domain: 'd2',
		lesson: 'd2-hooks',
		stem: 'The team requires that the formatter run after every file edit, without exception. What implements this?',
		options: [
			{
				text: 'A PostToolUse hook matching Edit that runs the formatter.',
				why: 'Correct. Hooks are the only mechanism that guarantees an action happens.'
			},
			{
				text: 'A line in CLAUDE.md instructing Claude to always run the formatter after editing.',
				why: 'Wrong. CLAUDE.md is guidance loaded as a user message — Claude can ignore it, and "without exception" is a guarantee.'
			},
			{
				text: 'A permissions.deny rule on unformatted files.',
				why: 'Wrong. Permission rules block actions; they cannot cause an additional action to occur.'
			},
			{
				text: 'A few-shot example showing the formatter being run after an edit.',
				why: 'Wrong. Examples shape output distribution; they do not enforce compliance.'
			}
		],
		answer: 0,
		explanation:
			'The determinism test: if silent failure is possible and would matter, the requirement needs programmatic enforcement. Hooks guarantee something happens; permission rules guarantee something cannot.'
	},
	{
		id: 'cg-03',
		domain: 'd2',
		lesson: 'd2-hooks',
		stem: 'A PreToolUse validation hook is written to exit 1 when it detects a dangerous command. In testing, the command still runs. Why?',
		options: [
			{
				text: 'Only exit code 2 blocks. Any other non-zero code, including 1, is a non-blocking error.',
				why: 'Correct, and genuinely counter-intuitive coming from shell scripting.'
			},
			{
				text: 'PreToolUse hooks cannot block; only permission rules can.',
				why: 'Wrong. PreToolUse can block with exit 2, and can also return a permissionDecision of deny.'
			},
			{
				text: 'The hook needs to write its decision to stdout as JSON on exit 1.',
				why: 'Wrong. JSON output is parsed on exit 0; on exit 2 it is skipped in favour of stderr.'
			},
			{
				text: 'The matcher field was probably wrong.',
				why: 'Possible in general, but the scenario says the hook detected the command — so it ran and matched.'
			}
		],
		answer: 0,
		explanation:
			'Hook exit codes: 0 succeeds and stdout is parsed as JSON for structured control; 2 blocks and stderr is fed back to Claude; anything else is a non-blocking error and execution continues.'
	},
	{
		id: 'cg-04',
		domain: 'd2',
		lesson: 'd2-settings-precedence',
		stem: 'A project settings.json allows Bash(git push *), but pushes are still being blocked. What is the most likely cause?',
		options: [
			{
				text: 'A deny rule at another scope — permission rules merge across all scopes rather than overriding.',
				why: 'Correct. This is the documented exception to normal settings precedence.'
			},
			{
				text: 'Project settings are lower priority than user settings.',
				why: 'Wrong. Project sits above user in the normal ordering — but for permissions the ordering is not what applies.'
			},
			{
				text: 'Bash rules require the full command with no wildcard.',
				why: 'Wrong. Prefix matching with a trailing wildcard is the documented syntax.'
			},
			{
				text: 'settings.json cannot contain permission rules; they belong in settings.local.json.',
				why: 'Wrong. Permission rules are valid at every scope.'
			}
		],
		answer: 0,
		explanation:
			'Settings normally override highest-to-lowest. Permission rules are the exception: they merge across every scope, and a deny anywhere stands. That is deliberate — a safety mechanism you could drop by adding a more specific file would be worthless.'
	},
	{
		id: 'cg-05',
		domain: 'd2',
		lesson: 'd2-permission-modes',
		stem: 'An engineer is starting a large refactor across a dozen files in an unfamiliar service. Which mode is most appropriate?',
		options: [
			{
				text: 'Plan mode — research read-only, then approve an approach before anything is written.',
				why: 'Correct. Multi-file, unfamiliar, several defensible approaches: the cost of taking the wrong one is high.'
			},
			{
				text: 'acceptEdits, to avoid interruptions.',
				why: 'Wrong. It removes the checkpoint precisely where a wrong approach is most expensive to unwind.'
			},
			{
				text: 'bypassPermissions, since the engineer is supervising.',
				why: 'Wrong. That is for isolated containers, and supervision is not the same as a plan.'
			},
			{
				text: 'default mode, so every action prompts.',
				why: 'Not wrong exactly, but it gives per-action friction without the up-front design review that is actually needed.'
			}
		],
		answer: 0,
		explanation:
			'Plan mode is for multi-file changes, unfamiliar codebases, cross-cutting refactors and situations with several defensible approaches. Direct execution is for single-file fixes with a clear cause.'
	},
	{
		id: 'cg-06',
		domain: 'd2',
		lesson: 'd2-settings-precedence',
		stem: 'An allow rule is added for Read(./.claude/settings.json), but access is still refused. Why?',
		options: [
			{
				text: '.claude is a protected path, and allow rules cannot pre-approve protected paths.',
				why: 'Correct. Only bypassPermissions skips those checks.'
			},
			{
				text: 'Read rules require an absolute path.',
				why: 'Wrong. Relative paths are the normal form in permission rules.'
			},
			{
				text: 'The rule needs to be in settings.local.json to take effect.',
				why: 'Wrong. Scope does not change the protected-path behaviour.'
			},
			{
				text: 'Reading settings files requires the Bash tool.',
				why: 'Wrong, and it would be equally blocked.'
			}
		],
		answer: 0,
		explanation:
			'Protected paths — .git, .claude, .mcp.json, .claude.json, shell rc files — are never auto-approved except under bypassPermissions. They are exactly the files that could be edited to disarm the permission system.'
	},
	{
		id: 'cg-07',
		domain: 'd2',
		lesson: 'd2-claude-md',
		stem: 'Validation rules should apply only when editing files under src/api/. Where do they belong?',
		options: [
			{
				text: '.claude/rules/ with a paths glob in the YAML frontmatter.',
				why: 'Correct. Path-scoped rules load only when matching files are being edited.'
			},
			{
				text: 'The top-level CLAUDE.md, with a note saying they apply to the API directory.',
				why: 'Wrong. That loads on every request, paying context rent on files it does not concern.'
			},
			{
				text: 'A hook matching the Edit tool.',
				why: 'Overkill for guidance. Hooks are for guarantees; this is a convention.'
			},
			{
				text: 'A permissions.ask rule on src/api/**.',
				why: 'Wrong. Permission rules gate access; they do not convey coding conventions.'
			}
		],
		answer: 0,
		explanation:
			'Path-scoped rules exist for context economy as much as tidiness. Everything in the top-level CLAUDE.md loads on every single request.'
	},
	{
		id: 'cg-08',
		domain: 'd2',
		lesson: 'd2-skills-and-commands',
		stem: 'A repository has both .claude/commands/deploy.md and .claude/skills/deploy/SKILL.md. What happens when someone types /deploy?',
		options: [
			{
				text: 'The skill runs — when a skill and a command share a name, the skill wins.',
				why: 'Correct.'
			},
			{
				text: 'The command runs, since commands are the older and more specific mechanism.',
				why: 'Wrong. The precedence goes the other way.'
			},
			{
				text: 'An error is raised for the duplicate name.',
				why: 'Wrong. The collision is resolved silently by precedence.'
			},
			{
				text: 'Both run in sequence.',
				why: 'Wrong. Only one handler is invoked.'
			}
		],
		answer: 0,
		explanation:
			'Custom commands and skills have been merged, and both create a slash command of the same name. Where they collide, the skill takes precedence.'
	},
	{
		id: 'cg-09',
		domain: 'd1',
		lesson: 'd1-subagent-isolation',
		stem: 'A code-review subagent is defined but Claude never delegates to it. Most likely cause?',
		options: [
			{
				text: 'Its description is too vague for Claude to match against, or the Agent tool is not in allowedTools.',
				why: 'Correct — those are the two mechanisms that govern delegation.'
			},
			{
				text: 'Subagents must be defined at user level to be discoverable.',
				why: 'Wrong. Project-level .claude/agents/ is discoverable and in fact higher precedence than user level.'
			},
			{
				text: 'The subagent needs an explicit model field.',
				why: 'Wrong. model defaults to inheriting the parent\'s.'
			},
			{
				text: 'Subagents can only be invoked by an explicit slash command.',
				why: 'Wrong. Claude delegates on its own based on the description — that is the point of the mechanism.'
			}
		],
		answer: 0,
		explanation:
			'description is what Claude matches on when deciding whether to delegate, exactly as with tools. And the Agent tool must be in allowedTools for delegation to be auto-approved.'
	},
	{
		id: 'cg-10',
		domain: 'd2',
		lesson: 'd2-skills-and-commands',
		stem: 'A custom review skill produces a lot of verbose intermediate output that clutters the main conversation. Which frontmatter option addresses this?',
		options: [
			{
				text: 'context: fork — run the skill in an isolated subagent and return only its result.',
				why: 'Correct. That is exactly what the option is for.'
			},
			{
				text: 'allowed-tools, to reduce what the skill can do.',
				why: 'Wrong. It limits capability, not output verbosity.'
			},
			{
				text: 'model: haiku, to produce shorter output.',
				why: 'Wrong. A smaller model is not a context-isolation mechanism.'
			},
			{
				text: 'paths, to scope the skill to fewer files.',
				why: 'Wrong. Scoping when it loads does not change what it emits when it runs.'
			}
		],
		answer: 0,
		explanation:
			'context: fork runs a skill in an isolated subagent so intermediate output never enters the main context. Only the final result returns — the isolation principle applied to skills.'
	},
	{
		id: 'cg-11',
		domain: 'd3',
		lesson: 'd3-explicit-criteria',
		stem: 'A review skill is told to "flag anything concerning". It produces wildly variable output. Best fix?',
		options: [
			{
				text: 'Replace it with numbered, testable criteria and explicit boundary statements.',
				why: 'Correct. Each criterion should be checkable against any given finding.'
			},
			{
				text: 'Add "be thorough but not pedantic".',
				why: 'Wrong. Two vague instructions instead of one.'
			},
			{
				text: 'Run the review three times and take the union.',
				why: 'Wrong. Aggregating an underspecified review just produces more of the same variance.'
			},
			{
				text: 'Increase the effort parameter.',
				why: 'Wrong. More reasoning against an undefined target does not converge on a target.'
			}
		],
		answer: 0,
		explanation:
			'Every criterion must be testable. "Flag issues of severity high or above with direct security impact" is checkable; "anything concerning" is a mood.'
	},
	{
		id: 'cg-12',
		domain: 'd2',
		lesson: 'd2-claude-md',
		stem: 'What is the difference between CLAUDE.md and auto memory?',
		options: [
			{
				text: 'CLAUDE.md is author-written project instruction loaded every session; auto memory is what Claude writes to itself per repository.',
				why: 'Correct.'
			},
			{
				text: 'They are the same mechanism with different file names.',
				why: 'Wrong. Different authors, different lifecycles, different load behaviour.'
			},
			{
				text: 'Auto memory is enforced configuration; CLAUDE.md is guidance.',
				why: 'Wrong. Neither is enforcement — both are context, and both can be ignored.'
			},
			{
				text: 'CLAUDE.md is loaded on demand; auto memory is always loaded in full.',
				why: 'Backwards. CLAUDE.md loads every session; auto memory loads an index with topic files pulled on demand.'
			}
		],
		answer: 0,
		explanation:
			'One is your instructions to Claude, the other is Claude\'s notes to itself. Auto memory lives under ~/.claude/projects/<project>/memory/ with MEMORY.md as the index.'
	},
	{
		id: 'cg-13',
		domain: 'd1',
		lesson: 'd1-workflows-vs-agents',
		stem: 'A team automates a fixed four-step release checklist that runs identically every time. Which design is correct?',
		options: [
			{
				text: 'A workflow — predefined code paths through the four steps, with a checkpoint between each.',
				why: 'Correct. Known, fixed, sequential steps.'
			},
			{
				text: 'An agent that decides how to run the release each time.',
				why: 'Wrong. Dynamic self-direction buys nothing when the steps never change, and costs predictability, latency and money.'
			},
			{
				text: 'A coordinator with four specialised subagents.',
				why: 'Wrong. Multi-agent for a sequential, well-understood task is the over-engineering the start-simple rule targets.'
			},
			{
				text: 'An evaluator-optimiser loop over the release output.',
				why: 'Wrong. Nothing here needs iterative refinement against quality criteria.'
			}
		],
		answer: 0,
		explanation:
			'A workflow orchestrates through predefined code paths; a system is an agent when the model dynamically directs its own process. Use the least autonomous solution that solves the problem.'
	},
	{
		id: 'cg-14',
		domain: 'd2',
		lesson: 'd2-permission-modes',
		stem: 'Which statement about bypassPermissions is accurate?',
		options: [
			{
				text: 'It skips permission checks, but explicit deny and ask rules still apply.',
				why: 'Correct — the escape hatch is not total.'
			},
			{
				text: 'It disables every rule including deny.',
				why: 'Wrong. Deny rules and explicit ask rules survive it.'
			},
			{
				text: 'It is the recommended default for CI pipelines.',
				why: 'Wrong. dontAsk with an explicit allowlist is the CI answer; bypass is for isolated containers.'
			},
			{
				text: 'It requires managed policy to enable.',
				why: 'Wrong. It is a mode, not a privileged setting — which is precisely why the guidance around it matters.'
			}
		],
		answer: 0,
		explanation:
			'bypassPermissions skips the checks and is intended for isolated containers and disposable VMs. Deny rules, explicit ask rules and protected paths still constrain it.'
	},
	{
		id: 'cg-15',
		domain: 'd3',
		lesson: 'd3-multi-pass-review',
		stem: 'A generation step and a review step run in the same session, and the reviewer consistently misses the generator\'s mistakes. Why?',
		options: [
			{
				text: 'Generator bias — the reviewer retains the reasoning that produced the mistake, so the flawed step looks correct.',
				why: 'Correct.'
			},
			{
				text: 'The context window is too small for both steps.',
				why: 'Wrong. Capacity is not the issue; shared reasoning context is.'
			},
			{
				text: 'The review prompt needs to be more forceful.',
				why: 'Wrong. Emphasis does not remove the bias built into shared context.'
			},
			{
				text: 'Reviews require a more capable model than generation.',
				why: 'Wrong. An independent instance of the same model catches what a self-review does not.'
			}
		],
		answer: 0,
		explanation:
			'Independent review means a separate session without the generator\'s context. "Ask Claude to double-check its answer" catches formatting slips and little else.'
	},
	{
		id: 'cg-16',
		domain: 'd2',
		lesson: 'd2-skills-and-commands',
		stem: 'In a custom command body, what does !`git diff --staged` do?',
		options: [
			{
				text: 'Executes the command and injects its output into the prompt each time the command is invoked.',
				why: 'Correct — which is powerful for review commands and costly for anything expensive or side-effecting.'
			},
			{
				text: 'Instructs Claude to run the command using the Bash tool.',
				why: 'Wrong. The output is injected at load time; no tool call is involved.'
			},
			{
				text: 'Escapes the string so it is treated as literal text.',
				why: 'Wrong — that is the opposite of what the syntax does.'
			},
			{
				text: 'Declares the command as an allowed tool for this skill.',
				why: 'Wrong. Tool permissions come from the allowed-tools frontmatter field.'
			}
		],
		answer: 0,
		explanation:
			'Command and skill bodies support !`shell` for output injection, @file for file contents, $ARGUMENTS with indexed access, and ${CLAUDE_SKILL_DIR} for bundled assets.'
	}
]);
