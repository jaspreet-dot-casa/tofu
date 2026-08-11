---
id: d4-tool-anatomy
track: d4
order: 1
title: Tool anatomy and the description lever
summary: The three required fields, why the description outranks everything else, and the tool-count ceiling.
minutes: 7
courseChapter: tooling
---

There is one fact in this domain that answers more questions than any other, and it is not
about schemas.

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
with `type`, `properties` and `required`. Optional: `input_examples`, `strict`,
`cache_control`, `defer_loading`, `allowed_callers`.

## The description is the routing mechanism

::: key-fact The description, not the name, drives tool selection
Anthropic describes the description as "by far the most important factor in tool
performance". Selection accuracy depends far more on the prose than on the schema. A tool
named `search_orders` with a one-line description will be mis-selected; the same tool with
four good sentences will not.
:::

A good description is three to four sentences covering:

- **what** the tool does;
- **when to use it** — and explicitly when *not* to;
- **what each parameter means**, beyond its type;
- **caveats** — especially what the tool does *not* return, and how it behaves on empty
  results.

That last point matters more than it looks. A tool that returns `[]` for both "no matches"
and "the search backend is down" will produce confidently wrong answers, and the description
is where you tell Claude which is which.

::: exam-tip "Claude keeps calling the wrong tool"
The intended fix is almost always a better description, or consolidating overlapping tools,
or namespacing them. It is **not** forcing `tool_choice`, and it is **not** upgrading the
model. Forcing a tool choice removes the model's judgement rather than informing it, and
model upgrades do not fix an ambiguous specification.
:::

## The tool-count ceiling

::: key-fact Four to five tools per agent is the sweet spot; selection accuracy degrades
noticeably past roughly 18
:::

If an agent needs more than a handful, that is a signal to split the work across subagents
rather than to keep adding. Each subagent gets the four or five tools its job needs, which is
also least privilege for free.

This is one of the seven anti-patterns: giving every agent access to every tool. It reads as
flexible and behaves as unreliable.

## Client tools versus server tools

- **Client tools** — your own functions, plus Anthropic-schema tools like bash and text
  editor. They execute in *your* application, and you run the loop.
- **Server tools** — `web_search`, `web_fetch`, `code_execution`. They execute on Anthropic's
  infrastructure and return results directly. They use versioned type strings such as
  `web_search_20260209` and carry their own usage-based pricing.

The examinable difference is who executes and who pays. A question describing a tool that
"returns results without your application doing anything" is describing a server tool.
