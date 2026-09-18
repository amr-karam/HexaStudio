---
name: self-healing
description: Recover from command, test, environment, or service failures through diagnosis, repair, verification, and documented learning.
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

# Skill: self-healing

## Description
Active runtime recovery — diagnose, patch, verify, file the verified fix when a command, test, helper, env, or external service fails mid-task.

## Workflow
1. Diagnose failure.
2. Propose patch.
3. Verify patch.
4. File fix in .learnings/HEALS.md.

## Authoritative Reference
https://github.com/pskoett/pskoett-ai-skills/tree/main/skills/self-healing
