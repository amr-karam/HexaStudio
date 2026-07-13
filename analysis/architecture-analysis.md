# HEXA Studio — Architecture Analysis

**Analysis Date:** 2026-07-12  
**Analyst:** Kilo (Automated Codebase Analysis)

---

## 1. Architectural Vision

The HEXA Studio architecture follows a **Decoupled Hybrid Architecture** designed for high-fidelity delivery of 3D architectural visualizations. The system separates concerns into four distinct layers: Presentation, Orchestration, Content, and Data/Infrastructure.

---

## 2. Layer-by-Layer Analysis

### 2.1 Presentation Layer (Frontend)

**Technology:** Next.js 15 + React 19 + R3F + Tailwind CSS 4

**Key Characteristics:**
- **App Router** used for all routing (no Pages directory)
- **SSR/SSG** where possible for SEO, CSR for 3D canvas
- **Feature-based organization** under `src/features/` rather than pure component folders
- **Shared UI library** in `packages/ui` for cross-app consistency

**3D Scene Architecture:**
```
SceneCanvas (R3F Canvas wrapper)
├── ExperienceCanvas (context provider)
├── ArchitecturalModel (GLTF loader)
├── CameraController (GSAP-driven)
├── Hotspot (interactive markers)
└── PostProcessing (effects pipeline)
```

**State Flow:**
- User interaction → Zustand store update → GSAP animation → R3F re-render
- Server data → TanStack Query → cached → Zustand sync

**Performance Strategy:**
- Dynamic imports for Three.js/R3F/GSAP (home route exempted)
- Lazy loading on all non-home routes
- Bundle budget: ≤200KB first-load JS
- Adaptive quality based on device capability

---

### 2.2 Orchestration Layer (Backend)

**Technology:** NestJS + Express

**Module Structure:**
```
AppModule
├── HealthModule           # Liveness/readiness probes
├── ProjectsModule          # Project CRUD + Strapi aggregation
├── ArticlesModule          # Blog/article management
├── ServicesModule          # Service offerings
├── ContactModule           # Contact form handling
├── AuthModule              # JWT + Passport strategy
├── StorageModule           # MinIO file operations
├── RedisModule             # Caching/session store
├── OdooModule              # ERP integration via XML-RPC
├── PortalModule            # Client portal data
├── UsersModule             # User management
├── EmailModule             # Email sending
├── RequestsModule          # Service requests
└── AccountingModule        # Financial data
```

**Cross-Cutting Concerns:**
- **Global Exception Filter** for consistent error responses
- **Validation Pipe** with whitelist + forbidNonWhitelisted
- **Helmet** for security headers
- **Throttler Guard** globally applied for rate limiting
- **CORS** configured with origin whitelist + credentials
- **Swagger** docs in development only

**Authentication Flow:**
```
Login → JWT Strategy (Passport) → RS256 tokens
├── Access Token: 15 min TTL
├── Refresh Token: 7 day TTL
└── Storage: HTTP-only cookies preferred
```

---

### 2.3 Content Layer (CMS)

**Technology:** Strapi 5

**Role:**
- Single source of truth for all content
- Manages projects, articles, services, categories
- Provides media library for 3D model uploads
- JWT-based admin authentication

**Integration Pattern:**
- Strapi → NestJS (BFF transforms data)
- NestJS → Next.js (optimized View Models)
- Frontend never connects to Strapi directly

---

### 2.4 Data & Infrastructure Layer

**Database:**
- PostgreSQL 16 for relational data
- Schema managed via Strapi ORM + custom NestJS repositories
- Healthchecks on all database-dependent services

**Caching:**
- Redis 7 for session storage and 3D asset manifest caching
- Password-protected Redis instance

**Object Storage:**
- MinIO (S3-compatible) for GLB/GLTF models and textures
- Bucket initialization via `minio-init` container
- Console on port 9001 for admin access

**Networking:**
- `hexa_web` network: Frontend-facing services
- `hexa_data` network: Internal-only, database/storage
- `hexa_monitoring` network: Observability tools

---

## 3. Data Flow Diagrams

### 3.1 Asset Pipeline (Heavy Lift)
```
Artist → Strapi Admin → MinIO → [Background Optimization] → Scene Manifest (JSON)
                                                              ↓
Next.js ← NestJS BFF ← Fetch Manifest ← R3F ← useGLTF ← Async Load
```

### 3.2 User Interaction Flow (Light Lift)
```
User clicks hotspot → R3F event → Zustand update
    ↓
Next.js → NestJS BFF → Strapi CMS
    ↓
Transformed View Model ← NestJS BFF ← Strapi Response
    ↓
Zustand state update → GSAP camera transition → UI re-render
```

---

## 4. Architectural Constraints

| Constraint | Requirement | Enforcement |
|-----------|-------------|-------------|
| **Coupling** | Loose | Frontend → NestJS → Strapi (no direct calls) |
| **State** | Stateless | No local session storage in backend |
| **Typing** | End-to-End | Shared `/packages/types` used by all apps |
| **Rendering** | Hybrid | SSR for SEO, CSR for 3D canvas |
| **Security** | Defense in Depth | Traefik → Cloudflare WAF → internal networks |

---

## 5. Design Patterns Identified

### 5.1 Backend-for-Frontend (BFF)
NestJS does not simply proxy Strapi data. It:
- Aggregates multiple CMS content types
- Filters fields specific to the view
- Transforms data shapes for UI consumption
- Adds business logic layer between CMS and UI

### 5.2 Feature Modules
Both frontend and backend use feature-based organization:
- Frontend: `src/features/{portfolio,scene,blog,auth,...}/`
- Backend: `src/modules/{projects,articles,auth,...}/`

### 5.3 Shared Type Package
`packages/types` contains all DTOs and interfaces:
- Ensures Frontend and Backend stay synchronized
- Single source of truth for data shapes
- Prevents "stringly-typed" API contracts

### 5.4 Store-per-Feature
Zustand stores are feature-scoped:
- `asset-store.ts`: 3D model loading state
- `camera-store.ts`: Camera position/animation state
- `app-store.ts`: Global UI state

---

## 6. Integration Points

| Integration | Protocol | Purpose |
|-------------|----------|---------|
| Frontend → Backend | REST/HTTP | All API calls |
| Backend → Strapi | REST/HTTP | Content aggregation |
| Backend → Odoo | XML-RPC | ERP webhooks |
| Backend → MinIO | S3 API | File upload/download |
| Backend → Redis | TCP | Caching/sessions |
| Frontend → R3F | WebGL | 3D rendering |
| Traefik → Cloudflare | Tunnel | Edge routing |

---

## 7. Scalability Considerations

### Current (Monolithic)
- Single NestJS process handles all API routes
- Single PostgreSQL instance
- Single Redis instance
- Single MinIO instance

### Planned Evolution
- **Phase 1:** Current monolith
- **Phase 2:** Extract AI computations to microservices
- **Phase 3:** WebGPU rendering for next-gen 3D

### Horizontal Scaling Readiness
- Backend is stateless (sessions in Redis)
- Frontend is static-rendered where possible
- Database can be read-replicated
- MinIO can be clustered

---

## 8. Observability Stack

| Tool | Purpose | Integration |
|------|---------|-------------|
| Sentry | Error tracking | Frontend + Backend SDKs |
| Prometheus | Metrics collection | Backend metrics exporter |
| Grafana | Dashboard visualization | Prometheus data source |
| Loki | Log aggregation | Promtail sidecar |
| Promtail | Log shipping | Container log collection |

---

## 9. Security Architecture

**Network Security:**
- Traefik terminates all TLS
- Cloudflare WAF filters before traffic reaches server
- Database ports never exposed publicly
- Odoo/Strapi accessible only via internal Docker network

**Authentication:**
- JWT with RS256 algorithm
- HTTP-only cookies preferred
- bcrypt with cost factor 12
- Rate limiting on all endpoints

**Content Security:**
- CSP headers via Traefik middleware
- Helmet.js security headers
- Input validation on all endpoints

---

*End of Architecture Analysis*
