---
id: d3-few-shot-xml
track: d3
order: 2
title: Few-shot examples and XML structure
summary: How many examples, how diverse, where to put them — and the one thing few-shot cannot do.
minutes: 6
courseChapter: reliability
---

Examples are the most reliable way to communicate a format or an edge-case policy. They are
also routinely misapplied to problems they cannot solve.

## How many, and which

Three to five relevant, **diverse** examples. Diversity is the operative word: five examples
that all look alike teach the model the wrong pattern — it latches onto an incidental feature
they share rather than the rule you meant.

Good example sets cover:

- the **format** you want back;
- an **acceptable variation**, so the model does not over-fit to one shape;
- an **edge case**, especially one where the naive answer is wrong;
- where relevant, the **reasoning** that leads to the classification, not just the label.

::: exam-tip Wrap examples in XML tags
Put them in `<example>` elements inside an `<examples>` block. The tags separate the examples
from the instructions unambiguously — without them, a model has to infer where the
demonstration stops and the task begins.
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

## XML tags generally

Descriptive, consistent tags separate the parts of a prompt: `<instructions>`, `<context>`,
`<document>`, `<example>`. They double as a format control — "put your answer in `<answer>`
tags" is a reliable way to get a parseable region out of a text response.

Consistency matters more than the specific names. Referring to `<document>` in the
instructions and then tagging the content `<doc>` costs you the benefit.

## What few-shot cannot do

::: trap Few-shot does not enforce tool ordering
Showing five examples where `validate` is called before `submit` does not guarantee the
model will do it on the sixth. Ordering is a **compliance** requirement, and compliance needs
deterministic enforcement — a programmatic gate, a hook, or an orchestration step that simply
does not expose `submit` until validation has passed.
:::

This is a specific instance of the general rule: examples shape the distribution of outputs,
they do not constrain it. Anything that must hold every time belongs in code.

## Chain of thought

For multi-step reasoning, letting the model work before answering improves accuracy. Modern
models use **adaptive thinking** — `thinking: {type: "adaptive"}` with an `effort` parameter
of `low`, `medium`, `high`, `xhigh` or `max` — rather than the older extended-thinking token
budget.

When thinking is off, you can still elicit reasoning manually with `<thinking>` and
`<answer>` tags and then read only the answer region.

::: key-fact Thinking constrains tool_choice
`tool_choice: "any"` and `tool_choice: {type: "tool", name: …}` are **not compatible** with
extended thinking. Only `auto` and `none` are. Scenario questions enjoy setting up a design
that needs both and asking you to spot the conflict.
:::
