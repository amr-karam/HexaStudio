# Changelog

All notable changes to the HEXA Vision platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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
