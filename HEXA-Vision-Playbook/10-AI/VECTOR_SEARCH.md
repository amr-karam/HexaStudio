# Vector Search & AI-Powered Discovery

HEXA Studio's semantic search and AI-powered content discovery system, powered by OpenAI embeddings and Qdrant vector database.

## Architecture Overview

```
┌─────────────┐     ┌──────────────────┐     ┌──────────┐
│  Frontend   │────▶│  NestJS Backend  │────▶│  Qdrant  │
│  (Next.js)  │     │  (AI + Vector)   │     │  (vDB)   │
└─────────────┘     └────────┬─────────┘     └──────────┘
                             │
                    ┌────────▼─────────┐
                    │     OpenAI API    │
                    │  (Embeddings+GPT) │
                    └──────────────────┘
```

## Components

### EmbeddingService (`src/modules/ai/embedding.service.ts`)
- Generates 1536-dimensional vectors using OpenAI `text-embedding-3-small`
- Initializes on module load with graceful fallback if API key is missing
- `generateEmbedding(text)` — converts text to vector via OpenAI API
- `embedProject(project)` — generates embedding and upserts to Qdrant `projects` collection
- Falls back to normalized placeholder vectors when OpenAI is unavailable

### AutoTagService (`src/modules/ai/auto-tag.service.ts`)
- Generates contextual tags for projects using GPT (`gpt-4o-mini`)
- Extracts 5-10 relevant tags from project metadata (title, description, services, category)
- Falls back to keyword extraction when OpenAI is unavailable
- Returns lowercase, deduplicated tag arrays

### VectorService (`src/modules/vector/vector.service.ts`)
- Manages Qdrant client connection and operations
- `search(collection, request)` — semantic search using generated embeddings
- `searchByVector(collection, vector, limit)` — direct vector similarity search
- `upsert(collection, points)` — insert/update vectors
- `delete(collection, id)` — remove vectors
- Auto-creates collections on startup if they don't exist

### RecommendationService (`src/modules/vector/recommendation.service.ts`)
- Finds similar projects using vector similarity
- `getSimilarProjects(slug, limit)` — returns up to `limit` similar projects with scores
- Uses the project's embedding to search for nearest neighbors

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/vector/search/public` | No | Public semantic search |
| GET | `/vector/recommendations/:slug` | No | Get similar projects |
| POST | `/vector/tags/:slug` | Yes | Auto-generate project tags |
| GET | `/projects/:slug/similar` | No | Similar projects (alias) |

### Semantic Search Request
```json
POST /vector/search/public
{
  "query": "modern sustainable architecture",
  "limit": 10,
  "collection": "projects"
}
```

### Search Response
```json
{
  "results": [
    {
      "id": "project-id",
      "score": 0.92,
      "payload": {
        "slug": "modern-villa",
        "title": "Modern Sustainable Villa",
        "category": "Residential"
      }
    }
  ],
  "total": 1,
  "query": "modern sustainable architecture"
}
```

## Configuration

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | — | OpenAI API key (required for real embeddings) |
| `OPENAI_MODEL` | `gpt-4o-mini` | GPT model for auto-tagging |
| `OPENAI_EMBEDDING_MODEL` | `text-embedding-3-small` | Embedding model (1536 dims) |
| `QDRANT_URL` | `http://localhost:6333` | Qdrant server URL |
| `QDRANT_API_KEY` | — | Qdrant API key (optional) |

### Qdrant Collection Schema
- **Collection:** `projects`
- **Vector size:** 1536 (OpenAI text-embedding-3-small)
- **Distance:** Cosine

## Fallback Behavior

The system is designed to work without OpenAI:
- If `OPENAI_API_KEY` is not set, embeddings use normalized placeholder vectors
- If OpenAI API calls fail, the system falls back to placeholder vectors
- Auto-tagging falls back to keyword extraction from project text
- This allows development and testing without API costs

## Module Dependencies

```
AIModule ←→ VectorModule ←→ ProjectsModule
   │              │                │
   │              │                │
   └── forwardRef ┘── forwardRef ──┘
```

Circular dependencies are resolved using NestJS `forwardRef` on all three module imports.

## Testing

- `test/ai/embedding.service.spec.ts` — 4 tests (generation, dimensions, project embedding)
- `test/ai/auto-tag.service.spec.ts` — 3 tests (tag generation, empty input handling)
- `test/vector/vector.service.spec.ts` — 3 tests (upsert, delete, service init)
# Vector Search

Implementation of RAG and vector search.
