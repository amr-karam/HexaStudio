---
name: simplify-and-harden
description: Review completed work for simpler structure, stronger security, and concise supporting documentation.
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

# Skill: simplify-and-harden

## Description
Post-completion self-review that runs simplify, harden, and micro-documentation passes before signaling done.

## Workflow
1. Review implementation.
2. Simplify code structure.
3. Harden security posture.
4. Update micro-documentation.

## Authoritative Reference
https://github.com/pskoett/pskoett-ai-skills/tree/main/skills/simplify-and-harden
