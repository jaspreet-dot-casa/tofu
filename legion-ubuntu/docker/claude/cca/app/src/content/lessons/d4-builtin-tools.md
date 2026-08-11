---
id: d4-builtin-tools
track: d4
order: 4
title: Built-in tools and choosing between them
summary: What each built-in tool is for, and the selection questions the developer-productivity scenario is built on.
minutes: 5
courseChapter: tooling
---

Claude Code ships a small set of built-in tools. The exam asks which one fits a described
job — a mundane-looking question that is really about whether you understand the cost of
each.

## The set

| Tool | Does | Reach for it when |
|---|---|---|
| **Grep** | Search file *contents* by regex (ripgrep-based) | You know roughly what the code says |
| **Glob** | Match file *paths* by pattern | You know roughly what the file is called |
| **Read** | Read a file; supports line ranges, images, PDFs | You have a specific file in mind |
| **Edit** | Targeted modification, anchored on existing text | Changing part of a file |
| **Write** | Create or overwrite a whole file | New file, or full replacement |
| **Bash** | Run a shell command | Nothing above fits |

::: key-fact Prefer the specific tool over Bash
`Grep` beats `bash grep`, `Glob` beats `bash find`, `Read` beats `bash cat`. The dedicated
tools are structured, cheaper to interpret, and — importantly for permissions — they can be
scoped precisely. `Bash` is a much broader grant, and a permission rule covering it is a much
blunter instrument.
:::

## Edit versus Write

`Edit` requires a text anchor: it finds an exact string and replaces it, failing if the
string is not unique or not present. That failure is a feature — it means the edit cannot
silently apply in the wrong place.

`Write` replaces the whole file. Use it for new files. Using it for a small change to an
existing file risks discarding everything the model did not think to reproduce.

::: trap Overwriting a file that was never read
Rewriting a file wholesale without having read it is how content disappears. This shows up in
scenario questions about an agent that "fixed the bug but deleted the rest of the module".
:::

## Reading the selection question

The developer-productivity scenario turns on a few recurring shapes:

| The task | The tool |
|---|---|
| "Find every call site of `processPayment`" | Grep |
| "Find all the test files for the auth module" | Glob |
| "What does the config file say?" | Read |
| "Change the timeout from 30s to 60s" | Edit |
| "Run the test suite" | Bash |
| "Add a new migration file" | Write |

## Scoping tools to roles

The same least-privilege logic from tool design applies to the built-ins. A subagent whose
job is to *find* things needs `Read`, `Grep` and `Glob` — and giving it `Write`, `Edit` and
`Bash` as well makes it both more dangerous and, because of the tool-count effect, worse at
its actual job.

::: exam-tip The read-only search agent
A question describing an agent that explores a codebase and reports findings is describing a
read-only tool set. If an option hands it `Bash` "in case it needs to run something", that is
the anti-pattern — universal tool access — wearing a helpful expression.
:::
