# Architecture Review: HEXA Vision

**Review Date:** 2026-06-30  
**Architecture Style:** Monorepo Microservices-lite with BFF (planned)

---

## 1. System Design Evaluation

### Strengths

- **Network isolation:** PostgreSQL and Redis on `internal` Docker network with no published ports
- **Observability-first:** Prometheus, Grafana, Loki, Promtail from day one
- **Edge strategy:** Traefik v3 + planned Cloudflare CDN/WAF
- **Sprint 1 foundation:** Feature-based frontend folders, shared `@hexastudio/types` and `@hexastudio/utils`, global error handling
- **Type-first contracts:** `ApiResponse<T>`, `Project`, `User` interfaces defined centrally

### Weaknesses

- **BFF not implemented:** Frontend cannot yet consume aggregated API data
- **Split data ownership risk:** Strapi (content) vs future NestJS domain DB undefined
- **3D/UI state boundary:** No pattern for Three.js state vs React UI state interaction
- **Docker build context:** App-level builds cannot resolve workspace packages
- **No OpenAPI consumer:** Swagger exists but frontend has no generated client

---

## 2. Stack Decision: Next.js vs Vite + React Router

| Aspect | User Brief | Implemented | Recommendation |
|--------|-----------|-------------|----------------|
| Bundler | Vite | Next.js 15 | **Retain Next.js** |
| Routing | React Router | App Router | Retain App Router |
| SSR/SEO | Client SPA | SSR/ISR capable | Next.js advantage for SEO |
| Deployment | Static + nginx | Standalone Node | Already configured |

**Verdict:** Migrating to Vite + React Router would be a **frontend rewrite**, not a refactor. All infrastructure, docs, and Sprint 1 work are Next.js-native. Document Next.js as the canonical stack unless the product owner explicitly mandates Vite.

`react-router-dom` in the repo is a **Strapi admin dependency only**.

---

## 3. Enterprise Standards Comparison

| Feature | Standard | Current State | Rating |
|---------|----------|---------------|--------|
| API Design | OpenAPI/Swagger | Scaffolded at `/api/docs` | B |
| Data Isolation | VPC/Internal Net | Docker internal network | A |
| CI/CD | Automated + Quality Gates | Deploy only | C+ |
| Observability | Full Stack | Prometheus/Grafana/Loki | A+ |
| Type Safety | End-to-End | Shared package; frontend not wired | B- |
| Resilience | Healthchecks/Retries | Docker healthchecks | B+ |
| Testing | Unit + Integration + E2E | None | F |
| Feature Architecture | Domain modules | Sprint 1 in progress | B |

---

## 4. Target Architecture (Clean Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│  Presentation (Next.js)                                     │
│  ├── app/           Routes & layouts                        │
│  ├── features/      Domain UI (portfolio, scene, auth)      │
│  ├── components/ui/ Shared atoms                            │
│  └── hooks/lib/     Cross-cutting utilities                 │
├─────────────────────────────────────────────────────────────┤
│  Application (NestJS BFF)                                   │
│  ├── modules/       auth, projects, health                  │
│  └── core/          filters, guards, interceptors           │
├─────────────────────────────────────────────────────────────┤
│  Content (Strapi CMS)                                       │
│  └── api/           portfolio, blog, services, categories   │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure                                             │
│  PostgreSQL │ Redis │ MinIO │ Traefik │ Cloudflare          │
└─────────────────────────────────────────────────────────────┘
```

### Layer Rules

1. **Frontend** never calls Strapi directly for complex operations — use BFF
2. **Shared types** in `packages/types` are the contract between FE and BE
3. **3D assets** flow: Upload → Process (Draco/KTX2) → MinIO → CDN
4. **Scene components** lazy-loaded via `next/dynamic` with `ssr: false`

---

## 5. Recommended Pivots

| Priority | Pivot | Rationale |
|----------|-------|-----------|
| Critical | Fix monorepo Docker builds | Unblocks CI/CD |
| Critical | Wire shared types in frontend | E2E type safety |
| High | Implement BFF project endpoints | Decouple FE from Strapi |
| High | Define 3D state architecture | Zustand scene slice + R3F bridge |
| Medium | Generate API client from OpenAPI | Eliminate manual fetch types |
| Medium | Asset processing pipeline | Performance budget compliance |

---

## 6. Final Verdict

**Grade: B-** (infrastructure A, application D+)

The foundation is professional and over-engineered in the right ways (observability, isolation). Sprint 1 establishes correct structural patterns. Primary risk is **execution velocity** — converting scaffolding into a functioning 3D platform before scope creep from stack debates.
