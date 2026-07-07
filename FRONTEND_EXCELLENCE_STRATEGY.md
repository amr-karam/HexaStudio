# Frontend Excellence Strategy

**Goal:** Make HexaStudio the best frontend experience in architectural visualization—fast, cinematic, mobile-native, and SEO-perfect.

---

## Strategy Table

| Pillar | Initiative | Target Metric | Owner / Agent | Status | Blocking Dependencies |
|---:|---|---|---|---|---|
| **P1: Performance** | Audit JS bundle with `@next/bundle-analyzer` | Identify top 5 contributors to `/portfolio/[slug]` 551KB | Dev | Pending | None |
| **P1: Performance** | Lazy-load `PostProcessing`, `ContactShadows`, `SceneContent` in `ExperienceCanvas` | `/portfolio/[slug]` initial JS ≤200KB | Dev | In Progress | None |
| **P1: Performance** | Add `loading.tsx` skeletons for `/portfolio`, `/blog` list pages | Perceived LCP <1.2s on 3G | Dev | Pending | None |
| **P1: Performance** | Preload critical fonts (`Inter`, `Playfair Display`) | LCP <1.2s cold start | Dev | Pending | None |
| **P2: Mobile Luxury** | Implement 3D interaction zones (scroll-lock on canvas touch) | Zero page-scroll/OrbitControls conflict on iOS | Dev | Pending | None |
| **P2: Mobile Luxury** | Disable custom cursor on touch devices; make it opt-in on desktop | No `cursor: none` on touch; desktop retains luxury cursor | Dev | Pending | None |
| **P2: Mobile Luxury** | Adaptive DPR + reduced post-processing on mobile/tablet | Stable 60 FPS on mid-range mobile | Dev | Pending | None |
| **P2: Mobile Luxury** | Touch target audit (min 44x44px) across all CTAs | WCAG 2.1 AA touch compliance | Dev | Pending | None |
| **P3: SEO Grade** | Add `generateStaticParams` to `portfolio/[slug]` and `blog/[slug]` | All project/article pages pre-rendered at build time | Dev | In Progress | `fetchProjects()` / `fetchArticles()` API ready |
| **P3: SEO Grade** | Convert `blog/[slug]` from client `useParams` to server component | Server-rendered article detail with full metadata | Dev | In Progress | `fetchArticle()` helper created |
| **P3: SEO Grade** | Add JSON-LD (`Project`, `Article`, `BreadcrumbList`, `Organization`) to all pages | Rich snippets in Google Search | Dev | Pending | None |
| **P3: SEO Grade** | Dynamic `sitemap.xml` from Strapi + static routes | 100% of content URLs indexed within 24h | Dev | Pending | Backend `/api/sitemap` endpoint |
| **P4: Quality Gates** | Add Playwright job to `.github/workflows/ci.yml` | Navigation + 404 + SEO metadata pass in CI | DevOps | Pending | None |
| **P4: Quality Gates** | Run Lighthouse CI on deployed frontend after each release | Performance ≥90, A11y ≥90, SEO ≥90 | DevOps | Pending | CI artifact upload configured |
| **P4: Quality Gates** | Visual regression baseline: screenshots of all 10 routes | Compare before/after after every Sprint | QA | Pending | Playwright installed |
| **P4: Quality Gates** | Full AGENTS.md §46 Quality Gate review before merge | ≥9.5/10 overall score required | QA | Pending | None |

---

## Execution Order

1. **Sprint A—Bundle & SEO foundation (this week)**
   - Complete lazy-loading patches for `ExperienceCanvas`.
   - Finish `generateStaticParams` for `portfolio/[slug]`, `blog/[slug]`.
   - Convert `blog/[slug]` to server component.

2. **Sprint B—Mobile & perceived performance (next)**
   - Interaction zones, touch targets, adaptive quality tweaks.
   - Skeleton loaders for list pages.
   - Font preload + image priority hints.

3. **Sprint C—CI + visual proof (ongoing)**
   - Playwright in CI.
   - Lighthouse CI + visual regression baseline.
   - Full Quality Gate review.

---

## Success Criteria

| Category | Pass Condition |
|---|---|
| Initial Load JS | ≤200KB on all non-3D routes; 3D route acceptable once navigated |
| Lighthouse Performance | ≥90 on cold test ( throttled mobile ) |
| Lighthouse Accessibility | ≥90 with keyboard-only navigation |
| Lighthouse SEO | ≥90 with dynamic metadata active |
| Mobile Experience | No scroll/zoom conflicts; all CTAs touch-accessible |
| Console Errors | Zero runtime errors on any route in CI |
| Visual Regression | Zero unintended deltas vs. baseline screenshots |
