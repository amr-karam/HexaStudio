---
name: verify-gate
description: Run compilation, lint, and test checks between implementation and quality review.
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

# Skill: verify-gate

## Description
Machine verification gate (compile, test, lint) between implementation and quality review.

## Workflow
1. Run `npm run lint`.
2. Run `npm run typecheck`.
3. Run `npm run test`.
4. If failures occur, enter self-healing loop.

## Authoritative Reference
https://github.com/pskoett/pskoett-ai-skills/tree/main/skills/verify-gate
