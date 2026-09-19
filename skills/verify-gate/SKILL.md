---
name: verify-gate
description: Run compilation, lint, and test checks between implementation and quality review.
---

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
