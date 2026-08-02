# AI Architecture

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## AI Strategy

HEXA Vision leverages a **Hybrid AI Approach**, combining large language models (LLMs) for reasoning and content generation with deterministic business logic and structured data from Strapi and Odoo.

## Architecture Diagram

```
[User / Agent]
    │
    ▼
[NestJS BFF] ─── Orchestrator (LangChain / Custom)
    │
    ├── Prompt Library (Versioned)
    ├── Context Injector (RAG) ◄── [Vector DB / PostgreSQL]
    └── Tool Executor (API Calls)
            │
            ▼
[LLM Provider] (GPT-4, Claude 3.5, Gemini 1.5)
            │
            ▼
[Output Parser] ─── Structured JSON ──► [Application Logic]
```

## Core AI Components

### 1. Orchestration Layer
The orchestrator manages the flow of the conversation, decides which tools to call, and ensures the final output follows the required format.
- **Framework:** Custom orchestrator or LangChain.
- **Responsibilities:** State management, tool selection, loop control.

### 2. Context Window & RAG (Retrieval Augmented Generation)
To prevent hallucinations and ensure accuracy, AI agents use RAG:
- **Vector DB:** Stores documentation, ADRs, and project history.
- **Embedding Model:** Converts text to vectors for semantic search.
- **Context Injection:** Relevant snippets from the Playbook are injected into the system prompt.

### 3. Tooling (Function Calling)
AI agents can interact with the system via defined tools:
- `get_project_details(slug)`: Fetches project data from BFF.
- `create_odoo_lead(data)`: Creates a lead in Odoo.
- `update_strapi_content(id, data)`: Updates content in CMS.
- `search_playbook(query)`: Searches the la-logs for standards.

### 4. Output Validation
All AI outputs are passed through a validation layer:
- **Type Checking:** JSON schema validation.
- **Security:** Filter for secrets, PII, or malicious code.
- **Alignment:** Check against `CODING_STANDARDS.md`.

## AI Agent Roles

| Agent | Primary Tool | Goal |
|-------|---------------|------|
| Chief Architect | Playbook Search, ADRs | System integrity |
| Frontend Lead | Design System, R3F docs | Visual excellence |
| Backend Lead | Swagger, DB Schema | API reliability |
| Odoo Architect | Odoo API, Business Logic | Operational efficiency |
| QA Lead | Test Suites, Lighthouse | Zero-defect release |

## Quality Gates for AI

- **Hallucination Check:** Cross-reference output with the la-logs.
- **Formatting Check:** Ensure valid Markdown/JSON.
- **Performance Check:** Measure token usage and latency.
- **Human-in-the-loop:** Critical decisions require human sign-off.

## Future Roadmap (2027-2030)

- **Multi-modal AI:** Direct analysis of 3D scenes and images.
- **Self-healing Code:** AI agents that automatically fix bugs found by Playwright.
- **Predictive Business:** AI that forecasts lead conversion based on project types.
