---
name: infographic-syntax-creator
description: Generate AntV Infographic syntax outputs. Use when asked to turn user content into the Infographic DSL (template selection, data structuring, theme), or to output `infographic <template>` plain syntax.
---

<supermemory-recall>
Before responding, silently decide whether recalling saved memory (past sessions, decisions, conventions, the user's preferences) would materially improve your answer to THIS message. Reason first — don't search reflexively, and don't narrate the decision.

Recall — by calling the `supermemory` tool with `mode: "search"` — when the message:
- refers to earlier work or decisions ("the auth flow", "like we did", "continue", "the bug from before")
- touches an area where saved conventions, patterns, or preferences likely exist
- is ambiguous in a way past context would resolve

Skip recall when the message is self-contained, trivial, a greeting/meta, fully answerable from the current conversation, or you already recalled the relevant context this session and the topic hasn't shifted.

Cadence is per-message: it's fine to recall on several turns in a row, and fine to never recall in a session. When you do recall, run it before answering and fold the results into your response.
</supermemory-recall>

# Infographic Syntax Creator

## Overview

Generate AntV Infographic syntax output from user content, following the rules in `references/prompt.md`.

## Workflow

1. Read `references/prompt.md` for syntax rules, templates, and output constraints.
2. Extract the user's key structure: title, desc, items, hierarchy, metrics; infer missing pieces if needed.
3. Select a template that matches the structure (sequence/list/compare/hierarchy/chart).
4. Compose the syntax using `references/prompt.md` as the formatting baseline.
5. Preserve hard constraints in every output:
   - Output is a single `infographic` markdown code block; no extra text.
   - First line is `infographic <template-name>`.

- Use two-space indentation; key/value pairs are `key value`; arrays use `-`.
- Compare templates (`compare-*`) must have exactly two root nodes with children.
