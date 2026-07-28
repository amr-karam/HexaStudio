# Changelog

All notable changes to the HEXA Vision platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.8.0] — 2026-07-27

### Sprint 19 — Mobile & Web Performance (IN PROGRESS)

#### Added
- **Dead Three.js Code Removal**: Removed 11 unused files (BlueprintParticles, SplineField, ForceField, ParticleSimulation, HeroBloom, HexaCrystal, SceneModel, MeshDistortion, LivingBlueprintHero, shaders, entire features/experience/engine). Cleaned up barrels and empty directories. ~25 KB bundle reduction.
- **Bundle Budgets Enforced**: 200KB JS per-route budget via webpack `config.performance` with production build errors.
- **Bundle Analyzer**: Enhanced configuration producing static HTML report + stats JSON when `ANALYZE=true`.
- **OpenTelemetry Tracing**: Backend instrumentation added with trace propagation across services.
- **Request ID Propagation**: `RequestIdMiddleware` generates and propagates `X-Request-ID` header across all services for end-to-end request tracking.
- **Tempo Tracing Service**: `grafana/tempo:2.6.1` added to `docker-compose.prod.yml` with Grafana datasource configuration.
- **Enterprise Architecture Governance Framework**: 11 documents, 7,831 lines defining architecture standards, CI/CD governance, and decision record processes.
- **3 New Architecture Decision Records**:
  - ADR-007: Routing & Layout Strategy
  - ADR-008: Persistent Experience Layer
  - ADR-009: Bidirectional Strapi-Odoo Sync
- **Mobile App v1.0 Core**:
  - Tab navigation finalized as Dashboard / Projects / Notifications / Profile (Invoices tab removed).
  - Offline-first project data caching with `@react-native-async-storage/async-storage`, TTL support, and animated offline banner.
  - Push notification integration (`expo-notifications`) with permission handling, token registration, and backend `POST /api/mobile/push/register` endpoint.
  - App store assets generated (icon, splash, adaptive icon, notification icon, favicon) and wired into `app.json`.
  - OTA updates integration (`expo-updates`) with launch check, download banner, and restart prompt.
  - New test suites for cache, network status, notifications service, and OTA updates.

#### Quality
- TBT at 60ms (target: <100ms) — already exceeding target
- Frontend typecheck: 0 errors
- Frontend lint: 0 errors
- Backend typecheck: 0 errors
- Backend lint: 0 errors
- Mobile typecheck: 0 errors
- Mobile lint: 0 errors
- Backend tests: 285/285 passing
- Frontend tests: 176/176 passing
- Mobile tests: 25/25 passing

---

## [1.3.0] — 2026-07-24

### Added
- **Digital Artisan Design System**: Premium immersive visual upgrade across five core sections.
- **SilkShaderBackground**: Lightweight WebGL silk/iridescence shader (~3KB gzipped) delivering a Stripe-grade animated mesh-gradient hero effect on the About hero and CTA sections.
- **LiquidGlassCard**: Interactive glass-morphism card with mouse-reactive gold radial highlight, used on About CTA, CTASection (collaboration), and ProcessSection step cards.
- **Spring Physics Motion Upgrade**: All staggered in-view transitions migrated from cubic-bezier easing to Framer Motion spring physics (`stiffness`/`damping`) on NewsletterSection, CTASection, ProcessSection, and Footer link reveals.
- **Footer Artisan Upgrade**: Footer migrated to `artisan-glass-gold` backdrop with staggered spring-animated link reveals across nav, legal, and social columns.

### Changed
- About hero: SilkShader as background layer beneath gradient-radial-gold.
- About CTA: Wrapped in `LiquidGlassCard goldAccent` with SilkShader background.
- CTASection: Content wrapped in `LiquidGlassCard goldAccent`; SilkShader ambient layer added; all staggered reveals switched to spring physics.
- NewsletterSection: `childVariants` transition changed from `DURATION.component`/`EASE.entrance` to `type: 'spring'`.
- ProcessSection: Step cards replaced plain `bg-surface/30 border` with `LiquidGlassCard goldAccent` + spring entry animation.
- Design System documented: Glass-morphism tokens (`artisan-glass`, `artisan-glass-gold`) and spring motion tokens.

### Quality
- TypeScript strict mode: clean `tsc --noEmit` with zero errors.
- Reduced motion respected: all spring animations gracefully degrade via `useReducedMotion()` or `prefers-reduced-motion` query.

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
