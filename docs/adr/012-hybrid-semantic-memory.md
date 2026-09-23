# ADR-012: Hybrid Semantic Memory Architecture

## Status
Completed — Sep 23, 2026

## Context
The agent system previously used only Redis-backed conversation history and durable facts (`AgentMemoryService`). This provided continuity within a session but no cross-session or long-term recall. Users returning after session expiration lost all context.

## Decision
Implement a hybrid memory architecture:
- **Short-term (Redis)**: Conversation transcript (`agent:memory:{persona}:{sessionId}`) with 24h TTL and durable facts hash (`agent:facts:{persona}:{sessionId}`) with 7d TTL.
- **Long-term (Qdrant)**: Vector embeddings of durable facts (`VECTOR_COLLECTION = 'agent_memories'`) using `EmbeddingService.generateEmbedding()`. Cross-session recall via `semanticRecall()` filters by persona.
- **Injection**: `AgentsService.chat()` queries `semanticRecall()` with the current user message and injects `[Recalled Memory ...]` blocks as high-priority system context before history hydration.

## Consequences
- Agents maintain continuity across expired sessions.
- Semantic recall is persona-scoped, preventing cross-contamination.
- The `remember()` method writes to both Redis and Qdrant atomically; `semanticRecall()` reads only from Qdrant.
- Performance: vector search is sub-second for small collections; future scaling requires Qdrant shard tuning.
