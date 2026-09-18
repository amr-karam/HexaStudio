---
name: paseo-committee
description: Form a committee of two high-reasoning agents to step back, do root cause analysis, and produce a plan. Use when stuck, looping, tunnel-visioning, or facing a hard planning problem.
user-invocable: true
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

# Committee Skill

Two agents from contrasting providers, fresh context, planning a solution in parallel. They stay alive for review after implementation.

The purpose is to step back, not double down. The committee may propose a completely different approach.

**User's additional context:** $ARGUMENTS

## Prerequisites

Read the **paseo** skill. Before choosing committee members, read `~/.paseo/orchestration-preferences.json` unless the user explicitly named providers in this request. Do not create committee agents until you have read it.

Contrast is the point of a committee, so pick across providers deliberately using the configured preferences rather than hardcoded defaults.

## Composition

Two members with different reasoning styles, selected from orchestration preferences:

- one planning/research-strength provider
- one contrasting high-reasoning provider

Override only when the user explicitly asks for different members.

## Hard rules

- **No edits.** Every prompt to a committee member ends with the no-edits suffix:

  ```
  This is analysis only. Do NOT edit, create, or delete any files. Do NOT write code.
  ```

- **Trust the wait.** Do not poll, send hurry-ups, or interrupt. GPT-5.4 can reason 15–30 minutes; Opus does extended thinking. Long waits mean it found something worth thinking about.
- **You are the middleman.** Drive plan → implement → review without yielding to the user, except for divergences that need their call.

## Phase 1: Plan

Write a problem-level prompt:

- High-level goal and acceptance criteria
- Constraints
- Symptoms (if a bug)
- What you tried and why it failed
- Explicit: "do root cause analysis"
- Explicit: "state assumptions, ask why three levels deep, check whether you're patching a symptom or removing the problem"

Create both agents in parallel via Paseo with `[Committee] <task>` titles and the same prompt. Wait for both — not just whichever finishes first.

Read both responses. Challenge them — do not accept at face value:

- "Why does <underlying thing> happen? Symptom or cause?"
- Verify any assumption the plan makes about the code.
- "What did you considered and reject?"

Send follow-ups until the plan addresses root cause.

Synthesize:

- Convergence → unified plan.
- Significant divergence → involve the user.

Confirm the merged plan with both members. Multi-turn until consensus.

## Phase 2: Implement

Default: implement yourself. If the user said **"delegate"**, launch one impl agent and pass the merged plan.

The committee stays clean — not involved in implementation.

## Phase 3: Review

Send the diff to the committee:

> Implementation is done. Review changes against the plan. Flag drift or missing pieces. <no-edits suffix>

Apply feedback yourself, or send to the impl agent. Repeat 2 → 3 until consensus.

After ~10 iterations without convergence, start a fresh committee with the full history of what was tried — the current committee's context may have drifted too far.
