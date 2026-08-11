---
id: orientation-roadmap
track: orientation
order: 2
title: The preparation roadmap
summary: The official learning path in order, what each step is actually for, and where most people waste their time.
minutes: 6
courseChapter: intro
---

There is an official path to this certification, and it is worth following in order rather
than jumping straight to practice questions. The sequence below is the published roadmap,
with a note on what each step buys you.

## 1. Anthropic Academy

Free training covering Claude, Claude Code, the API, MCP and agentic development. The exam
assumes this material rather than testing it directly — you will not be asked to define an
agent, but every scenario is written as though you already can.

## 2. Learn by building

Work through the Cookbook and get something running. This is the step people skip, and it is
the step that separates a pass from a near miss. The exam's distractors are built out of
mistakes real engineers make, which means they are *recognisable* if you have made them and
*plausible* if you have not.

::: exam-tip The hands-on exercises that map most directly to marks
Build an agentic loop end to end and watch `stop_reason` drive it. Write an MCP server. Wire
a `CLAUDE.md` plus a `PreToolUse` hook and observe which one actually stops you. Run
`claude -p` in a pipeline. Each of these is worth several questions.
:::

## 3. Master the core technologies

Go deeper into the two things you will architect with: the Claude API and the Model Context
Protocol. Domain 4 in particular rewards knowing the shape of a tool definition and the MCP
primitives precisely rather than approximately.

## 4. Follow the official Architect prep path

Anthropic publishes a dedicated preparation path inside Partner Academy — roughly seven
courses covering the API, Agent Skills, subagents, the Building Effective Agents essay, MCP,
Claude Code in Action, and the context/caching/error documentation.

## 5. Study the official Exam Guide

::: key-fact This is your source of truth
The Exam Guide carries the domains, the task statements, what is explicitly in and out of
scope, and sample questions with rationales. Where any third-party material disagrees with
it — including this site — the guide wins.
:::

## 6. Practise scenarios, not memorisation

The questions are scenario-based multiple choice. Focus on trade-offs: architecture
decisions, deployment choices, cost, security, and what happens when something fails at 3am.
The old standalone practice exam has been retired, so the sample questions in the official
guide are the closest thing to calibrated items.

## 7. Register

Register through Anthropic Partner Academy, then schedule the proctored sitting through
Pearson VUE.

## Where the time actually goes

If you have a fixed number of hours, spend them roughly in proportion to the domain weights,
with one adjustment: over-invest slightly in Domain 1, because it is both the largest domain
and the one the other four lean on.

::: trap Grinding practice questions is not revision
Practice questions are a *diagnostic*. They tell you which domain is leaking marks. The
repair happens in the lessons and in the cookbook, not in doing another forty questions and
hoping the average drifts up.
:::
