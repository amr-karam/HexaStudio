# Hermes Multi-Agent Integration — Implementation Plan

## Overview
Replace the current single-LLM AI assistant (`/api/ai/chat`) with a **Hermes multi-agent system** that orchestrates specialized agents (ERP Analyst, Project Assistant, Knowledge Agent, Sales Agent) via a LangGraph-style agent loop running on the NestJS backend.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐
│  Frontend       │     │  Backend (NestJS)│
│  ai-assistant   │────▶│  /ai/agents/chat │
│  page.tsx        │     │                   │
└─────────────────┘     └────────┬─────────┘
                                  │
        ┌─────────┬──────────────┼──────────────┬─────────┐
        ▼         ▼              ▼              ▼         ▼
  ┌──────────┐ ┌──────────┐ ┌─────────┐   ┌──────────┐ ┌───────┐
  │ ERP      │ │ Project  │ │ Sales   │   │ Knowledge│ │Memory │
  │ Analyst  │ │ Assistant│ │ Agent   │   │ Agent    │ │(Qdrant)│
  └──────────┘ └──────────┘ └─────────┘   └──────────┘ └───────┘
       │            │          │             │          │
       ▼            ▼          ▼             ▼          ▼
  ┌─────────┐  ┌─────────┐ ┌─────────┐  ┌─────────┐ ┌─────────┐
  │  Odoo   │  │Postgres │ │   Odoo  │  │ Strapi  │ │ Qdrant  │
  │  API    │  │         │ │   CRM   │  │   CMS   │ │         │
  └─────────┘  └─────────┘ └─────────┘  └─────────┘ └─────────┘
```

## Phase 1: Backend — Hermes Agent Framework (NestJS)

### Ticket 1: Install Dependencies
- Add packages to `apps/api/package.json`:
  - `@langchain/core`, `@langchain/langgraph`, `langchain`
  - `@hermes-ai/agent-sdk` (or build from langgraph)
  - `zod` (schema validation for agent inputs)
- Update `apps/api/tsconfig.json` build target

### Ticket 2: Create Agent Module Structure
```
apps/api/src/modules/ai/agents/
├── agents.module.ts          # NestJS module wiring
├── agents.controller.ts      # New /ai/agents/* endpoints
├── agents.service.ts         # Orchestrator: manages agent loop
├── schemas/                  # Zod schemas for agent I/O
│   ├── erp.schema.ts
│   ├── project.schema.ts
│   └── sales.schema.ts
├── agents/                   # Individual agent implementations
│   ├── erp-analyst.agent.ts
│   ├── project-assistant.agent.ts
│   ├── sales.agent.ts
│   └── knowledge.agent.ts
├── tools/                    # Reusable tools (Odoo, Strapi, Qdrant)
│   ├── odoo.tools.ts
│   ├── strapi.tools.ts
│   ├── qdrant.tools.ts
│   └── postgres.tools.ts
└── types/
    └── agent.types.ts
```

### Ticket 3: Build Base Agent Class
- Abstract `BaseAgent` class with:
  - `systemPrompt: string`
  - `tools: AgentTool[]`
  - `llm: BaseChatModel` (configurable, defaults to LM Studio / Ollama)
  - `invoke(query: string, context: Record): Promise<AgentResponse>`
  - Streaming support via Server-Sent Events (SSE)

### Ticket 4: Implement ERP Analyst Agent
- Connects to Odoo JSON-RPC API
- Tools: `queryOdoo(model, domain, fields)`, `getOdooReport(model, options)`
- Use cases:
  - "Show Q3 revenue vs budget" → Odoo accounting queries
  - "What are our top expenses?" → Odoo expense module
  - "List CRM opportunities" → Odoo CRM leads

### Ticket 5: Implement Project Assistant Agent
- Connects to PostgreSQL (projects, tasks, workspaces)
- Tools: `queryProjects()`, `queryTasks()`, `queryWorkspaces()`
- Use cases:
  - "Status of HexaHub redesign" → task status, assignee, due date
  - "What tasks are overdue?" → overdue task query
  - "Generate project timeline" → Gantt-compatible timeline data

### Ticket 6: Implement Sales Agent
- Connects to Odoo CRM module
- Tools: `createLead()`, `updateOpportunity()`, `generateProposal()`
- Use cases:
  - "Create a new lead for Acme Corp"
  - "What's our pipeline status?"
  - "Generate a proposal for Project Alpha"

### Ticket 7: Implement Knowledge Agent
- Connects to Strapi CMS + Qdrant vector DB
- Tools: `searchCms(query)`, `semanticSearchQdrant(query)`, `indexDocument()`
- Use cases:
  - "Find related documents"
  - "What's in our knowledge base about X?"

### Ticket 8: Build Agent Orchestrator
- `AgentsService.chat(messages, context, options)`
- Intent classification: route to single agent or multi-agent
- Multi-agent handoff: one agent can delegate to another
- Streaming response: SSE with agent events (tool call, result, final answer)
- Fallback: original single-LLM chat for non-agent queries

## Phase 2: API Endpoints

### Ticket 9: New REST Endpoints
```
POST /api/ai/agents/chat     — Full agent chat (streaming via SSE)
POST /api/ai/agents/run      — One-shot agent execution
GET  /api/ai/agents/list     — Available agents and their descriptions
GET  /api/ai/agents/memory   — Session memory for a user
```

### Ticket 10: Streaming Integration
- Convert existing SSE endpoint to use agent streaming
- Events: `agent.start`, `tool.call`, `tool.result`, `agent.end`, `message.chunk`

## Phase 3: Frontend — AI Assistant Enhancement

### Ticket 11: Update Frontend API Client
- New methods in `src/lib/api.ts`:
  - `streamAgentChat(messages, context)` → EventSource
  - `getAgentList()` → available agents
  - `runAgent(agentName, query)` → one-shot

### Ticket 12: Create Agent UI Components
```
src/features/ai-agents/
├── components/
│   ├── AgentSelector.tsx       # Dropdown to pick an agent
│   ├── ToolCallIndicator.tsx   # Shows when an agent is calling a tool
│   ├── AgentBadge.tsx          # Agent identity in message list
│   └── FollowUpSuggestions.tsx # Dynamic follow-up questions
├── hooks/
│   ├── useAgentChat.ts         # Streaming chat hook
│   └── useAgentList.ts
├── types/
│   └── agent.ts
└── index.ts
```

### Ticket 13: Migrate ai-assistant/page.tsx
- Replace `apiClient.post('/ai/chat')` with `useAgentChat` hook
- Add agent selection UI
- Show tool call indicators during agent execution
- Display agent identity (avatar + name) for each response
- Add follow-up suggestion chips based on agent response

### Ticket 14: Migrate PortalAiCopilot.tsx
- Route Portal Copilot through the agent system
- Use Knowledge Agent + Project Assistant for portal queries
- Preserve multimodal (image upload) support

## Phase 4: Testing & Quality

### Ticket 15: Backend Tests
- Unit tests for each agent (Jest)
- Integration tests for orchestrator
- Mock Odoo/Strapi/Qdrant/HTTP for tests
- 80% coverage for agent modules

### Ticket 16: Frontend Tests
- Vitest tests for new components
- Agent chat streaming integration test
- Mock SSE response for testing

### Ticket 17: Quality Gates
- TypeScript: 0 `any` types, strict null checks
- ESLint: 0 warnings (`--max-warnings=0`)
- All existing tests still pass (8/8)
- Backend: `npm run lint+typecheck+test` in `apps/api`

## Phase 5: Documentation & Cleanup

### Ticket 18: Documentation
- Update `docs/ARCHITECTURE.md` with agent architecture
- Create `docs/AI_AGENTS.md` — agent developer guide
- Document available tools per agent

### Ticket 19: Environment Configuration
- Add `.env.example` entries for new agent configs:
  - `AI_AGENT_PROVIDER` (lm-studio | ollama | openai)
  - `AI_AGENT_MODEL` (default model name)
  - `ODOO_URL`, `ODOO_DB`, `ODOO_USER`, `ODOO_PASSWORD`
  - `QDRANT_URL`

## Key Decisions
1. **Agent framework**: Build on LangGraph (via `@langchain/langgraph`) — provides agent loop, memory, and tool calling
2. **LLM provider**: Default to LM Studio (existing setup), configurable to Ollama or OpenAI
3. **Streaming**: Server-Sent Events (SSE) — already supported by NestJS
4. **Tool calling**: Each agent gets a set of typed tools (Odoo, PostgreSQL, Strapi, Qdrant)
5. **Orchestration**: Intent classification first, then route to single agent or multi-agent handoff
6. **Backward compatibility**: Old `/api/ai/chat` endpoint remains as fallback

## Risk Assessment
| Risk | Mitigation |
|------|-----------|
| LLM provider not available (LM Studio offline) | Fallback to mock responses + graceful degradation |
| Odoo API rate limiting | Connection pooling + retry with backoff |
| Qdrant connection failures | Graceful degradation to keyword search |
| Breaking existing AI chat | Keep old endpoint, add new endpoint |
| TypeScript strict mode violations | All agent inputs use Zod schemas → runtime validation |
