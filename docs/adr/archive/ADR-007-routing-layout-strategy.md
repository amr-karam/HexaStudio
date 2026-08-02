# ADR-007: Routing and Layout Strategy

**Status:** Accepted
**Date:** 2026-07-08
**Deciders:** Frontend Lead

---

## Context

The platform has three distinct user-facing areas: the public marketing site, a client portal, and an admin dashboard. Each area has different navigation, layout, and authentication requirements.

## Decision

Use **Next.js App Router with route groups** and **separate layouts** for each area.

### Route Structure

```
/                   → Public (RootLayout)
├── portfolio        → Public portfolio listing
├── portfolio/[slug] → Public project detail (dynamic)
├── about            → Public about page
├── services         → Public services page
├── contact          → Public contact page
├── blog             → Public blog listing
├── blog/[slug]      → Public blog post
├── portal/          → Client portal (PortalLayout)
│   ├── login        → Portal authentication
│   └── (dashboard)  → Protected portal pages
├── admin/           → Admin dashboard (AdminLayout)
│   └── requests     → Admin request management
├── studio           → Static studio page
├── privacy          → Static legal page
└── terms            → Static legal page
```

### Layout Strategy

- **RootLayout**: Global providers, Navbar, Footer, Cursor, SmoothScroll, BackToTop, Preloader
- **PortalLayout**: Reuses root elements but with portal-specific metadata
- **AdminLayout**: Reuses root elements with admin-specific metadata

### Rendering Strategy

- Static pages: /, /about, /services, /contact, /studio, /privacy, /terms
- SSG with revalidation: /portfolio (1h), blog/[slug], /
- Dynamic: /portfolio/[slug] (server-rendered)
- Client-only: /portal, /admin (auth required)

## Consequences

### Positive
- Clear separation of concerns between areas
- Shared Navbar, Footer, and providers across all routes
- Each area can have independent loading states
- SEO-optimized for public pages

### Negative
- Layout nesting adds complexity
- Portal/admin layouts duplicate some root layout code
- Authentication logic must be shared between portal and admin

## Verification

- Public pages are statically generated where possible
- Portal/admin pages require authentication
- Navigation works correctly across all areas
- Metadata is correct for each route
