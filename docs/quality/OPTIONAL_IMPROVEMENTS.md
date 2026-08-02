# OPTIONAL IMPROVEMENTS — Future Sprints

Non-critical improvements to address in future development cycles.

---

## Architecture

### A1. Clean Up Duplicate Traefik Configs
**Files:** Root `traefik.yml` + `dynamic.yml` vs `docker/traefik/traefik.yml` + `dynamic.yml`
**Suggestion:** Remove root-level Traefik config files. The `docker/traefik/` directory should be the single source of truth. Update `docker-compose.prod.yml` volume mounts if needed.

### A2. Remove Placeholder Modules
**Files:**
- `apps/backend/src/modules/projects/projects.module.placeholder.ts`
- `apps/backend/src/modules/auth/auth.module.placeholder.ts`
- `apps/backend/src/modules/users/users.module.placeholder.ts`
**Suggestion:** Either implement these modules fully or remove the placeholder files. Dead code creates confusion about module status.

### A3. Social Media Links in Footer
**File:** `apps/frontend/src/components/ui/Footer.tsx:54-62`
**Suggestion:** Replace `href="#"` with actual social media URLs (Instagram, LinkedIn, Behance). These are currently dead links.

---

## Code Quality

### C1. Remove `any` Type Annotation
**File:** `apps/frontend/src/features/scene/components/ExperienceCanvas.tsx:41`
```typescript
const controlsRef = useRef<any>(null);
```
**Suggestion:** Type the ref properly using `import { OrbitControls } from '@react-three/drei'` and `useRef<OrbitControls>(null)`.

### C2. Remove Prettier Config
**Suggestion:** No `.prettierrc` found. Add a Prettier config consistent with the ESLint setup to enforce formatting.

### C3. Unused `zod` Dependency in Backend
**File:** `apps/backend/package.json:39`
**Suggestion:** `zod` is imported in `env.ts` but `class-validator` is used for API validation. Consider whether zod is needed or can be replaced with a single validation framework.

---

## Visual Design & Brand Identity

### D1. Expand Favicon/Icons
**Suggestion:** Add multiple favicon sizes and `apple-touch-icon`. Currently only `/logo.webp` is configured as icon.

### D2. 404 Page
**Suggestion:** Create a custom `not-found.tsx` page with brand-consistent design and navigation back to home.

### D3. Loading Skeletons
**Suggestion:** Add skeleton loading states for content sections (project grid, blog list) to improve perceived performance.

---

## UX

### U1. Toast/Notification System
**Suggestion:** Add a toast notification system (e.g., `react-hot-toast` or custom Zustand-based) for form submissions, errors, and success feedback.

### U2. Scroll Position Restoration
**Suggestion:** Ensure scroll position is properly restored on browser back/forward navigation, especially for portfolio grid and blog list pages.

### U3. Form Validation Feedback
**Suggestion:** The contact form (if implemented) should have inline validation error messages, not just backend-driven errors.

---

## Accessibility

### A11y1. `cursor: none` Re-Evaluation
**File:** `apps/frontend/src/app/globals.css:70-76`
**Suggestion:** Consider making the custom cursor opt-in or device-dependent. `cursor: none` on all elements is problematic for:
- Touch device users who see no cursor at all
- Users who expect normal cursor behavior (text selection, resize, etc.)
- Users with motor disabilities who rely on cursor visibility

### A11y2. Add `aria-current` to Nav Items
**File:** `apps/frontend/src/components/ui/nav/Navbar.tsx`
**Suggestion:** Add `aria-current="page"` to the active navigation link for screen reader context.

### A11y3. Focus Trap in Mobile Menu
**File:** `apps/frontend/src/components/ui/nav/Navbar.tsx:126-159`
**Suggestion:** When the mobile menu is open, implement a focus trap to keep keyboard navigation within the menu.

---

## SEO

### S1. Per-Page Metadata
**Suggestion:** Add `generateMetadata` exports to all page files to provide unique titles, descriptions, and OG images per page.

### S2. Canonical URLs
**Suggestion:** Add canonical URL metadata to every page to prevent duplicate content issues.

### S3. `generateStaticParams` for Dynamic Routes
**Suggestion:** For `/portfolio/[slug]` and `/blog/[slug]`, implement `generateStaticParams` to pre-render pages at build time for better SEO and performance.

### S4. Hreflang Tags
**Suggestion:** If multi-language support is planned, add `hreflang` tags. If not, consider adding `hreflang="en"` as a signal.

---

## Performance

### P1. Preload Critical Fonts
**Suggestion:** Add `<link rel="preload">` for Inter and Playfair Display font files to improve LCP.

### P2. Image Optimization Audit
**Suggestion:** Audit all images for proper sizing, WebP/AVIF format, and lazy loading. The `next/image` component is used in some places but may need `priority` on hero images.

### P3. Bundle Analysis
**Suggestion:** Run `@next/bundle-analyzer` to identify which packages contribute most to the 578kB initial JS bundle and prioritize optimization.

---

## Three.js

### T1. Remove Unnecessary Auto-Rotation During Interaction
**File:** `apps/frontend/src/features/scene/components/ArchitecturalModel.tsx:76-78`
**Suggestion:** The model auto-rotates at 0.0005 rad/frame. Consider pausing rotation when user is interacting (orbit controls active) for better UX.

### T2. Add Model Loading Progress
**Suggestion:** The `useAssetLoader` hook doesn't appear to expose loading progress. Add progress tracking and display it via the LoadingScreen component.

### T3. GPU Memory Monitoring
**Suggestion:** For long sessions, consider implementing periodic GPU memory cleanup or warning when memory usage is high.

---

## DevOps

### O1. Health Check Endpoint in CI/CD
**Suggestion:** The deploy workflow should verify the `/api/health` endpoint returns `200 OK` before marking deployment as successful.

### O2. Database Backup Verification
**Suggestion:** The backup service exists but there's no verification step. Add a cron-based verification that backups are restorable.

### O3. Watchtower Schedule
**Suggestion:** Watchtower runs at 6:00 AM daily (`"0 0 6 * * *"`). Consider adding a notification mechanism when updates are applied.

### O4. Log Retention Policy
**Suggestion:** Loki and Promtail are configured but no retention policy is set. Add retention configuration to prevent disk exhaustion.

---

## Testing

### T1. Visual Regression Testing
**Suggestion:** Set up Chromatic or Percy for visual regression testing of UI components and 3D scene screenshots.

### T2. Backend Contract Tests
**Suggestion:** Add contract/integration tests for API endpoints using Supertest or a similar library. Test error cases as well as success paths.

### T3. Playwright E2E Setup
**Suggestion:** Configure Playwright as specified in AGENTS.md Section 22. Create at minimum the "User → Project → 3D View" flow.

---

## Documentation

### D1. Create ADR Directory
**Suggestion:** Per AGENTS.md Section 41, create `docs/ADR/` with decision records for:
- Monorepo structure choice
- BFF pattern with NestJS
- Traefik as reverse proxy
- Cloudflare for CDN/WAF

### D2. Update CHANGELOG
**Suggestion:** The CHANGELOG.md exists but should be reviewed and updated with recent changes before the next release candidate.

### D3. README Improvements
**Suggestion:** The root README.md should document:
- Prerequisites (Node.js version, Docker)
- Local development setup workflow
- How to run tests
- Environment variable setup guide
