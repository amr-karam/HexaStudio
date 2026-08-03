# ADR 0004: Next.js 16 App Router & Client Island Architecture

- **Status:** Accepted
- **Date:** 2026-07-22
- **Deciders:** Frontend Architect, Lead WebGL Developer

---

## 1. CONTEXT
Next.js 16 App Router provides Server Components (RSC) for SSR, dynamic ISR revalidation, and Turbopack builds. Heavy WebGL 3D canvas components and interactive client components require client-side hydration.

---

## 2. DECISION
We enforce **Server Components by default** for all public routes (`/`, `/about`, `/projects`, `/blog`, `/services`) to maximize SEO performance and initial load speed. Heavy WebGL components (`SilkShaderBackground`, 3D particle canvases) MUST be encapsulated inside Client Components (`'use client'`) and dynamically imported using `ssr: false`.

---

## 3. CONSEQUENCES
- **Positive:** Pristine initial FCP/LCP load speeds; zero Turbopack build errors regarding `ssr: false` in Server Components.
- **Trade-offs:** Requires careful Client/Server component boundary separation.
