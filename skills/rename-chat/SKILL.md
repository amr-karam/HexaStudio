---
name: rename-chat
description: >-
  Rename the current chat to match its focus. Use only when the user invokes
  /rename-chat. Optional text after the command steers the title.
disable-model-invocation: true
environments:
  - local
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

# Rename Chat

Slash-only. Text after `/rename-chat` is an optional naming hint, not a verbatim title.

Pick a 3-5 word topic title in sentence case: first letter uppercase, rest lowercase except acronyms and proper nouns. Hint steers wording only. Example: hint `billing retries` → `Billing retries`. Avoid "Chat", "Conversation", or "Rename chat". At most 200 characters.

Call `cursor-app-control.rename_chat` once with that title. Do not ask for confirmation. If the tool is missing or fails, say so plainly and do not claim the chat was renamed.
