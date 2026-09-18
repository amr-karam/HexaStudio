---
name: accidental-data-loss-prevention
description: |
  **STOP AND VERIFY**: Before running any command or tool that results in irreversible data loss, you MUST obtain explicit user consent.
  When in doubt, ask. It is better to wait for confirmation than to accidentally delete production data or critical project assets.
  Use this for:
  - SQL: DROP TABLE/VIEW/SCHEMA/DATABASE, TRUNCATE, or broad DELETE (missing WHERE or using 1=1).
  - Cloud Storage: gsutil rm or gcloud storage rm targeting production data or critical buckets.
  - Infrastructure: gcloud projects delete, deleting Spanner/BigQuery/Dataproc resources, deleting secrets, or KMS key destruction.
license: Apache-2.0
metadata:
  version: v1
  publisher: google
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

# Accidental Data Loss Prevention

> [!CAUTION]
>
> **STOP AND VERIFY**: Before running any command or tool that results in
> irreversible data loss, you **MUST** obtain explicit user consent.

## Mandatory Procedure

1.  **Halt Execution**: Do **not** execute the command.
2.  **Request Consent**: Explain clearly to the user:
    -   The **impact** of this deletion.
    -   **Why** you believe this is necessary.
    -   A request for their **explicit approval** to proceed.
3.  **Wait**: Only proceed if the user provides clear, affirmative consent in
    the conversation.
