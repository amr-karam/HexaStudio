# SEO Report: HEXA Vision

**Report Date:** 2026-06-30

---

## 1. Current SEO State

| Element | Status | Notes |
|---------|--------|-------|
| `<title>` | Basic | Static "HexaStudio" in root layout |
| Meta description | Basic | Static one-liner |
| `lang="en"` | Present | Root layout |
| `generateMetadata` | Not used | No dynamic pages exist |
| Open Graph tags | Missing | — |
| Twitter cards | Missing | — |
| `robots.txt` | Missing | — |
| `sitemap.xml` | Missing | — |
| JSON-LD structured data | Missing | — |
| Canonical URLs | Missing | — |
| Semantic HTML | Partial | `<main>` in HomeHero only |

**SEO Score Estimate:** 30/100 (framework defaults only)

---

## 2. Technical SEO Strategy

### Next.js Metadata API (planned)

```typescript
// Target pattern for portfolio pages
export async function generateMetadata({ params }): Promise<Metadata> {
  const project = await fetchProject(params.slug);
  return {
    title: `${project.title} | HexaStudio`,
    description: project.description,
    openGraph: { images: [project.coverImage] },
  };
}
```

### Rendering Strategy

| Page Type | Strategy | Rationale |
|-----------|----------|-----------|
| Home | SSG | Fast LCP, stable content |
| Portfolio list | ISR (60s) | Fresh CMS content |
| Project detail | ISR + `generateMetadata` | SEO + performance |
| Blog | ISR | Content freshness |

### URL Structure

```
/                          Home
/portfolio                 Project gallery
/portfolio/[slug]          Project detail
/blog                      Blog index
/blog/[slug]               Article
/services                  Services
/about                     About
```

---

## 3. Content SEO (Strapi)

| Task | Priority | Status |
|------|----------|--------|
| Strapi SEO plugin or custom meta fields | High | Not started |
| Portfolio content type with slug | High | Not started |
| Blog content type | Medium | Not started |
| Alt text on all media | High | Not started |
| Category taxonomy | Low | Partial (Category exists) |

---

## 4. Structured Data (JSON-LD)

| Schema | Page | Priority |
|--------|------|----------|
| `ProfessionalService` | Home, About | High |
| `CreativeWork` / `Project` | Portfolio detail | High |
| `Article` | Blog posts | Medium |
| `BreadcrumbList` | All nested pages | Medium |
| `Organization` | Home | High |

---

## 5. Indexing Controls

| File | Configuration |
|------|---------------|
| `robots.txt` | Allow `/`, disallow `/api`, `/admin` |
| `sitemap.xml` | Dynamic from Strapi via Next.js route |
| Canonical | Self-referencing on all pages |

---

## 6. SEO Roadmap

| Task | Priority | Effort | Sprint |
|------|----------|--------|--------|
| Dynamic metadata for portfolio | High | 2 days | Sprint 4 |
| robots.txt + sitemap | High | 1 day | Sprint 4 |
| JSON-LD on home + project | Medium | 2 days | Sprint 5 |
| Strapi SEO fields | High | 1 day | Sprint 2 |
| Open Graph images | Medium | 1 day | Sprint 4 |
| Blog SEO | Medium | 2 days | Sprint 6 |

---

## 7. Stack Advantage

Next.js 15 provides SSR, ISR, Metadata API, and sitemap generation — a significant SEO advantage over a Vite SPA that would require additional tooling (react-helmet-async, prerendering service).

---

## 8. Summary

SEO foundation is framework-default only. The Next.js stack positions the project well; execution depends on CMS schema completion and dynamic metadata implementation in Phase 2–3.
