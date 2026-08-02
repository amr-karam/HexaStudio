# ADR-001: Next.js (App Router) as Frontend Framework

## Status
Accepted

## Date
2025-01-15

## Context
HEXA Vision requires a modern React framework that supports:
- Server-side rendering (SSR) for SEO-critical architectural content
- Static site generation (SSG) for portfolio pages
- Image optimization for high-resolution renders
- File-based routing for intuitive page structure
- API routes for backend-for-frontend (BFF) pattern

## Decision
We will use **Next.js 15 with App Router** as the primary frontend framework.

## Alternatives Considered
| Alternative | Pros | Cons |
|-------------|------|------|
| Vite + React | Faster dev server, simpler setup | No SSR/SSG, manual SEO setup, no image optimization |
| Remix | Built-in loaders, web standards | Smaller ecosystem, less R3F community support |
| Gatsby | Strong SSG, GraphQL data layer | Slower builds, less flexible routing |
| Nuxt (Vue) | Excellent DX, strong ecosystem | Team expertise in React, smaller 3D community |

## Rationale
1. **SEO**: Architecture firms need discoverable portfolio pages — SSR/SSG provides this out of the box.
2. **Image Optimization**: Next.js `Image` component automatically handles responsive images, lazy loading, and modern formats (WebP/AVIF) — critical for high-res architectural renders.
3. **App Router**: Layout nesting simplifies shared UI (Navbar, Footer, SceneErrorBoundary) without prop drilling.
4. **Ecosystem**: Largest React meta-framework community; easier hiring and troubleshooting.
5. **Vercel Integration**: Zero-config deployments with edge functions for global performance.

## Consequences
- Must follow App Router conventions (layouts, loading states, error boundaries).
- Server Components by default; client components only when interactivity is required.
- Requires Node.js 18+ for production builds.

## References
- [Next.js Docs](https://nextjs.org/docs)
- [App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
