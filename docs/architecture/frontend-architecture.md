# Frontend Architecture

**Last Updated:** 2026-09-04

---

## Technology

- **Framework:** Next.js 16.2.11 (App Router)
- **Language:** TypeScript 5.7+ (strict mode)
- **Styling:** TailwindCSS 4 + Silent Luxury design tokens (`sl-*` CSS variables + `silent-luxury-tokens.css`)
- **3D:** React Three Fiber + @react-three/drei (lazy-loaded per route, gated by `useMotionPolicy`)
- **Animation:** GSAP (ScrollTrigger timelines) + Framer Motion (UI transitions)
- **State:** Zustand (client) + TanStack Query (server)
- **Color Tokens:** Canonical TypeScript token mirror at `src/lib/color-tokens.ts` for Three.js/WebGL contexts where CSS variables are unavailable

---

## Directory Structure

```
apps/frontend/src/
├── app/                    # App Router pages
│   ├── (marketing)/        # Marketing route group
│   │   ├── page.tsx        # Home
│   │   ├── about/
│   │   ├── services/
│   │   └── contact/
│   ├── (projects)/         # Projects route group
│   │   ├── page.tsx        # Gallery
│   │   └── [slug]/
│   ├── (blog)/             # Blog route group
│   │   ├── page.tsx
│   │   └── [slug]/
│   ├── (dashboard)/        # Dashboard route group (auth)
│   │   ├── page.tsx
│   │   ├── projects/
│   │   ├── integrations/
│   │   ├── odoo/
│   │   └── translations/
│   ├── (portal)/           # Client portal route group (auth)
│   │   ├── page.tsx
│   │   ├── projects/
│   │   ├── approvals/
│   │   ├── documents/
│   │   ├── finance/
│   │   ├── notifications/
│   │   ├── profile/
│   │   ├── reports/
│   │   ├── settings/
│   │   ├── support/
│   │   └── ai/
│   ├── admin/              # Admin route group (auth)
│   │   ├── accounting/
│   │   ├── health/
│   │   ├── performance/
│   │   ├── requests/
│   │   └── telemetry/
│   ├── ai/                 # AI showcase pages
│   ├── blog/
│   │   └── rss.xml/        # RSS feed route (force-dynamic SSR)
│   ├── contact/
│   ├── dashboard/
│   ├── demo/
│   ├── flowdeck/
│   ├── login/
│   ├── photographer/
│   ├── portal/
│   ├── premium-chat/
│   ├── privacy/
│   ├── projects/
│   ├── services/
│   ├── story/              # 🎬 Cinematic 3D walkthrough route
│   │   ├── page.tsx        # Entry point for /story
│   │   ├── scroll.tsx      # Scroll component (GSAP ScrollTrigger, 4 scenes)
│   │   └── index.ts        # Barrel export
│   ├── studio/
│   │   ├── analytics/
│   │   └── atelier/
│   ├── terms/
│   ├── xr-viewer/
│   ├── layout.tsx          # Root layout
│   ├── error.tsx           # Global error boundary
│   └── page.tsx            # Home page
├── components/
│   ├── ui/                 # Primitives (Button, Input, Card, Modal)
│   ├── layout/             # Layout (Header, Footer, Navigation)
│   ├── shared/             # Shared composites (ProjectCard, BlogCard)
│   ├── three/              # 3D components (Scene, Model, Controls)
│   ├── animation/          # Scroll cinema primitives (ChapterMarker, ReadingProgress, ContactRibbon)
│   └── forms/              # Form components (ContactForm, LoginForm)
├── features/
│   ├── portfolio/          # Portfolio components (HomeHero, HomeSections, SelectedWork, StudioNote)
│   ├── scene/              # 3D scene orchestration (ExperienceCanvas, SceneContent)
│   ├── portal/             # Client portal feature components
│   ├── xr/                 # WebXR AR components
│   ├── odoo/               # Odoo integration hooks and API
│   ├── faq/                # FAQ components
│   ├── contact/            # Contact form section
│   └── scene/              # Scene content and lighting presets
├── hooks/                  # Custom React hooks (useWindowSize, useIntersectionObserver, useKeyboardShortcut, etc.)
├── lib/                    # Utility functions (color-tokens.ts, seo.ts, resource-loader.ts)
├── stores/                 # Zustand stores
├── queries/                # TanStack Query definitions
├── types/                  # Local types (re-export from @hexa/types)
├── constants/              # Configuration constants
└── styles/
    ├── globals.css         # Tailwind base styles
    └── silent-luxury-tokens.css  # Silent Luxury design tokens + utility classes
```

---

## Rendering Strategy

| Page Type | Rendering | ISR Interval | Auth Required |
|-----------|-----------|--------------|---------------|
| Landing | SSG + ISR | 60s | No |
| Projects list | SSG + ISR | 300s | No |
| Project detail | SSG + ISR | 300s | No |
| Blog list | SSG + ISR | 300s | No |
| Blog detail | SSG + ISR | 300s | No |
| Services | SSG + ISR | 3600s | No |
| About | SSG | — | No |
| Contact | SSR | — | No |
| Story (cinematic) | SSR + client islands | — | No |
| Dashboard | SSR | — | Yes (admin) |
| Client Portal | SSR | — | Yes (client) |

### Dynamic Route Error & Loading Boundaries

All dynamic routes have `error.tsx` and `loading.tsx` boundaries:

| Route | Error Boundary | Loading State |
|-------|---------------|---------------|
| `/blog/[slug]` | ✅ `error.tsx` — Sentry capture, retry link | ✅ `loading.tsx` — skeleton |
| `/projects/[slug]` | ✅ `error.tsx` — Sentry capture, retry link | ✅ `loading.tsx` — skeleton |
| `/portal/projects/[id]` | ✅ `error.tsx` — Sentry capture, retry link | ✅ `loading.tsx` — skeleton |
| `/portal/review/[id]` | ✅ `error.tsx` — Sentry capture, retry link | ✅ `loading.tsx` — skeleton |
| `/admin/accounting` | ✅ `error.tsx` — Sentry capture, retry link | ✅ `loading.tsx` — skeleton with 6s AbortController timeout |

---

## Data Fetching Pattern

```typescript
// Server component — fetch on server
async function ProjectPage({ params }: { params: { slug: string } }) {
  const project = await fetchProject(params.slug);
  return <ProjectDetail project={project} />;}

// Client component — TanStack Query
'use client';
function ProjectList() {
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    staleTime: 30000,
  });

  if (isLoading) return <ProjectListSkeleton />;</div>
  return <Grid>{data?.map(p => <ProjectCard key={p.id} project={p} />)}</Grid>;
}
```

---

## State Management

### Zustand (Client State)

```typescript
interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
}

const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  sidebarOpen: false,
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
```

### TanStack Query (Server State)

```typescript
// queries/projects.ts
export function useProjects(category?: string) {
  return useQuery({
    queryKey: ['projects', category],
    queryFn: () => fetch(`/api/v1/projects${category ? `?category=${category}` : ''}`).then(r => r.json()),
    staleTime: 30000,
    gcTime: 300000,
  });
}
```

---

## 3D Architecture

### Component Hierarchy

```
<SceneContainer>           // Error boundary + layout
  <Canvas>                 // R3F Canvas (lazy-loaded per route)
    <Suspense>             // Loading state
      <Environment />      // Lighting + background
      <Camera />           // Initial camera position
      <Model />            // GLB model (Draco)
      <Hotspots />         // Interactive points
    </Suspense>
    <Controls />           // Orbit controls
    <UI Overlay />         // HTML overlay
  </Canvas>
</SceneContainer>
```

### Story Scroll Component (Cinematic 3D Walkthrough)

The `/story` route implements a cinematic scroll-driven walkthrough using **GSAP ScrollTrigger**. The component (`scroll.tsx`) renders a horizontal z-axis scene with 4 narrative beats, each driven by scroll position:

- **`StoryScroll`** — Main scroll component with GSAP timeline
- **Scene data**: 4 scenes with titles, descriptions, and `COLOR_TOKENS` background colors (VOID, VOID_DEEP, OBSIDIAN)
- **Z-axis parallax**: Each scene is positioned at `translateZ(-1000px × scene.index)` for depth
- **Progress HUD**: Fixed bottom hairline with gold progress indicator (`bg-sl-gold`)
- **Motion policy**: ScrollTrigger scrub (1.5s lerp), fade/scale entrances, reduced-motion safe
- **Tokens**: Uses `COLOR_TOKENS` from `src/lib/color-tokens.ts` and `sl-*` CSS utility classes from `silent-luxury-tokens.css`

See `docs/design/COMPONENT_GUIDE.md` → Scroll Cinema Primitives and `docs/engineering/GSAP_GUIDE.md` for implementation details.

### Error Handling

```typescript
function SceneContainer({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary fallback={<SceneErrorFallback />}>
      {children}
    </ErrorBoundary>
  );
}
```

All 3D scenes are wrapped in error boundaries. Dynamic routes also have `error.tsx` boundaries that capture errors via Sentry and provide retry navigation. The `/admin/accounting` route additionally uses a 6-second `AbortController` timeout on API fetches to prevent hanging on unreachable backend services.
