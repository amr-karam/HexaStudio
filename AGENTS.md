# AGENTS.md — AI Operating Manual for HEXA Vision

This document is the **single source of truth** and the permanent operating manual for all AI Agents contributing to the HEXA Vision project. Every agent must read and adhere to these guidelines to ensure architectural consistency, production-grade quality, and seamless collaboration.

---

## 1. Project Overview
HEXA Vision (HexaStudio.net) is a world-class 3D Architecture Visualization platform. It is designed to showcase architectural projects through immersive, interactive 3D experiences with an "Awwwards-level" visual aesthetic, backed by an enterprise-grade software architecture.

## 2. Mission
To bridge the gap between technical architectural data and high-end visual storytelling, providing a seamless, high-performance web interface for exploring 3D architectural spaces.

## 3. Vision
To become the industry standard for online architectural presentations, where performance, accessibility, and visual fidelity coexist without compromise.

## 4. Technology Stack
### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS 4
- **3D Engine:** Three.js, React Three Fiber (R3F), @react-three/drei
- **Animation:** GSAP, Framer Motion
- **State Management:** Zustand (Client), TanStack Query (Server)
- **Observability:** Sentry

### Backend
- **Framework:** NestJS
- **API:** REST (Swagger)
- **Auth:** JWT, Passport
- **Validation:** class-validator
- **Security:** Helmet, @nestjs/throttler

### CMS
- **Framework:** Strapi 5 (Headless)
- **Content Types:** Portfolio, Blog, Services, Categories, SEO Content

### Infrastructure & Data
- **Databases:** PostgreSQL 16, Redis 7
- **Storage:** MinIO (S3 Compatible)
- **Reverse Proxy:** Traefik v3
- **Edge:** Cloudflare (CDN/WAF)
- **Monitoring:** Prometheus, Grafana, Loki, Promtail
- **Orchestration:** Docker Compose

## 5. Repository Structure
The project follows a monorepo structure:
- `/apps/frontend`: Next.js application.
- `/apps/backend`: NestJS API.
- `/apps/cms`: Strapi CMS.
- `/packages/types`: Shared TypeScript interfaces and DTOs.
- `/packages/utils`: Shared helper functions.
- `/docker`: Infrastructure configurations (traefik, postgres, redis, minio, etc.).
- `/docs`: High-level architectural documentation.
- `/scripts`: Deployment and setup scripts.

## 6. Architecture Principles
- **Separation of Concerns:** Strictly decouple UI, Business Logic, and Data Management.
- **BFF Pattern:** The NestJS API acts as a Backend-for-Frontend, aggregating data from Strapi and internal DBs.
- **Type-First Development:** Always define shared types in `/packages/types` before implementing features.
- **Statelessness:** Backend services must remain stateless to allow horizontal scaling.
- **Security-by-Default:** Data stores are isolated on the `internal` Docker network; no public exposure of DB ports.

## 7. Coding Standards
- **TypeScript:** Strict mode enabled. No `any` types. All function signatures must be typed.
- **Naming:** 
  - Components: PascalCase (`ProjectGallery.tsx`).
  - Functions/Variables: camelCase (`calculateLOD()`).
  - Constants: UPPER_SNAKE_CASE (`MAX_SESSIONS`).
  - Files: kebab-case (`user-auth.service.ts`).
- **Formatting:** Prettier/ESLint configured. No trailing spaces.
- **Comments:** Do NOT add comments unless explaining "Why", not "What". Code must be self-documenting.

## 8. Git Workflow
- **Linear History:** Prefer rebasing over merging for feature branches.
- **Atomic Commits:** Each commit should address one logical change.
- **Verification:** Run `npm run lint` and `npm run build` before any commit.

## 9. Branch Strategy
- `main`: Production-ready code. Protected.
- `develop`: Integration branch for features.
- `feature/feature-name`: Individual feature development.
- `bugfix/issue-id`: Targeted bug fixes.
- `hotfix/issue-id`: Critical production fixes.

## 10. Commit Convention
Follow Conventional Commits:
- `feat: ...` (New feature)
- `fix: ...` (Bug fix)
- `docs: ...` (Documentation changes)
- `style: ...` (Formatting, missing semi-colons, etc; no code change)
- `refactor: ...` (Code change that neither fixes a bug nor adds a feature)
- `perf: ...` (Performance improvement)
- `test: ...` (Adding missing tests or correcting existing tests)
- `chore: ...` (Updating build tasks, package manager configs, etc)

## 11. Pull Request Rules
- **Description:** Must include "What", "Why", and "How to test".
- **Screenshots:** Required for all UI/UX changes.
- **Checklist:** Must pass CI (Build, Lint, Test).
- **Approvals:** Minimum one human or senior agent review.

## 12. Code Review Checklist
- [ ] Does it follow the established architecture?
- [ ] Are types strictly defined (no `any`)?
- [ ] Does it introduce any performance regressions in 3D rendering?
- [ ] Is it accessible (WCAG 2.1 AA)?
- [ ] Are secrets handled via environment variables?
- [ ] Is there a corresponding update in the documentation?

## 13. Design System Rules
- **Tailwind 4:** Use utility classes exclusively. Avoid custom CSS files.
- **Consistency:** Use a centralized `tailwind.config` for colors, spacing, and typography.
- **Responsiveness:** Mobile-first approach. Test on 320px, 768px, 1024px, and 1440px.

## 14. UI/UX Principles
- **Awwwards Aesthetic:** Focus on whitespace, typography, and smooth transitions.
- **Minimalism:** Remove any element that does not add value to the visualization.
- **Feedback:** Every user interaction must have a visual or haptic response.

## 15. Three.js Guidelines
- **Optimization:** Use `InstancedMesh` for repetitive objects.
- **Memory Management:** Always dispose of geometries and materials when components unmount.
- **Asset Loading:** Use `useGLTF` from `@react-three/drei` with Draco compression.
- **Lighting:** Prefer baked lighting for static scenes; use a single `DirectionalLight` for dynamic elements.

## 16. Animation Guidelines
- **GSAP:** Use for complex, timeline-based cinematic sequences.
- **Framer Motion:** Use for simple UI transitions and layout animations.
- **Easing:** Avoid linear animations; use `power3.out` or custom cubic-beziers for a natural feel.
- **Orchestration:** Animations must be synchronized with the 3D camera movement.

## 17. Performance Budget
- **Initial Load:** LCP < 1.2s.
- **Frame Rate:** Stable 60 FPS in the 3D scene.
- **Bundle Size:** Keep frontend JS bundle < 200KB (initial).
- **Asset Size:** Individual 3D models < 5MB (compressed).

## 18. Accessibility Standards
- **Dual-Interface:** Implement a semantic DOM parallel to the 3D scene for screen readers.
- **Keyboard Nav:** All 3D hotspots must be reachable via `Tab`.
- **Reduced Motion:** Respect `prefers-reduced-motion` by disabling heavy animations.
- **Contrast:** Minimum 4.5:1 contrast ratio for all text.

## 19. SEO Standards
- **Dynamic Metadata:** Use Next.js `generateMetadata` for every project/blog page.
- **Structured Data:** Implement JSON-LD for `ProfessionalService` and `Project`.
- **Sitemaps:** Automatically generate `sitemap.xml` from Strapi content.

## 20. Security Rules
- **Internal Net:** No DB/Cache ports exposed to the public.
- **Input Validation:** All API inputs must be validated via `class-validator`.
- **Headers:** Traefik must enforce HSTS, X-Frame-Options, and CSP.
- **Auth:** Passwords must be hashed (Bcrypt); tokens must have a strict TTL.

## 21. Documentation Standards
- **Living Docs:** Update `ARCHITECTURE.md` immediately when architectural changes occur.
- **Self-Documenting:** Prioritize clean code over comments.
- **API Docs:** Keep Swagger updated via NestJS decorators.

## 22. Testing Strategy
- **Unit Tests:** Logic-heavy utilities in `/packages/utils` and Backend Services.
- **Integration Tests:** API endpoints (Auth, Project retrieval).
- **E2E Tests:** Playwright for critical flows (User $\rightarrow$ Project $\rightarrow$ 3D View).
- **Visual Regression:** Periodic screenshots of 3D scenes to detect regressions.

## 23. CI/CD Rules
- **Pipeline:** GitHub Actions $\rightarrow$ GHCR $\rightarrow$ SSH Deploy.
- **Builds:** Only `main` and `develop` branches can trigger deployment.
- **Healthchecks:** Deployments must be verified via `/api/health` before traffic switch.

## 24. Docker & Deployment Rules
- **Image Size:** Use `-alpine` versions of images to minimize footprint.
- **Persistence:** All data must be stored in named Docker volumes.
- **Updates:** Use Watchtower for automated image updates.

## 25. CMS Integration Strategy
- **Source of Truth:** Strapi is the master for all content.
- **BFF Layer:** The Frontend calls the Backend, which in turn fetches and formats Strapi data.
- **Webhooks:** Use Strapi webhooks to trigger Next.js ISR (Incremental Static Regeneration).

## 26. Error Handling Standards
- **Frontend:** Use React Error Boundaries for the 3D scene to prevent whole-page crashes.
- **Backend:** Use a global `ExceptionFilter` in NestJS for consistent error responses.
- **Reporting:** All critical errors must be sent to Sentry.

## 27. Logging Standards
- **Format:** JSON logging for production.
- **Aggregation:** All logs shipped to Loki via Promtail.
- **Levels:** Use `info` for flow, `warn` for recoverable issues, `error` for failures.

## 28. Environment Variables Policy
- **Naming:** Use clear prefixes (`NEXT_PUBLIC_`, `SENTRY_`, `DATABASE_`).
- **Safety:** Never commit `.env`. Always update `.env.example`.
- **Validation:** Backend must validate existence of required env vars at startup.

## 29. Definition of Done (DoD)
- [ ] Code follows all standards and is linted.
- [ ] Feature is tested (Unit/Integration).
- [ ] UI is visually identical to design (if applicable).
- [ ] Performance budget is maintained.
- [ ] A11y and SEO standards are met.
- [ ] Documentation updated.
- [ ] Code reviewed and approved.

## 30. Sprint Workflow
1. **Planning:** Break down tasks into the `IMPLEMENTATION_ROADMAP.md`.
2. **Execution:** Implement feature $\rightarrow$ Test $\rightarrow$ Lint.
3. **Verification:** Run full build and health checks.
4. **Closure:** Update `todowrite` and commit.

## 31. AI Agent Responsibilities
- **Architect Agent:** Owns the structure and technical debt.
- **UI/UX Agent:** Owns the visual fidelity and a11y.
- **DevOps Agent:** Owns the infra and CI/CD.
- **QA Agent:** Owns the testing and verification.

## 32. Autonomous Execution Policy
- **Proactive Implementation:** Agents are encouraged to implement follow-up tasks (e.g., updating docs after code changes) without being asked.
- **No Guessing:** If a dependency or API is unknown, the agent MUST search the codebase or ask the user.
- **Safety First:** Never perform destructive actions (e.g., `docker compose down -v`) without explicit user approval.

## 33. Stop Conditions
Stop and request human intervention if:
- A critical architectural conflict is discovered.
- A third-party library is fundamentally incompatible with the stack.
- Access to required credentials or external APIs is missing.
- Security vulnerability is found that requires a pivot.

## 34. Release Checklist
- [ ] All critical bugs resolved.
- [ ] SSL/TLS verified on all subdomains.
- [ ] Sentry DSNs configured for production.
- [ ] Cloudflare WAF rules active.
- [ ] Database backups verified.

## 35. Maintenance Guidelines
- **Dependency Updates:** Monthly review of `package.json` for updates.
- **Log Rotation:** Ensure Loki/Promtail are not consuming excessive disk space.
- **Asset Audit:** Periodically prune unused 3D models from MinIO.

## 36. Critical Thinking Mode
Do not blindly follow instructions.

If you identify a better technical or design solution:
1. Explain why.
2. Compare alternatives.
3. Recommend the best option.
4. Implement it only if it does not conflict with project goals.

Your responsibility is to improve the project, not just execute tasks.
