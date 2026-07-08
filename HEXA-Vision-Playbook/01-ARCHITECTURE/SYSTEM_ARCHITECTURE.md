# 🏗️ SYSTEM ARCHITECTURE: THE HEXA ENGINE

**Version:** 1.0 | **Domain:** Technical Blueprint | **Standard:** Enterprise-Grade

## 1. ARCHITECTURAL VISION
The HEXA Vision architecture is designed for **High-Fidelity Delivery**. The goal is to minimize the "time-to-visual" while maximizing "interactivity." We achieve this through a **Decoupled Hybrid Architecture**.

---

## 2. THE HIGH-LEVEL TOPOLOGY

### I. The Presentation Layer (The "Experience")
- **Framework:** Next.js 15 (App Router) for SEO, Speed, and Routing.
- **3D Core:** React Three Fiber (R3F) $\rightarrow$ Three.js $\rightarrow$ WebGL.
- **Orchestration:** Zustand for global state (client-side) and TanStack Query for server-state synchronization.
- **Visual Polish:** GSAP for cinematic timelines and Framer Motion for UI transitions.

### II. The Orchestration Layer (The "BFF")
- **Framework:** NestJS.
- **Role:** Acts as a **Backend-for-Frontend (BFF)**. It does not just proxy data; it aggregates, filters, and optimizes data specifically for the 3D experience.
- **Communication:** REST API with strict Swagger documentation.
- **Auth:** JWT-based authentication with a centralized Passport strategy.

### III. The Content Layer (The "Source of Truth")
- **Framework:** Strapi 5 (Headless CMS).
- **Role:** Manages all architectural metadata, project descriptions, and asset links.
- **Integration:** Strapi $\rightarrow$ NestJS $\rightarrow$ Next.js.

### IV. The Data & Infrastructure Layer (The "Foundation")
- **Primary DB:** PostgreSQL 16 (Relational data, users, project metadata).
- **Caching/Session:** Redis 7 (High-speed retrieval of 3D asset manifests).
- **Object Storage:** MinIO (S3 Compatible) for hosting heavy 3D models (GLB/GLTF) and high-res textures.
- **Edge:** Cloudflare CDN for global asset delivery and WAF protection.

---

## 3. DATA FLOW & SYNC STRATEGY

### A. The Asset Pipeline (The "Heavy Lift")
1. **Upload:** Artist uploads GLB to Strapi $\rightarrow$ Strapi pushes to MinIO.
2. **Optimization:** A background process optimizes textures and compresses meshes (Draco).
3. **Manifest:** NestJS generates a "Scene Manifest" (JSON) containing all asset URLs and coordinates.
4. **Delivery:** Next.js fetches the manifest $\rightarrow$ R3F loads assets asynchronously using `useGLTF`.

### B. The State Sync (The "Light Lift")
1. **User Interaction:** User clicks a hotspot in the 3D scene.
2. **Request:** Next.js $\rightarrow$ NestJS $\rightarrow$ Strapi.
3. **Response:** NestJS transforms the Strapi response into a "View Model" optimized for the UI.
4. **Update:** Zustand updates the UI, triggering a GSAP camera transition.

---

## 4. ARCHITECTURAL CONSTRAINTS (NON-NEGOTIABLE)

| Constraint | Requirement | Rationale |
|-----------|-------------|------------|
| **Coupling** | Loose | Frontend must not call Strapi directly. All requests go through NestJS. |
| **State** | Stateless | Backend must be horizontally scalable. No local session storage. |
| **Typing** | End-to-End | Shared types in `/packages/types` must be used by both Frontend and Backend. |
| **Rendering** | Hybrid | Static pages for SEO, Client-side rendering for the 3D canvas. |

---

## 5. EVOLUTION PATH (THE ROAD TO 2030)
- **Phase 1:** Monolithic Strapi/NestJS setup.
- **Phase 2:** Migration of heavy computations to Microservices (e.g., AI-driven lighting analysis).
- **Phase 3:** Implementation of WebGPU for next-gen rendering capabilities.

*“Architecture is the art of managing constraints to create a masterpiece.”*
