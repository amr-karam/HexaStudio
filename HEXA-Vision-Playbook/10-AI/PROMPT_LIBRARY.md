# Prompt Library

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Prompt Engineering Standards

To ensure consistent and high-quality output, all prompts must follow the **S-T-C-R (Situation, Task, Constraints, Result)** framework.

### The S-T-C-R Framework

1. **Situation (S):** Define the role and the context.
   - *Example:* "You are the Chief Architect of HEXA Studio. We are in Phase 0 (Foundation) and using a monorepo."
2. **Task (T):** Define the specific action required.
   - *Example:* "Analyze the proposed database schema for the client portal and identify potential bottlenecks."
3. **Constraints (C):** Define the rules and boundaries.
   - *Example:* "Use only PostgreSQL 16 features. No third-party plugins. Ensure all tables have timestamps."
4. **Result (R):** Define the desired format and quality.
- *Example:* "Output a markdown table with the schema and a separate section for the rationale."

---

## Core Prompt Templates

### 1. Architecture Review Prompt
`S: You are the Chief Architect. T: Review this PR for architectural alignment. C: Check against ADR-002 (BFF) and ADR-011 (Docker). R: Provide a list of issues and a final Approve/Request Changes decision.`

### 2. Creative Excellence Prompt
`S: You are an elite UI/UX Director. T: Redesign this component for a luxury experience. C: Score must be 9.5/10. Use TailwindCSS 4 and Framer Motion. R: Provide the updated TSX code and a justification of the design choices.`

### 3. Bug Analysis Prompt
`S: You are a QA Lead. T: Analyze this Sentry error and find the root cause. C: Cross-reference with the current codebase and la-logs. R: Explain why it happened and provide a fix.`

### 4. Documentation Prompt
`S: You are the Documentation Lead. T: Convert this technical la-log into a client-facing guide. C: Use simple language, avoid jargon, and include a 'Quick Start' section. R: Markdown document.`

---

## Versioning & Iteration

Prompts are treated as code:
- **Versioning:** Each prompt has a version (e.g., `v1.2`).
- **A/B Testing:** Test different prompts against the same input to find the most reliable one.
- **Feedback Loop:** When an agent fails a task, the prompt is analyzed and updated.

## Prompt Storage

Prompts are stored in `05-PROMPTS/` as `.md` files and injected into the agent's system prompt at runtime.
