---
id: d3-few-shot-xml
track: d3
order: 2
title: Few-shot examples and XML structure
summary: How many examples, how diverse, where to put them — and the one thing few-shot cannot do.
minutes: 6
courseChapter: reliability
---

"Few-shot" just means showing the model a few worked examples in the prompt.

It is the most reliable way to communicate a format or an edge-case rule. It is also routinely
used on problems it cannot solve.

## How many, and which ones

Three to five relevant examples that are **different from each other**.

Different is the key word. Five examples that all look alike teach the model the wrong lesson —
it picks up on something they happen to share instead of the rule you meant.

A good set of examples covers:

- the **format** you want back;
- an **acceptable variation**, so the model does not lock onto one exact shape;
- an **edge case**, especially one where the obvious answer is wrong;
- where it helps, the **reasoning** that leads to the answer, not just the answer.

::: exam-tip Wrap examples in XML tags
Put each one in an `<example>` element inside an `<examples>` block.

The tags make it obvious where the examples stop and the real task starts. Without them, the
model has to guess.
:::

```xml
<examples>
  <example>
    <input>Order #4417 arrived cracked. I want my money back.</input>
    <output>{"intent": "refund", "sentiment": "negative", "policy_match": "damaged_goods"}</output>
  </example>
  <example>
    <input>Do you ship to Tasmania?</input>
    <output>{"intent": "question", "sentiment": "neutral", "policy_match": null}</output>
  </example>
</examples>
```

## XML tags in general

Clear, consistent tags separate the parts of a prompt: `<instructions>`, `<context>`,
`<document>`, `<example>`.

They also work as a format control. "Put your answer in `<answer>` tags" is a reliable way to
get a piece you can parse out of a text response.

Being consistent matters more than the names you pick. If your instructions say `<document>`
and your content is tagged `<doc>`, you have thrown away the benefit.

## What examples cannot do

::: trap Examples do not enforce tool ordering
Showing five examples where `validate` runs before `submit` does not guarantee the model does
it on the sixth.

Ordering is a rule that must hold every time, so it needs enforcing in code — a gate, a hook,
or an orchestration step that simply does not offer `submit` until validation has passed.
:::

That is a specific case of a general rule: examples make some outputs more likely, they do not
rule any out. Anything that must hold every time belongs in code.

## Chain of thought

For multi-step reasoning, letting the model work through the problem before answering improves
accuracy.

Modern models use **adaptive thinking** — `thinking: {type: "adaptive"}` with an `effort`
setting of `low`, `medium`, `high`, `xhigh` or `max`. This replaces the older extended-thinking
token budget.

With thinking switched off, you can still ask for reasoning by hand, using `<thinking>` and
`<answer>` tags and then reading only the answer part.

::: key-fact Thinking limits tool_choice
`tool_choice: "any"` and `tool_choice: {type: "tool", name: …}` are **not compatible** with
extended thinking. Only `auto` and `none` are.

Questions enjoy setting up a design that needs both and asking you to spot the conflict.
:::
