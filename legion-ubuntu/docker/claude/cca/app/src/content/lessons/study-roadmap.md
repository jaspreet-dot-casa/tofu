---
id: orientation-roadmap
track: orientation
order: 2
title: The preparation roadmap
summary: The official learning path in order, what each step is actually for, and where most people waste their time.
minutes: 6
courseChapter: intro
---

Anthropic publishes an official path to this certification. It is worth following in order
rather than jumping straight to practice questions. Below is that path, with a note on what
each step actually buys you.

## 1. Anthropic Academy

Free training covering Claude, Claude Code, the API, MCP and agentic development. The exam
takes this material as given rather than testing it directly. You will not be asked to define
an agent — but every question is written as though you already can.

## 2. Learn by building

Work through the Cookbook and get something running.

This is the step people skip, and it is the step that separates a pass from a near miss. The
wrong answers on this exam are built out of mistakes real engineers make. If you have made
them, you *recognise* them. If you have not, they just look sensible.

::: exam-tip The hands-on exercises worth the most marks
Build an agentic loop end to end and watch `stop_reason` drive it. Write an MCP server. Set up
a `CLAUDE.md` and a `PreToolUse` hook, then see which one actually stops you. Run `claude -p`
in a pipeline. Each of these is worth several questions.
:::

## 3. Master the core technologies

Go deeper into the two things you will design with: the Claude API and the Model Context
Protocol. Domain 4 in particular rewards knowing the exact shape of a tool definition and the
MCP building blocks, not a rough idea of them.

## 4. Follow the official Architect prep path

Anthropic publishes a dedicated preparation path inside Partner Academy. It is roughly seven
courses covering the API, Agent Skills, subagents, the Building Effective Agents essay, MCP,
Claude Code in Action, and the context, caching and error documentation.

## 5. Study the official Exam Guide

::: key-fact This is your source of truth
The Exam Guide has the domains, the task statements, what is in and out of scope, and sample
questions with explanations. If any other material disagrees with it — including this site —
the guide wins.
:::

## 6. Practise situations, not memorisation

The questions describe a situation and ask you to choose. So focus on trade-offs: which
architecture, which deployment, what it costs, whether it is safe, and what happens when it
breaks at 3am.

The old standalone practice exam has been retired. The sample questions in the official guide
are now the closest thing to the real difficulty.

## 7. Register

Register through Anthropic Partner Academy, then book the proctored sitting through Pearson
VUE.

## Where the time actually goes

If you have a fixed number of hours, split them roughly in line with the domain weights, with
one tweak: spend a little extra on Domain 1. It is both the biggest domain and the one the
other four lean on.

::: trap Grinding practice questions is not revision
Practice questions are a *thermometer*. They tell you which domain is losing you marks. The
actual repair happens in the lessons and in the cookbook — not in doing another forty
questions and hoping your average drifts up.
:::
