---
id: d4-tool-anatomy
track: d4
order: 1
title: Tool anatomy and the description lever
summary: The three required fields, why the description outranks everything else, and the tool-count ceiling.
minutes: 7
courseChapter: tooling
---

One fact in this domain answers more questions than any other. It is not about schemas — it is
about the description you write.

## The definition

```json
{
  "name": "search_orders",
  "description": "Search the order database by customer email, order number or date range. Returns up to 50 matching orders with status, total and line items. Use this when the customer references a specific purchase. Do NOT use it for refund eligibility — call check_refund_policy for that. Returns an empty array when there are no matches; it does not indicate an error.",
  "input_schema": {
    "type": "object",
    "properties": {
      "email":        { "type": "string", "description": "Customer email, exact match" },
      "order_number": { "type": "string", "description": "Order reference, e.g. ORD-4417" },
      "from":         { "type": "string", "format": "date" },
      "to":           { "type": "string", "format": "date" }
    },
    "required": []
  }
}
```

Required fields: `name` (matching `^[a-zA-Z0-9_-]{1,64}$`), `description`, and `input_schema`
with `type`, `properties` and `required`.

Optional: `input_examples`, `strict`, `cache_control`, `defer_loading`, `allowed_callers`.

## The description is what makes Claude pick the right tool

::: key-fact The description, not the name, decides tool selection
Anthropic calls the description "by far the most important factor in tool performance".

How well Claude picks depends much more on the prose than on the schema. A tool called
`search_orders` with a one-line description will get picked wrongly. The same tool with four
good sentences will not.
:::

A good description is three or four sentences covering:

- **what** the tool does;
- **when to use it** — and clearly when *not* to;
- **what each parameter means**, beyond just its type;
- **catches** — especially what the tool does *not* return, and what it does when it finds
  nothing.

That last point matters more than it looks.

A tool that returns `[]` for both "no matches" and "the search backend is down" will produce
confident wrong answers. The description is where you tell Claude which is which.

::: exam-tip "Claude keeps calling the wrong tool"
The intended fix is almost always a better description, or merging tools that overlap, or
namespacing them.

It is **not** forcing `tool_choice`, and it is **not** upgrading the model. Forcing a choice
takes away the model's judgement instead of improving it, and a bigger model does not fix a
vague description.
:::

## How many tools is too many

::: key-fact Four to five tools per agent is the sweet spot; picking accuracy drops off
noticeably past about 18
:::

If an agent needs more than a handful, that is a signal to split the work across subagents
rather than keep adding. Each subagent gets the four or five tools its job needs — which gives
you least privilege for free.

This is one of the seven anti-patterns: giving every agent access to every tool. It reads as
flexible and behaves as unreliable.

## Client tools versus server tools

- **Client tools** — your own functions, plus Anthropic-schema tools like bash and text
  editor. They run in *your* application, and you run the loop.
- **Server tools** — `web_search`, `web_fetch`, `code_execution`. They run on Anthropic's
  infrastructure and hand back results directly. They use versioned type strings such as
  `web_search_20260209` and have their own usage-based pricing.

What gets tested is who runs it and who pays. A question describing a tool that "returns
results without your application doing anything" is describing a server tool.
