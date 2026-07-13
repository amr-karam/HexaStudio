# HEXA Studio — Technical Issues

**Analysis Date:** 2026-07-12  
**Severity Levels:** P0 (Critical), P1 (High), P2 (Medium), P3 (Low)

---

## 1. Critical Issues (P0)

### TID-001: Auth Role Mapping Type Mismatch
**Severity:** P0  
**File:** `apps/backend/src/modules/auth/auth.service.ts` (line 94)  
**Impact:** TypeScript type safety violation between shared types and backend implementation

**Issue:**
- `packages/types` defines `User.role: 'admin' | 'editor' | 'user'`
- Backend `mapUser()` maps to only `'admin' | 'user'` (editor becomes user)
- Frontend type system expects 3 roles, backend only produces 2

**Recommendation:** Either expand backend role mapping or update shared type to match reality.

---

### TID-002: N+1 Odoo Queries in ProjectsService
**Severity:** P0  
**File:** `apps/backend/src/modules/projects/projects.service.ts` (lines 70-87)  
**Impact:** Performance degradation with large project lists; could timeout under load

**Issue:**
```ts
const enrichedProjects = await Promise.all(
  projects.map(async (project: Project) => {
    const odooData = await this.odooService.searchRead(...); // Sequential per project
    // ...
  })
);
```

For 50 projects, this makes 50 sequential XML-RPC calls to Odoo.

**Recommendation:** Batch Odoo queries using `search_read` with `[['x_slug', 'in', slugs]]` domain, then map results back to projects.

---

### TID-003: JWT TTL Mismatch with Security Standards
**Severity:** P0  
**File:** `apps/backend/src/modules/auth/auth.service.ts` (lines 33, 50) + `SECURITY_STANDARDS.md`  
**Impact:** Security standard violation; access tokens valid 7 days instead of 15 minutes

**Issue:**
- Security standards specify: Access Token TTL = 15 minutes, Refresh Token TTL = 7 days
- Code sets: `expiresIn: '7d'` for all tokens (both login and refresh)
- No separate short-lived access token implementation

**Recommendation:** Implement dual-token strategy:
- Access token: 15min TTL
- Refresh token: 7d TTL (stored in Redis, not JWT)

---

## 2. High-Priority Issues (P1)

### TID-004: No CSRF Protection on State-Changing Endpoints
**Severity:** P1  
**File:** `apps/backend/src/modules/auth/auth.controller.ts`  
**Impact:** CSRF vulnerability despite sameSite cookies

**Issue:**
- Login, logout, refresh endpoints accept POST requests
- Relies solely on `sameSite: 'lax'` cookie attribute
- No CSRF token validation

**Recommendation:** Add CSRF guard or switch to double-submit cookie pattern.

---

### TID-005: Health Check Calls Expensive Odoo Authentication
**Severity:** P1  
**File:** `apps/backend/src/modules/health/health.controller.ts` (line 14)  
**Impact:** Health check latency; false negatives if Odoo is slow but functional

**Issue:**
```ts
await this.odooService.authenticate(); // Full XML-RPC auth flow
```

Health checks should be lightweight. This calls the full Odoo authentication XML-RPC method.

**Recommendation:** Use Odoo's `/web/health` or a lightweight `/xmlrpc/2/common` `version()` call instead.

---

### TID-006: SceneContent Memory Leak Risk
**Severity:** P1  
**File:** `apps/frontend/src/features/scene/components/SceneContent.tsx`  
**Impact:** WebGL memory leak on component remount

**Issue:**
- `ProceduralArchitecture` creates geometries/materials in `useMemo`
- These are never disposed on unmount
- `ArchitecturalModel` correctly disposes in cleanup, but `ProceduralArchitecture` does not

**Recommendation:** Add `useEffect` cleanup in `ProceduralArchitecture` to dispose geometries and materials.

---

### TID-007: Hardcoded Draco Decoder URL
**Severity:** P1  
**File:** `apps/frontend/src/features/scene/hooks/useAssetLoader.ts` (line 5)  
**Impact:** External dependency for critical 3D functionality; no offline support

**Issue:**
```ts
const DRACO_URL = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';
```

**Recommendation:** Host Draco decoders locally or make URL configurable via env var.

---

### TID-008: Odoo XML-RPC Client Recreated Per Request
**Severity:** P1  
**File:** `apps/backend/src/modules/odoo/odoo.service.ts` (lines 137-141)  
**Impact:** Unnecessary connection overhead; potential resource leak

**Issue:**
```ts
const objectClient = xmlrpc.createClient({ host, port, path: '/xmlrpc/2/object' });
// Created fresh for every execute() call
```

**Recommendation:** Create client once in constructor, reuse for all calls.

---

### TID-009: Scroll Event Not Throttled in useScrollCamera
**Severity:** P1  
**File:** `apps/frontend/src/features/scene/hooks/useScrollCamera.ts` (line 71)  
**Impact:** Jank on scroll; potential frame drops on lower-end devices

**Issue:**
```ts
window.addEventListener('scroll', handleScroll);
// No throttling or requestAnimationFrame
```

**Recommendation:** Use `requestAnimationFrame` or throttle to 60fps max.

---

### TID-010: Article.content Typed as unknown[]
**Severity:** P1  
**File:** `packages/types/index.ts` (line 60)  
**Impact:** Lost type safety for CMS content blocks

**Issue:**
```ts
content: unknown[];
```

This provides zero type safety for Strapi rich text content.

**Recommendation:** Define a `RichTextBlock` interface or use Strapi's content type definition.

---

## 3. Medium-Priority Issues (P2)

### TID-011: Strapi v4/v5 Dual Mapping Technical Debt
**Severity:** P2  
**File:** `apps/backend/src/modules/projects/projects.service.ts` (lines 15-40)  
**Impact:** Code complexity; maintenance burden

**Issue:** Dual format handling for Strapi relations suggests incomplete migration from v4 to v5.

**Recommendation:** Complete Strapi v5 migration and remove v4 compatibility code.

---

### TID-012: No LOD Groups for Complex Models
**Severity:** P2  
**File:** `apps/frontend/src/features/scene/components/ArchitecturalModel.tsx`  
**Impact:** Potential FPS drops with detailed models at distance

**Issue:** Only material-based quality scaling is implemented. No `THREE.LOD` groups for geometry simplification.

**Recommendation:** Implement LOD groups for models with >50k polygons.

---

### TID-013: Circuit Breaker Threshold Too Aggressive
**Severity:** P2  
**File:** `apps/backend/src/modules/odoo/odoo.service.ts` (line 23)  
**Impact:** Unnecessary circuit opens during transient Odoo issues

**Issue:**
```ts
private readonly FAILURE_THRESHOLD = 0.2; // 20% failure rate
```

For an external ERP system, 20% is aggressive. Temporary network blips could open the circuit.

**Recommendation:** Increase to 30-40% or use absolute failure count (e.g., 5 failures in 60s).

---

### TID-014: Missing Error Reporting in 3D Scene
**Severity:** P2  
**File:** `apps/frontend/src/features/scene/components/SceneErrorBoundary.tsx` (line 29)  
**Impact:** 3D errors not tracked in Sentry

**Issue:**
```ts
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  console.error('3D Scene Error:', error, errorInfo); // Only console
}
```

**Recommendation:** Integrate with `@sentry/nextjs` to capture 3D scene errors.

---

### TID-015: OrbitControls Always Mounted
**Severity:** P2  
**File:** `apps/frontend/src/features/scene/components/ExperienceCanvas.tsx` (lines 61-69)  
**Impact:** Unnecessary GPU/CPU overhead when camera is controlled programmatically

**Issue:** `OrbitControls` is always rendered even during cinematic transitions where it's disabled.

**Recommendation:** Conditionally render `OrbitControls` only when user interaction is desired.

---

### TID-016: MinIO listFiles Returns Only Names
**Severity:** P2  
**File:** `apps/backend/src/modules/storage/minio.service.ts` (line 86)  
**Impact:** Consumers cannot filter/sort files without additional API calls

**Issue:** `listFiles()` returns `string[]` (names only). No size, lastModified, or metadata.

**Recommendation:** Return structured objects with metadata.

---

### TID-017: No Content-Type on Upload
**Severity:** P2  
**File:** `apps/backend/src/modules/storage/minio.service.ts` (line 76)  
**Impact:** Incorrect MIME types served to browsers; affects 3D model loading

**Issue:**
```ts
await this.client.putObject(bucket, objectName, buffer, undefined, metadata);
```

`metadata` is optional and not populated with content-type.

**Recommendation:** Auto-detect content-type from file extension or require it in upload API.

---

### TID-018: Basic Email Validation Regex
**Severity:** P2  
**File:** `packages/utils/index.ts` (line 27)  
**Impact:** Invalid emails may pass validation

**Issue:**
```ts
const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

Doesn't cover all valid email formats per RFC 5322.

**Recommendation:** Use a more robust validation library or regex.

---

## 4. Low-Priority Issues (P3)

### TID-019: Inconsistent File Naming
**Severity:** P3  
**Files:** Multiple  
**Impact:** Developer confusion; violates coding standards

**Issue:**
- `use-reduced-motion.ts` (kebab-case)
- Most other files use camelCase (`useAdaptiveQuality.ts`, `useAssetLoader.ts`)

**Recommendation:** Rename to `useReducedMotion.ts` per coding standards.

---

### TID-020: SceneCanvas Redundant Wrapper
**Severity:** P3  
**File:** `apps/frontend/src/features/scene/components/SceneCanvas.tsx`  
**Impact:** Unnecessary abstraction layer

**Issue:**
```ts
export default function SceneCanvas(props: ExperienceCanvasProps) {
  return <ExperienceCanvas {...props} />;
}
```

Pure pass-through with no added value.

**Recommendation:** Remove `SceneCanvas` and use `ExperienceCanvas` directly, or add meaningful abstraction.

---

### TID-021: Model Registry Hardcoded
**Severity:** P3  
**File:** `apps/frontend/src/features/scene/config/model-registry.ts`  
**Impact:** Won't scale to many projects

**Issue:** Only 2 models registered (`default`, `tower`). As portfolio grows, this file will become unwieldy.

**Recommendation:** Load model configurations from backend API alongside project data.

---

### TID-022: No Multipart Upload Support
**Severity:** P3  
**File:** `apps/backend/src/modules/storage/minio.service.ts`  
**Impact:** Large file uploads (>5MB) may fail or be unreliable

**Issue:** Single `putObject` call. MinIO supports multipart uploads for files >5MB.

**Recommendation:** Implement multipart upload for large 3D models.

---

### TID-023: Package Version Inconsistency
**Severity:** P3  
**Files:** Root `package.json` + workspace packages  
**Impact:** Version confusion

**Issue:**
- Root: `1.0.0`
- Workspaces: `0.1.0`

**Recommendation:** Align versions or document the versioning strategy.

---

## 5. Issue Summary

| Severity | Count | Key Areas |
|----------|-------|-----------|
| P0 | 3 | Auth roles, N+1 queries, JWT TTL |
| P1 | 8 | CSRF, health check, memory leaks, Draco URL, XML-RPC, scroll, types |
| P2 | 9 | Strapi migration, LOD, circuit breaker, Sentry, MinIO metadata |
| P3 | 5 | Naming, redundancy, scalability, uploads, versions |

**Total Issues:** 25

---

*End of Technical Issues*
