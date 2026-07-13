# Next Sprint: AI Evolution Foundation

**Sprint ID:** S-007 | **Focus:** Phase 4 — Intelligence | **Status:** PLANNING

## 1. SPRINT OBJECTIVE

Begin Phase 4 (Intelligence) by laying the groundwork for AI-powered features: vector search infrastructure, AI agent scaffolding, and smart content generation pipeline.

---

## 2. HIGH-PRIORITY DELIVERABLES

### 🧠 AI Infrastructure
- [ ] **Vector Database Setup** — Deploy vector search engine (Qdrant/Weaviate) for architectural project embeddings
- [ ] **Embedding Pipeline** — Auto-vectorize project descriptions, tags, and metadata on Strapi content changes
- [ ] **AI Agent Scaffold** — NestJS-based agent service with tool-calling capability

### 🔍 Smart Search
- [ ] **Semantic Search API** — `/api/search` endpoint combining fulltext + vector similarity
- [ ] **Project Recommendation Engine** — "Similar projects" based on style, material, scale embeddings

### 📊 Content Intelligence
- [ ] **Auto-Tagging** — AI-generated tags for new portfolio projects (architecture style, materials, location)
- [ ] **Smart Summaries** — Auto-generate project descriptions from structured data

### 🔧 Technical Debt
- [ ] **TypeScript strict mode** — Enable `strict: true` across all workspaces
- [ ] **Test coverage** — Push from ~75% to 85% (focus on backend services)
- [ ] **Performance audit** — Lighthouse >95 on all 18 pages

---

## 3. SUCCESS CRITERIA

| Metric | Target |
|--------|--------|
| Vector search latency | <200ms p95 |
| Embedding pipeline | <5s per project |
| Test coverage | ≥85% |
| Lighthouse scores | >95 all categories |

---

## 4. DEPENDENCIES

- Production server resources for vector DB
- OpenAI/Azure API keys for embeddings
- Strapi webhook configuration for content sync

---

*"From visualization to intelligence."*
# Next Sprint

Planning for the upcoming sprint.
