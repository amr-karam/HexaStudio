# Prompt Templates

This directory contains reusable prompt templates for AI agents working on the HEXA Vision platform.

## Contents

| File | Description |
|------|-------------|
| `code-generation.md` | Prompt for generating code following standards |
| `code-review.md` | Prompt for reviewing code changes |
| `architecture-decision.md` | Prompt for making architectural decisions |
| `pr-description.md` | Prompt for writing PR descriptions |
| `test-generation.md` | Prompt for generating tests |
| `documentation-generation.md` | Prompt for generating documentation |
| `release-review.md` | Prompt for release quality gate review |

## Prompt Format

Every prompt follows this structure:

1. **Role** — Who the agent is
2. **Context** — What the agent needs to know
3. **Task** — What to do
4. **Constraints** — Rules and boundaries
5. **Output Format** — Expected result
6. **Quality Criteria** — How to self-verify

## Usage

Include the relevant prompt when invoking an agent for a specific task. Modify as needed for the specific context.
