# Changelog

All notable changes to the HEXA Vision platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.2.0] — 2026-07-15

### Added
- **AI Vector Search**: Real OpenAI `text-embedding-3-small` embeddings (1536-dim) powering semantic search.
- **Semantic Search endpoint**: `POST /vector/search/public` with real embeddings.
- **Auto-Tagging**: GPT-powered tag generation with keyword-extraction fallback.
- **Recommendations engine**: Vector-similarity "similar projects" via `RecommendationService`.
- **Vector Sync**: `VectorSyncService` for embedding and syncing projects to Qdrant.
- **LightingService**: AI-driven lighting suggestions using the embedding pipeline (`lighting_presets`).
- **Test coverage**: `recommendation.service.spec.ts`, `vector-sync.service.spec.ts`, `PageTransition.spec.tsx`, `SmoothScroll.spec.tsx`.

### Changed
- Centralized motion tokens (`EASE.entrance`, `DURATION`) across experience components.
- Reduced-motion handling hardened (Navbar focus trap, LoadingScreen, Counter, ScrollFadeIn).
- Backend scoped out of the Vercel build workspace (deployed via Docker).

### Removed
- Dead `Scene.tsx` 3D component (superseded by `ArchitecturalModel` / experience canvas).

### Quality
- 144 passing tests (80 backend + 64 frontend) at sprint close; 0 typecheck/lint errors.

## [1.1.0] — 2026-07-13

### Added
- Client Portal foundation: `/client` dashboard, role-based redirection, scoped Client API.
- Real-time client notifications.

### Security
- RBAC enforcement: `CLIENT` role cannot access `EMPLOYEE` / `SUPER_ADMIN` resources.
