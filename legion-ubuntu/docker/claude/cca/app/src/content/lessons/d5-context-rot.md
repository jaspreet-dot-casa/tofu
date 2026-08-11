---
id: d5-context-rot
track: d5
order: 1
title: Context rot and lost in the middle
summary: Why a bigger window is not more attention, how to spot degradation, and what to do about it.
minutes: 7
courseChapter: scaling-context
---

The context window is the model's working memory. Everything lives in it: the system prompt,
the tools, the conversation, the documents, and the answer being written.

This domain is about what happens as it fills up.

## Bigger is not better

::: key-fact More context does not mean better attention
As the window fills, the model gets worse at recalling and using what is in there. This is
called **context rot**.

Choosing what goes in matters at least as much as how much space you have.
:::

And alongside it, a positional effect:

::: key-fact Lost in the middle
Models pay good attention to the beginning and the end of a long context, and less attention to
the middle.

So the important thing buried halfway through a big pile of documents is exactly the thing most
likely to be missed.
:::

Together, these two facts kill Domain 5's most tempting wrong answer: "the agent is missing
details, so move it to a model with a bigger context window."

A bigger window just gives you room for more material to be ignored.

::: trap Treating window size as an attention fix
When detail is being missed, the right responses are: pull the key facts up to the **top** of
the prompt, **trim** bulky tool output, and **split** the work into smaller focused passes.

Not a bigger window.
:::

## Prompting with long documents

For inputs over roughly 20k tokens, the ordering rule is specific and worth knowing:

- Put **long documents near the top**, above the query and the instructions. This can improve
  quality a lot.
- Wrap each document in `<document>` with `<source>` and `<document_content>` inside it.
- Ask Claude to pull the relevant quotes into `<quotes>` tags **before** answering. That
  grounds the answer in the actual text rather than in a fuzzy memory of it.

```xml
<documents>
  <document>
    <source>refund-policy-2026.pdf</source>
    <document_content>...</document_content>
  </document>
</documents>

Extract the passages relevant to damaged goods into <quotes> tags, then answer.
```

## How to tell a context has gone bad

Learn these by their description, because that is how questions present them:

- **Inconsistent answers** to the same question asked twice.
- **Generic advice** replacing specific findings — the kind that would fit any codebase.
- **Repeated tool calls** for work already done.
- **Invented references** to information never provided.

## The fixes

| Symptom | Fix |
|---|---|
| Long conversation drifting | Compaction — summarise the earlier turns |
| Huge tool outputs crowding everything out | Context editing — clear old tool results |
| Too much material for one pass | Subagent offloading — one per unit, return summaries |
| Only a fraction is ever relevant | Retrieval — fetch only what is needed |
| Key facts getting lost | Pull them into a structured block at the top |

The scratchpad pattern is worth naming: write state out to a file, and let the agent re-read
the bit it needs instead of carrying everything in context. It turns a context problem into a
storage problem — and storage problems are much easier to solve.

::: key-fact The attention-budget mental model
Ask: *is the important information buried in the middle of a long context?*

If it is, move it to the beginning or split the work into smaller passes. This is one of the
five mental models, and it resolves most of Domain 5's questions on its own.
:::
