---
name: shell
description: >-
  Runs the rest of a /shell request as a literal shell command. Use only when
  the user explicitly invokes /shell and wants the following text executed
  directly in the terminal.
disable-model-invocation: true
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

# Run Shell Commands

Use this skill only when the user explicitly invokes `/shell`.

## Behavior

1. Treat all user text after the `/shell` invocation as the literal shell command to run.
2. Execute that command immediately with the terminal tool.
3. Do not rewrite, explain, or "improve" the command before running it.
4. Do not inspect the repository first unless the command itself requires repository context.
5. If the user invokes `/shell` without any following text, ask them which command to run.

## Response

- Run the command first.
- Then briefly report the exit status and any important stdout or stderr.
