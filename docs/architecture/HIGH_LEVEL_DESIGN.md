# 🌐 HIGH LEVEL DESIGN: THE MACRO BLUEPRINT

**Version:** 1.2 | **Domain:** System Topology | **Standard:** Enterprise-Scale
**Last Updated:** 2026-09-04

---

## 1. THE ARCHITECTURAL CONCEPT: "THE SYMPHONY"

The HEXA architecture is designed as a symphony where the **Content (Strapi)**, **Logic (NestJS)**, and **Experience (Next.js)** play in perfect harmony. There is no "center"; there is only a flow of data from the source to the eye.

---

## 2. SYSTEM TOPOLOGY

### I. The Content Source (The "Composer")

**Strapi 5** acts as the single source of truth.
- All architectural metadata, project details, and asset links are managed here.
- We use a **Headless** approach, meaning Strapi only provides the data; it has no say in how it is presented.
- **New:** Article `isPublished` Boolean field for draft/published workflow (Aug 2026).

### II. The Orchestration Layer (The "Conductor")

**NestJS** is the brain of the operation.
- **Aggregation:** It fetches raw data from Strapi and transforms it into "Experience-Ready" JSON.
- **Security:** It handles JWT authentication and RBAC (Role-Based Access Control).
- **Caching:** It utilizes Redis to cache expensive API calls, ensuring the frontend remains instantaneous.
- **AI Engine:** Multi-provider AI (Gemini 2.5 Flash, OpenAI GPT-4o-mini, Claude, Grok, DeepSeek, Local LM Studio) with structured output services for spatial synthesis, auto-tagging, and predictive analytics.
- **Agent Runtime:** Autonomous agent personas with Redis-backed memory and tool execution (Database, MinIO, Odoo, Vector Search).

### III. The Experience Layer (The "Performance")

**Next.js 16** delivers the final result.
- **Hybrid Rendering:** Static generation for SEO-critical pages, Client-side rendering for the 3D canvas.
- **Asset Pipeline:** Uses a customized loading strategy to stream 3D assets without blocking the UI thread.
- **Visual Orchestration:** GSAP and Framer Motion handle the transitions between "scenes."
- **Cinematic Routes:** `/story` route — Z-axis cinematic walkthrough with GSAP ScrollTrigger (4 narrative beats, atmospheric fog, reduced motion support).
- **Design System:** Silent Luxury theme — `sl-void` (`#0A0A0B`), `sl-alabaster` (`#F5F4F2`), `sl-gold` (`#D4AF37`) tokens; Cormorant Garamond + Jost typography.
- **Dynamic Route Resilience:** All dynamic routes (`/blog/[slug]`, `/projects/[slug]`, `/portal/projects/[id]`, `/portal/review/[id]`) implement `error.tsx` + `loading.tsx` boundaries with Sentry capture and retry navigation.

### IV. The Data & Infrastructure Layer (The "Foundation")

- **Primary DB:** PostgreSQL 16 (Relational data, users, project metadata).
- **Caching/Session:** Redis 7 (High-speed retrieval of 3D asset manifests, agent memory, session state).
- **Object Storage:** MinIO (S3 Compatible) for hosting heavy 3D models (GLB/GLTF) and high-res textures.
- **Edge:** Cloudflare CDN for global asset delivery and WAF protection (Tunnel-based ingress).
- **Reverse Proxy:** Traefik v3 (Single ingress, dynamic config, Cloudflare Tunnel integration).
- **ERP:** Odoo 17 (Community/Enterprise) — JSON-RPC API client, CRM leads & billing sync.
- **Container Orchestration:** Docker Compose (Blue/Green deployment on `19.16.1.100`).
- **CI/CD:** GitLab CE (Self-hosted) — 6-stage pipeline (Quality → Build → Image → Validate → Mobile → Deploy).

---

## 3. THE DATA LIFECYCLE (THE "FLOW")

`User Action` → `Next.js Request` → `NestJS BFF` → `Strapi CMS` → `MinIO (Assets)` → `User Eye`

1. **Request:** User enters a project page (or `/story` cinematic route).
2. **Fetch:** Next.js requests the Project Manifest (or Story Manifest) from NestJS.
3. **Resolve:** NestJS fetches metadata from Strapi and asset URLs from MinIO.
4. **Optimize:** NestJS strips unnecessary data to minimize the payload.
5. **Render:** Next.js uses the manifest to initialize the Three.js scene and trigger the opening animation (or GSAP ScrollTrigger narrative).

---

## 4. CORE DESIGN DECISIONS

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Pattern** | BFF (Backend-for-Frontend) | Decouples the frontend from the CMS schema, allowing for rapid UI pivots without changing the backend. |
| **Storage** | S3-Compatible (MinIO) | Allows for massive asset scaling and easy migration to AWS/GCP if needed. |
| **State** | Zustand | Lightweight and fast. Ideal for the high-frequency updates required by a 3D scene. |
| **Styling** | Tailwind 4 + CSS Variables | Utility-first approach ensures a consistent design system and minimal CSS bundle. Silent Luxury tokens via `sl-*` CSS variables. |
| **3D Colors** | TypeScript Mirror (`color-tokens.ts`) | Canonical token values exported for Three.js/WebGL contexts where CSS `var()` is unavailable. |
| **CI/CD** | GitLab CE (Self-hosted) | Full control over runners, registry, and secrets; no SaaS dependency. |
| **Ingress** | Traefik v3 + Cloudflare Tunnel | Single ingress proxy; zero-trust edge; no public port exposure. |

---

## 5. SCALABILITY & RESILIENCE

- **Horizontal Scaling:** NestJS is stateless, allowing us to spin up multiple instances behind Traefik.
- **Asset Edge:** Cloudflare CDN ensures that a user in Tokyo and a user in New York both experience the same 60 FPS load time.
- **Graceful Degradation:** If the 3D engine fails to initialize, the site falls back to a high-resolution static image gallery.
- **Dynamic Route Boundaries:** `error.tsx` + `loading.tsx` on all dynamic routes prevent app-wide crashes; Sentry captures errors for observability.
- **WebGL Context Loss Recovery:** `useContextLossRecovery` hook pauses R3F render loop on context loss, shows static fallback, restores via `restartKey` remount.
- **AbortController Timeouts:** 6-second timeout on admin/backend data fetches prevents hanging requests.

---

## 6. EVOLUTION PATH (THE ROAD TO 2030)

- **Phase 1 (Current):** Monolithic Strapi/NestJS setup with Blue/Green deployment.
- **Phase 2:** Migration of heavy computations to Microservices (e.g., AI-driven lighting analysis, spatial synthesis workers).
- **Phase 3:** Implementation of WebGPU for next-gen rendering capabilities.
- **Phase 4:** Full Autonomous Studio — AI agents managing project lifecycles end-to-end.

---

*"Architecture is the art of managing constraints to create a masterpiece."*