# MCP Bridge for HEXA Studio

This bridge enables seamless communication between ChatGPT Desktop and OpenCode via both:

1. **MCP Direct Channel** - Real-time bidirectional communication for immediate task execution
2. **GitLab Webhook Loop** - Durable async processing for GitLab events and MR automation

## Key Features
- Supports 15+ specialized agent types
- GitLab MR automation with auto-merging
- Session persistence with detailed history
- Cross-platform deployment (Windows/macOS/Linux)

## How to Use
1. Configure environment variables:
   - `OPENCODE_PATH`
   - `GIT_PATH`
   - `WEBHOOK_ENDPOINT`
2. Start bridge:
   ```bash
   npm run start
   # Or via MCP server: opencode run mcp-server
3. Connect ChatGPT Desktop via MCP client

## Architecture
![Communication Flow](docs/communication-flow.png)

## Dependencies
- Docker Compose
- GitLab CE >= 14.15
- OpenCode 1.18+