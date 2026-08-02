# 🔍 VECTOR SEARCH & RAG ARCHITECTURE

**Version:** 1.0.0 | **Scope:** Qdrant & Semantic Embeddings | **Standard:** 1536-Dimensional Cosine Similarity

---

## 1. OVERVIEW & SPECIFICATIONS

HEXA Vision uses vector embeddings for semantic project discovery, automated tagging, and Retrieval-Augmented Generation (RAG).

### Technical Specifications
- **Embedding Model**: OpenAI `text-embedding-3-small`
- **Vector Dimension**: 1536
- **Vector DB**: Qdrant (`qdrant/qdrant:latest`) running on port `6333`
- **Collection Name**: `projects`
- **Distance Metric**: Cosine Similarity

---

## 2. API ENDPOINTS & SERVICES

- `POST /api/v1/vector/search/public`: Public semantic search endpoint.
- `EmbeddingService`: Generates 1536-dim vector arrays with normalized zero-vector fallback when API keys are unconfigured.
- `VectorService`: Handles Qdrant collection upserts, payload filtering, and similarity queries.
- `RecommendationService`: Finds similar portfolio projects based on vector proximity.

---

## 3. RELATED DOCUMENTATION

- [AI_ARCHITECTURE.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/docs/ai/AI_ARCHITECTURE.md) — AI architecture.
- [AUTOMATIONS.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/docs/ai/AUTOMATIONS.md) — AI automations.
