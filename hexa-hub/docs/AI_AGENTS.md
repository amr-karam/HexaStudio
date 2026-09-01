# Hermes Multi-Agent System

## Overview

The Hermes Multi-Agent System replaces the single-LLM AI assistant with a
**multi-agent orchestration layer** that routes user queries to specialized
AI agents based on intent classification.

Built on the **OpenAI-compatible API** (LM Studio / Ollama / OpenAI), the system
uses **Hermes-3** LLMs for open-source, locally-runnable agent reasoning.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐
│  Frontend       │     │  Backend (NestJS)│
│  ai-assistant   │────▶│  /ai/agents/chat │
│  page.tsx        │     │  /ai/agents/stream│
└─────────────────┘     └────────┬─────────┘
                                  │
        ┌─────────┬──────────────┼──────────────┬─────────┐
        ▼         ▼              ▼              ▼         ▼
  ┌──────────┐ ┌──────────┐ ┌─────────┐   ┌──────────┐ ┌───────┐
  │ ERP      │ │ Project  │ │ Sales   │   │ Knowledge│ │Memory │
  │ Analyst  │ │ Assistant│ │ Agent   │   │ Agent    │ │(Redis)│
  └──────────┘ └──────────┘ └─────────┘   └──────────┘ └───────┘
       │            │          │             │          │
       ▼            ▼          ▼             ▼          ▼
  ┌─────────┐  ┌─────────┐ ┌─────────┐  ┌─────────┐ ┌─────────┐
  │  Odoo   │  │Postgres │ │   Odoo  │  │ Strapi  │ │ Qdrant  │
  │  API    │  │         │ │   CRM   │  │   CMS   │ │         │
  └─────────┘  └─────────┘ └─────────┘  └─────────┘ └─────────┘
```

## Agents

### 1. ERP Analyst Agent (`erp-analyst`)
- **Color:** Amber (`--color-metric-amber`)
- **Icon:** 📊
- **Purpose:** Odoo ERP data analysis — financial reports, revenue, expenses, CRM pipeline
- **Tools:**
  - `odoo_search_read` — Query any Odoo model with domain filters
  - `odoo_create_lead` — Create CRM leads/opportunities
  - `odoo_financial_query` — Query accounting data (invoices, expenses, payments)
- **Example queries:**
  - "Show me Q3 revenue vs budget"
  - "What are our top 5 expenses this month?"
  - "List all CRM opportunities in the proposal stage"

### 2. Project Assistant Agent (`project-assistant`)
- **Color:** Blue (`--color-info`)
- **Icon:** 📋
- **Purpose:** Project management — task tracking, project status, team workload
- **Tools:**
  - `query_projects` — Search PostgreSQL project/workspace records
  - `query_tasks` — Search tasks with project, assignee, status filters
  - `create_task` — Create new tasks
  - `team_stats` — Get productivity metrics
- **Example queries:**
  - "What's the status of the HexaHub redesign?"
  - "What tasks are overdue?"
  - "Who is overloaded this week?"

### 3. Sales Agent (`sales-agent`)
- **Color:** Emerald (`--color-metric-emerald`)
- **Icon:** 💼
- **Purpose:** CRM and sales operations
- **Tools:**
  - `odoo_search_read` — Query CRM leads/opportunities
  - `odoo_create_lead` — Create new leads with contact details
- **Example queries:**
  - "Create a new lead for Nebula Labs — $50K, Web Dev project"
  - "What's our pipeline status by stage?"
  - "Who are our top prospects this quarter?"

### 4. Knowledge Agent (`knowledge-agent`)
- **Color:** Violet (`--color-metric-violet`)
- **Icon:** 📚
- **Purpose:** Information retrieval — semantic search, CMS content, documents
- **Tools:**
  - `semantic_search` — Vector search in Qdrant
  - `cms_search` — Strapi CMS content search
  - `list_documents` — List documents from MinIO storage
- **Example queries:**
  - "Find documents about the HexaHub redesign"
  - "What's our brand style guide?"
  - "Summarize the client feedback from Project Alpha"

## API Endpoints

All endpoints are under `/api/ai/agents/` and require JWT authentication.

### `POST /ai/agents/chat`
Non-streaming chat. Returns full response + metadata.

**Request:**
```json
{
  "query": "Show me Q3 revenue vs budget",
  "agentName": "erp-analyst",  // optional — auto-detect if omitted
  "context": { "projectId": "abc-123" },
  "stream": false
}
```

**Response:**
```json
{
  "response": "Q3 revenue was €1.2M, 5% above budget...",
  "metadata": {
    "agentName": "erp-analyst",
    "toolsUsed": ["odoo_financial_query"],
    "confidence": 0.95,
    "sources": ["odoo"],
    "executionTimeMs": 150
  }
}
```

### `GET /ai/agents/stream?query=hello&agentName=erp-analyst`
SSE streaming endpoint. Returns real-time events:
- `agent.start` — Agent selected and starting
- `tool.start` — Tool being called
- `tool.result` — Tool output
- `message.chunk` — LLM token stream
- `agent.end` — Agent finished
- `error` — Error occurred

### `GET /ai/agents/list`
Returns all available agents with their personas.

### `GET /ai/agents/memory/session-stats`
Returns session memory statistics (message count, timestamps).

### `POST /ai/agents/memory/clear`
Clears the current session's conversation history.

## File Structure

```
apps/api/src/modules/ai/agents/
├── agents.module.ts              # NestJS module wiring
├── agents.controller.ts          # REST + SSE endpoints
├── agents.service.ts             # Orchestrator (intent routing, session mgmt)
├── base-agent.ts                 # Abstract agent class (tool calling, streaming)
├── types/
│   └── agent.types.ts            # Shared types
├── tools/
│   ├── tool-schemas.ts           # Zod schemas + tool factory
│   ├── odoo.tools.ts             # Odoo API tools
│   ├── postgres.tools.ts         # PostgreSQL/TypeORM tools
│   ├── knowledge.tools.ts        # Qdrant + Strapi tools
│   └── qdrant.service.ts         # Qdrant client wrapper
└── agents/
    ├── erp-analyst.agent.ts      # ERP Analyst agent
    ├── project-assistant.agent.ts # Project Assistant agent
    ├── sales.agent.ts            # Sales Agent
    └── knowledge.agent.ts        # Knowledge Agent
```

```
apps/web/src/features/ai-agents/
├── types/agent.ts                # Frontend types
├── hooks/use-agent-chat.ts       # Streaming chat hook
└── components/
    ├── AgentSelector.tsx         # Agent dropdown
    ├── AgentBadge.tsx            # Agent identity badge
    ├── ToolCallIndicator.tsx     # Tool call visual indicator
    └── FollowUpSuggestions.tsx   # Suggestion chips
```

## Intent Classification

The orchestrator uses keyword-based intent classification (no extra LLM call needed):

| Keywords | Agent |
|---|---|
| revenue, budget, invoice, billing, expense, financial, accounting, profit, margin, q3, q4, quarter, earnings | erp-analyst |
| project, task, timeline, milestone, deadline, overdue, schedule, workload, team, status, roadmap | project-assistant |
| lead, opportunity, pipeline, proposal, prospect, crm, client, sales, deal, conversion, quotation | sales-agent |
| (fallback) | knowledge-agent |

## Configuration

Required environment variables (see `.env.example`):

| Variable | Default | Description |
|---|---|---|
| `LM_STUDIO_BASE_URL` | `http://127.0.0.1:1234/v1` | LM Studio / Ollama / OpenAI endpoint |
| `LM_STUDIO_MODEL` | `NousResearch/hermes-3-llama-3.1-8b` | LLM model name |
| `OPENAI_API_KEY` | (empty) | OpenAI key (falls back to LM Studio) |
| `QDRANT_URL` | `http://qdrant:6333` | Qdrant vector DB endpoint |
| `QDRANT_API_KEY` | (empty) | Qdrant API key (if auth enabled) |
| `STRAPI_URL` | (empty) | Strapi CMS URL |
| `STRAPI_TOKEN` | (empty) | Strapi API token |

## Testing

### Backend Tests
```bash
cd apps/api
npx jest --testPathPattern="agents.service.spec"
```

### Frontend Tests
```bash
cd apps/web
npx vitest run src/features/ai-agents
```

## Migration Guide

The old `/api/ai/chat` endpoint is preserved for backward compatibility.
To migrate existing integrations:

```ts
// Old (deprecated)
const { data } = await apiClient.post('/ai/chat', { messages });

// New (recommended)
const { data } = await apiClient.post('/ai/agents/chat', {
  query: userMessage,
  agentName: 'auto',  // or specific agent name
  context: { projectId: 'abc-123' },
});
```

## Design Decisions

1. **No LangChain dependency** — Built on OpenAI SDK directly for lighter bundle
   and simpler debugging. The agent loop is ~100 lines of NestJS.

2. **LM Studio first** — Defaults to local LLM inference (Hermes-3) for privacy
   and offline support. Falls back to OpenAI if `OPENAI_API_KEY` is set.

3. **Keyword-based routing** — Intent classification uses keyword matching
   (no extra LLM call) for speed and determinism.

4. **Session-based memory** — In-memory session store (30-min TTL). Can be
   upgraded to Redis-backed persistence later.

5. **SSE streaming** — Real-time events via Server-Sent Events for low-latency
   UX. Falls back to non-streaming POST for simpler clients.
