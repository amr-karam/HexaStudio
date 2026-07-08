# 🌐 HIGH LEVEL DESIGN: THE MACRO BLUEPRINT

**Version:** 1.0 | **Domain:** System Topology | **Standard:** Enterprise-Scale

## 1. THE ARCHITECTURAL CONCEPT: "THE SYMPHONY"
The HEXA architecture is designed as a symphony where the **Content (Strapi)**, **Logic (NestJS)**, and **Experience (Next.js)** play in perfect harmony. There is no "center"; there is only a flow of data from the source to the eye.

---

## 2. SYSTEM TOPOLOGY

### I. The Content Source (The "Composer")
**Strapi 5** acts as the single source of truth. 
- All architectural metadata, project details, and asset links are managed here.
- We use a **Headless** approach, meaning Strapi only provides the data; it has no say in how it is presented.

### II. The Orchestration Layer (The "Conductor")
**NestJS** is the brain of the operation.
- **Aggregation:** It fetches raw data from Strapi and transforms it into "Experience-Ready" JSON.
- **Security:** It handles JWT authentication and RBAC (Role-Based Access Control).
- **Caching:** It utilizes Redis to cache expensive API calls, ensuring the frontend remains instantaneous.

### III. The Experience Layer (The "Performance")
**Next.js 15** delivers the final result.
- **Hybrid Rendering:** Static generation for SEO-critical pages, Client-side rendering for the 3D canvas.
- **Asset Pipeline:** Uses a customized loading strategy to stream 3D assets without blocking the UI thread.
- **Visual Orchestration:** GSAP and Framer Motion handle the transitions between "scenes."

---

## 3. THE DATA LIFECYCLE (THE "FLOW")

`User Action` $\rightarrow$ `Next.js Request` $\rightarrow$ `NestJS BFF` $\rightarrow$ `Strapi CMS` $\rightarrow$ `MinIO (Assets)` $\rightarrow$ `User Eye`

1. **Request:** User enters a project page.
2. **Fetch:** Next.js requests the Project Manifest from NestJS.
3. **Resolve:** NestJS fetches metadata from Strapi and asset URLs from MinIO.
4. **Optimize:** NestJS strips unnecessary data to minimize the payload.
5. **Render:** Next.js uses the manifest to initialize the Three.js scene and trigger the opening animation.

---

## 4. CORE DESIGN DECISIONS

| Decision | Choice | Rationale |
|-----------|---------|------------|
| **Pattern** | BFF (Backend-for-Frontend) | Decouples the frontend from the CMS schema, allowing for rapid UI pivots without changing the backend. |
| **Storage** | S3-Compatible (MinIO) | Allows for massive asset scaling and easy migration to AWS/GCP if needed. |
| **State** | Zustand | Lightweight and fast. Ideal for the high-frequency updates required by a 3D scene. |
| **Styling** | Tailwind 4 | Utility-first approach ensures a consistent design system and minimal CSS bundle. |

---

## 5. SCALABILITY & RESILIENCE
- **Horizontal Scaling:** NestJS is stateless, allowing us to spin up multiple instances behind Traefik.
- **Asset Edge:** Cloudflare CDN ensures that a user in Tokyo and a user in New York both experience the same 60 FPS load time.
- **Graceful Degradation:** If the 3D engine fails to initialize, the site falls back to a high-resolution static image gallery.

*“Complexity is a cost. Simplicity is a luxury.”*
