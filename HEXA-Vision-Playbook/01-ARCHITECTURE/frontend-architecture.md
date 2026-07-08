# Frontend Architecture

**Last Updated:** 2026-07-08

---

## Technology

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** TailwindCSS 4
- **3D:** React Three Fiber + @react-three/drei
- **Animation:** GSAP (timelines) + Framer Motion (UI)
- **State:** Zustand (client) + TanStack Query (server)

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
│   │   └── projects/
│   ├── (portal)/           # Client portal route group (auth)
│   │   ├── page.tsx
│   │   └── projects/
│   ├── api/                # API routes (Next.js, limited use)
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/
│   ├── ui/                 # Primitives (Button, Input, Card, Modal)
│   ├── layout/             # Layout (Header, Footer, Navigation)
│   ├── shared/             # Shared composites (ProjectCard, BlogCard)
│   ├── three/              # 3D components (Scene, Model, Controls)
│   └── forms/              # Form components (ContactForm, LoginForm)
├── lib/                    # Utility functions
├── hooks/                  # Custom React hooks
├── stores/                 # Zustand stores
├── queries/                # TanStack Query definitions
├── types/                  # Local types (re-export from @hexa/types)
├── constants/              # Configuration constants
└── styles/                 # Global styles (CSS)
```

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
| Dashboard | SSR | — | Yes (admin) |
| Client Portal | SSR | — | Yes (client) |

## Data Fetching Pattern

```typescript
// Server component — fetch on server
async function ProjectPage({ params }: { params: { slug: string } }) {
  const project = await fetchProject(params.slug);
  return <ProjectDetail project={project} />;
}

// Client component — TanStack Query
'use client';
function ProjectList() {
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    staleTime: 30000,
  });

  if (isLoading) return <ProjectListSkeleton />;
  return <Grid>{data?.map(p => <ProjectCard key={p.id} project={p} />)}</Grid>;
}
```

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

## 3D Architecture

### Component Hierarchy

```
<SceneContainer>           // Error boundary + layout
  <Canvas>                 // R3F Canvas
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
