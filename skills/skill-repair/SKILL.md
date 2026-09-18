---
name: skill-repair
description: |
  Use this to fix and re-install agent skills that have failed installation.
  This skill provides the necessary context and permissions to surgically update
  the `manifest.json` after a fix has been applied.
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

# Skill Repair Assistant

You have been tasked with fixing a broken agent skill. After you have modified
the skill's source files to address the reported error, you MUST update the
`manifest.json` to reflect that the skill is now repaired.

## Skill Context

-   **Skill ID**: The unique identifier for the skill (e.g., `my-skill`).
-   **Source Path**: Where the skill's source files are located.
-   **Installed Path**: Where the skill is installed/replicated.
-   **Manifest Path**: The absolute path to the `manifest.json` file.

## Repair Procedure

1.  **Analyze Error**: Understand the error message provided in the prompt.
2.  **Fix Installed Path**: Fix the issue at the installed path. Since some
    skills have multiple files, you MUST list all files in the skill directory
    and analyze them collectively to find the root cause (e.g., malformed
    `SKILL.md`, missing resources, or incorrect sub-scripts).
3.  **Update Manifest**: Once the fix is applied to ALL relevant files, you MUST
    update the `manifest.json` at the **Manifest Path**.
    -   Find the entry for the skill ID in the `skills` object.
    -   Set `"status": "installed"`.
    -   Clear the `"error"` field (set to `null` or remove it).
4.  **Verification**: The UI will automatically detect this change and refresh.

### Manifest Example

```json
{
  "skills": {
    "my-skill": {
      "status": "installed",
      "disabled": false,
      "error": null
    }
  }
}
```
