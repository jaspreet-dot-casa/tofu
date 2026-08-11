---
id: d5-context-rot
track: d5
order: 1
title: Context rot and lost in the middle
summary: Why a bigger window is not more attention, how to spot degradation, and what to do about it.
minutes: 7
courseChapter: scaling-context
---

The context window is finite working memory holding everything: system prompt, tools,
conversation, documents, and the output being generated. The exam's interest is in what
happens as it fills.

## Bigger is not better

::: key-fact More context does not mean better attention
Recall and accuracy degrade as the window fills. This is *context rot*. Curating what is in
context matters at least as much as how much capacity you have.
:::

Alongside it, the positional effect:

::: key-fact Lost in the middle
Models attend well to the beginning and end of a long context and less well to the middle.
Critical information buried halfway through a large document set is the information most
likely to be missed.
:::

Together these kill the most tempting distractor in Domain 5: "the agent is missing details,
so move it to a model with a larger context window". A larger window gives you room for more
material to be ignored.

::: trap Treating window size as an attention fix
The correct responses to missed detail are: extract the key facts to the **top** of the
prompt, **trim** verbose tool output, and **split** the work into focused per-unit passes.
Not a bigger window.
:::

## Long-context prompting

For inputs beyond roughly 20k tokens, the ordering rule is specific and worth knowing:

- Put **long documents near the top**, above the query and the instructions. This can improve
  quality substantially.
- Wrap each document in `<document>` with `<source>` and `<document_content>` subtags.
- Ask Claude to extract relevant quotes into `<quotes>` tags **before** answering, which
  grounds the response in the material rather than in recollection of it.

```xml
<documents>
  <document>
    <source>refund-policy-2026.pdf</source>
    <document_content>...</document_content>
  </document>
</documents>

Extract the passages relevant to damaged goods into <quotes> tags, then answer.
```

## Spotting degradation

The signals that a context has gone bad, and they are worth recognising by description:

- **Inconsistent answers** to the same question asked twice.
- **Generic patterns** replacing specific findings — advice that could apply to any codebase.
- **Repeated tool calls** for work already done.
- **Hallucinated references** to information never provided.

## The remedies

| Symptom | Remedy |
|---|---|
| Long conversation drifting | Compaction — summarise earlier turns |
| Huge tool outputs crowding it out | Context editing — clear old tool results |
| Too much material for one pass | Subagent offloading — one per unit, return summaries |
| Only a fraction is ever relevant | Retrieval — fetch only what is needed |
| Key facts getting lost | Extract them to a structured block at the top |

The scratchpad pattern is worth naming: persist state to a file, and let the agent re-read the
part it needs rather than carrying everything in context. It converts a context problem into
a storage problem, which is a much better problem.

::: key-fact The attention-budget mental model
Ask: *is the critical information buried in the middle of a long context?* If so, extract it
to the beginning or split into focused passes. This is one of the five mental models and it
resolves most of Domain 5's scenario questions on its own.
:::
