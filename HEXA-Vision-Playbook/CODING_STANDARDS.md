# Coding Standards

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## General Principles

1. **TypeScript Strict Mode** — Enabled. No `any` types. Period.
2. **Self-Documenting Code** — Code should be readable without comments. Comments explain "why", not "what".
3. **DRY (Don't Repeat Yourself)** — Duplication is forbidden. Extract shared logic into packages.
4. **KISS (Keep It Simple, Stupid)** — The simplest solution that works is the best solution.
5. **Single Responsibility** — Every function, component, and module does one thing.
6. **No Dead Code** — Unused code is deleted, not commented out.
7. **No Console Logs** — Use proper logging. Remove debug logs before committing.

---

## TypeScript

### Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Rules

| Rule | Enforcement |
|------|-------------|
| No `any` | TypeScript error |
| No `as` casts | Prefer type guards or satisfying |
| No `!` non-null assertion | Handle null explicitly |
| No `@ts-ignore` | Use `@ts-expect-error` with reason |
| Explicit return types | Required on all functions |
| Interface over type | `interface` for objects, `type` for unions |
| `const` assertions | Use `as const` for literal types |
| Generic naming | Single letters only for standard patterns (T, K, V) |

### Example

```typescript
// ❌ Bad
function getData(id) { return fetch(`/api/${id}`); }

// ✅ Good
async function getProjectById(id: string): Promise<Project> {
  return fetch(`/api/projects/${id}`).then(res => res.json());
}
```

---

## Naming Conventions

| Category | Convention | Example |
|----------|------------|---------|
| Components | PascalCase | `ProjectGallery.tsx` |
| Functions | camelCase | `formatDate()` |
| Variables | camelCase | `sceneCamera` |
| Constants | UPPER_SNAKE_CASE | `MAX_SCENE_OBJECTS` |
| Types/Interfaces | PascalCase | `Project` |
| Enums | PascalCase | `ProjectStatus` |
| Enum members | UPPER_SNAKE_CASE | `ACTIVE` |
| Files (components) | PascalCase | `ProjectCard.tsx` |
| Files (utils) | camelCase | `formatDate.ts` |
| Files (styles) | kebab-case | `globals.css` |
| Directories | kebab-case | `project-gallery/` |
| CSS classes | kebab-case | `project-card__title` |
| Environment variables | UPPER_SNAKE_CASE | `DATABASE_URL` |

### Booleans

Prefix booleans with `is`, `has`, `can`, `should`:

```typescript
const isLoading = true;
const hasPermission = false;
const canEdit = true;
```

### Event Handlers

Prefix with `handle`:

```typescript
function handleClick(): void { ... }
function handleSubmit(data: FormData): void { ... }
```

---

## React / Next.js

### Component Structure

```typescript
// 1. Imports
import { useCallback } from 'react';
import type { Project } from '@hexa/types';

// 2. Types
interface ProjectCardProps {
  project: Project;
  onSelect: (id: string) => void;
}

// 3. Component
export function ProjectCard({ project, onSelect }: ProjectCardProps) {
  const handleClick = useCallback(() => {
    onSelect(project.id);
  }, [project.id, onSelect]);

  return (
    <div onClick={handleClick}>
      <h2>{project.title}</h2>
    </div>
  );
}
```

### Rules

1. **Server Components by default** — Only add `'use client'` when needed
2. **No barrel exports** — Import directly from the file
3. **No default exports** — Named exports only
4. **Custom hooks** — Start with `use`, return typed values
5. **State** — Server state in TanStack Query, client state in Zustand
6. **No inline styles** — Use TailwindCSS utility classes
7. **3D components** — Isolated in `components/three/` with error boundaries

### Custom Hooks Pattern

```typescript
interface UseProjectsOptions {
  category?: string;
  limit?: number;
}

interface UseProjectsResult {
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
}

export function useProjects(options: UseProjectsOptions = {}): UseProjectsResult {
  return useQuery({
    queryKey: ['projects', options],
    queryFn: () => fetchProjects(options),
  });
}
```

---

## NestJS

### Module Structure

```
users/
├── users.module.ts
├── users.controller.ts
├── users.service.ts
├── dto/
│   ├── create-user.dto.ts
│   └── update-user.dto.ts
├── entities/
│   └── user.entity.ts
└── tests/
    └── users.service.spec.ts
```

### Controller Pattern

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.findOne(id);
  }
}
```

### Validation

```typescript
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsString()
  @IsOptional()
  name?: string;
}
```

---

## CSS / TailwindCSS

### Rules

1. **No custom CSS files** — Exceptions: `globals.css` for base styles
2. **No `!important`** — Use proper specificity
3. **No inline styles** — Use utility classes
4. **Responsive** — Mobile-first with `sm:`, `md:`, `lg:`, `xl:`
5. **Dark mode** — Use `dark:` variant
6. **Custom values** — Extend theme in config, not inline

### Ordering

Group Tailwind classes in this order:

1. Layout (`flex`, `grid`, `container`)
2. Positioning (`relative`, `absolute`, `z-10`)
3. Spacing (`p-4`, `m-2`, `gap-4`)
4. Sizing (`w-full`, `h-10`)
5. Typography (`text-lg`, `font-bold`)
6. Visual (`bg-white`, `rounded-lg`, `shadow-md`)
7. Interactive (`cursor-pointer`, `hover:bg-gray-100`)
8. Responsive (`md:flex`, `lg:w-1/2`)

---

## Three.js / R3F

### Component Pattern

```typescript
interface SceneProps {
  modelPath: string;
}

export function Scene({ modelPath }: SceneProps) {
  return (
    <Canvas>
      <Suspense fallback={<LoadingFallback />}>
        <Model path={modelPath} />
      </Suspense>
    </Canvas>
  );
}
```

### Rules

1. **Dispose** — Always dispose geometries and materials on unmount
2. **InstancedMesh** — Use for repeated objects
3. **Draco compression** — Used for all GLTF models
4. **Baked lighting** — Prefer for static scenes
5. **Error boundary** — Wrap all 3D scenes
6. **`useMemo`** — Memoize geometries and materials
7. **`useCallback`** — Memoize event handlers

---

## Imports

### Order

1. Node built-ins (`fs`, `path`)
2. External packages (`react`, `next`)
3. Internal packages (`@hexa/types`)
4. Absolute imports (`@/components/...`)
5. Relative imports (`./...`)
6. CSS imports

### No Barrel Files

```typescript
// ❌ Bad
export { Button } from './Button';
export { Input } from './Input';

// ✅ Good
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
```

---

## Error Handling

### Frontend

```typescript
// Use error boundaries for 3D scenes
<ThreeScene>
  <ErrorBoundary fallback={<SceneFallback />}>
    <Scene modelPath={path} />
  </ErrorBoundary>
</ThreeScene>
```

### Backend

```typescript
// Use global exception filter
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Structured error response
  }
}
```

---

## Testing

### Unit Tests

```typescript
describe('formatDate', () => {
  it('formats ISO date to readable string', () => {
    expect(formatDate('2024-01-15')).toBe('January 15, 2024');
  });
});
```

### E2E Tests

```typescript
test('user can view project gallery', async ({ page }) => {
  await page.goto('/projects');
  await expect(page.locator('[data-testid="project-card"]')).toHaveCount(6);
});
```

---

## Linting & Formatting

### ESLint

- Rules are defined in `.eslintrc.js`
- Run `npm run lint` before every commit
- Auto-fix with `npm run lint:fix`

### Prettier

- Config in `.prettierrc`
- 100 character line width
- Single quotes
- Trailing commas (all)
- 2 space indentation
