---
id: d4-builtin-tools
track: d4
order: 4
title: Built-in tools and choosing between them
summary: What each built-in tool is for, and the selection questions the developer-productivity scenario is built on.
minutes: 5
courseChapter: tooling
---

Claude Code comes with a small set of built-in tools. The exam asks which one fits a described
job.

It looks like a dull question. It is really about whether you understand what each one costs.

## The set

| Tool | Does | Reach for it when |
|---|---|---|
| **Grep** | Search file *contents* by pattern (ripgrep-based) | You know roughly what the code says |
| **Glob** | Match file *paths* by pattern | You know roughly what the file is called |
| **Read** | Read a file; handles line ranges, images, PDFs | You have a specific file in mind |
| **Edit** | Change part of a file, anchored on existing text | Changing part of a file |
| **Write** | Create or overwrite a whole file | New file, or full replacement |
| **Bash** | Run a shell command | Nothing above fits |

::: key-fact Prefer the specific tool over Bash
`Grep` beats `bash grep`. `Glob` beats `bash find`. `Read` beats `bash cat`.

The dedicated tools give structured results, are cheaper to interpret, and — this is the part
that matters for permissions — can be limited precisely. `Bash` is a much broader grant, and a
permission rule covering it is a much cruder instrument.
:::

## Edit versus Write

`Edit` needs a text anchor. It finds an exact string and replaces it, and it fails if that
string is missing or appears more than once.

That failure is a feature. It means the edit cannot quietly land in the wrong place.

`Write` replaces the whole file. Use it for new files. Using it for a small change to an
existing file risks throwing away everything the model did not think to type out again.

::: trap Overwriting a file that was never read
Rewriting a file wholesale without having read it first is how content disappears.

This shows up in questions about an agent that "fixed the bug but deleted the rest of the
module".
:::

## Reading the selection question

The developer-productivity scenario keeps using the same few shapes:

| The task | The tool |
|---|---|
| "Find every place `processPayment` is called" | Grep |
| "Find all the test files for the auth module" | Glob |
| "What does the config file say?" | Read |
| "Change the timeout from 30s to 60s" | Edit |
| "Run the test suite" | Bash |
| "Add a new migration file" | Write |

## Give each role only what it needs

The same least-privilege logic from tool design applies to the built-ins.

A subagent whose job is to *find* things needs `Read`, `Grep` and `Glob`. Giving it `Write`,
`Edit` and `Bash` as well makes it more dangerous — and, because more tools means worse
selection, worse at its actual job.

::: exam-tip The read-only search agent
A question describing an agent that explores a codebase and reports back is describing a
read-only tool set.

If an option hands it `Bash` "in case it needs to run something", that is universal tool access
— the anti-pattern — wearing a friendly face.
:::
