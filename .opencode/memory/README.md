# OpenCode Desktop Memory

This directory contains project-specific memory files that help OpenCode Desktop understand the HexaStudio project context.

## Files

| File | Purpose |
|------|---------|
| `project.json` | Comprehensive project knowledge: architecture, infrastructure, services, credentials, CI/CD, known issues, quality gates |
| `cloudflare.json` | Cloudflare API credentials (token, email, auth type) |

## Format

All memory files use JSON format for easy parsing by AI assistants. Each file focuses on a specific domain:
- **project.json** — everything about the project itself
- **cloudflare.json** — Cloudflare-specific credentials and configuration

## Adding New Memory Files

Create a new `.json` file in this directory for any domain-specific knowledge that would help an AI assistant work effectively on this project. Keep files focused and well-structured.

## Security Note

Secrets in these files are ENVIRONMENT VARIABLE NAMES, not actual secret values. The actual secrets live in the server's `.env` file and are never committed to version control.
