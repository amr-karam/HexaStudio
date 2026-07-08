# Naming Conventions — Complete Reference

**Last Updated:** 2026-07-08

---

## General Rules

1. **English only** — All names in American English
2. **No abbreviations** — Unless universally understood (ID, URL, API)
3. **Self-documenting** — Names should explain purpose without comments
4. **Consistent** — Same concept = same name across entire codebase

---

## File & Directory Naming

| Artifact | Convention | Example |
|----------|------------|---------|
| React components | PascalCase | `ProjectGallery.tsx` |
| Page files | kebab-case | `project-gallery/page.tsx` |
| Utility functions | camelCase | `formatDate.ts` |
| Styles | kebab-case | `globals.css` |
| Config files | kebab-case | `tailwind.config.ts` |
| Test files | `.test.ts` suffix | `formatDate.test.ts` |
| Type files | PascalCase | `Project.ts` |
| Directory (components) | kebab-case | `project-gallery/` |
| Directory (modules) | kebab-case | `auth/` |
| Assets | kebab-case | `sunset-villa-thumb.webp` |
| Playbook docs | UPPER_SNAKE_CASE | `PRODUCT_VISION.md` |
| Templates | TEMPLATE_Prefix | `TEMPLATE_PR.md` |

---

## TypeScript / JavaScript Naming

| Artifact | Convention | Example |
|----------|------------|---------|
| Classes | PascalCase | `class UserService` |
| Interfaces | PascalCase | `interface Project` |
| Types | PascalCase | `type ProjectStatus` |
| Enums | PascalCase | `enum ProjectStatus` |
| Enum members | UPPER_SNAKE_CASE | `ProjectStatus.ACTIVE` |
| Functions | camelCase | `function formatDate()` |
| Variables | camelCase | `const userName` |
| Constants | UPPER_SNAKE_CASE | `const MAX_RETRIES` |
| Parameters | camelCase | `(userId: string)` |
| Private members | camelCase (no `_`) | `private cache = new Map()` |
| Generics | Single letter | `T`, `K`, `V` |
| Type parameters | PascalCase | `TData`, `TResponse` |

---

## React / Next.js Naming

| Artifact | Convention | Example |
|----------|------------|---------|
| Component function | PascalCase | `function ProjectCard()` |
| Component file | PascalCase | `ProjectCard.tsx` |
| Hook | `use` prefix + camelCase | `useProjectData()` |
| Hook file | camelCase | `useProjectData.ts` |
| Store | `use` prefix + camelCase | `useUIStore` |
| Context | PascalCase | `AuthContext` |
| Provider | PascalCase | `AuthProvider` |
| Props interface | ComponentName + `Props` | `ProjectCardProps` |
| Event handler | `handle` prefix | `handleClick()` |
| State variable | camelCase | `const [isOpen, setIsOpen]` |
| Ref | `ref` suffix | `const sceneRef = useRef()` |

### Event Handler Name Mapping

| Event | Handler Name |
|-------|-------------|
| Click | `handleClick` |
| Submit | `handleSubmit` |
| Change | `handleChange` |
| KeyDown | `handleKeyDown` |
| Focus | `handleFocus` |
| Blur | `handleBlur` |
| Scroll | `handleScroll` |
| Drag | `handleDragStart`, `handleDragEnd` |

### Boolean Prop Naming

| Prefix | Usage | Example |
|--------|-------|---------|
| `is` | States | `isLoading`, `isOpen`, `isDisabled` |
| `has` | Possession | `hasError`, `hasPermission` |
| `can` | Capability | `canEdit`, `canDelete` |
| `should` | Recommendation | `shouldRender`, `shouldAnimate` |
| `show` | Visibility | `showHeader`, `showFooter` |

---

## NestJS Naming

| Artifact | Convention | Example |
|----------|------------|---------|
| Module | kebab-case + `.module.ts` | `auth.module.ts` |
| Controller | kebab-case + `.controller.ts` | `auth.controller.ts` |
| Service | kebab-case + `.service.ts` | `auth.service.ts` |
| DTO | PascalCase | `CreateUserDto` |
| DTO file | kebab-case | `create-user.dto.ts` |
| Entity | PascalCase | `UserEntity` |
| Entity file | kebab-case | `user.entity.ts` |
| Guard | PascalCase | `JwtAuthGuard` |
| Filter | PascalCase | `GlobalExceptionFilter` |
| Interceptor | PascalCase | `LoggingInterceptor` |
| Decorator | camelCase | `@CurrentUser()` |
| Module directory | kebab-case | `auth/` |

---

## Database Naming

| Artifact | Convention | Example |
|----------|------------|---------|
| Table names | snake_case (plural) | `users`, `project_files` |
| Column names | snake_case | `created_at`, `first_name` |
| Primary key | `id` | `id` |
| Foreign key | `{table}_id` | `user_id`, `project_id` |
| Join table | `{table1}_{table2}` | `users_roles` |
| Index | `idx_{table}_{column}` | `idx_users_email` |
| Unique constraint | `uq_{table}_{column}` | `uq_users_email` |
| Timestamps | `created_at`, `updated_at` | Always UTC |

---

## CSS / Tailwind Naming

| Artifact | Convention | Example |
|----------|------------|---------|
| Custom classes | kebab-case | `.project-card` |
| BEM modifier | `--` prefix | `.project-card--featured` |
| Tailwind variants | Framework standards | `dark:`, `hover:`, `md:` |
| CSS variables | `--` prefix + kebab-case | `--color-primary` |
| Animations | kebab-case | `@keyframes fade-in` |

---

## Git Naming

| Artifact | Convention | Example |
|----------|------------|---------|
| Branch (feature) | `feature/kebab-case-name` | `feature/project-3d-viewer` |
| Branch (bugfix) | `bugfix/issue-number-description` | `bugfix/142-nav-overflow` |
| Branch (hotfix) | `hotfix/issue-number-description` | `hotfix/153-auth-redirect` |
| Branch (release) | `release/major.minor.patch` | `release/1.2.0` |
| Commit type | See GIT_WORKFLOW.md | `feat`, `fix`, `docs` |
| Commit scope | Single word | `frontend`, `backend` |
| Tag | `v{major}.{minor}.{patch}` | `v1.2.0` |

---

## Environment Variable Naming

| Convention | Example |
|------------|---------|
| UPPER_SNAKE_CASE | `DATABASE_URL` |
| Prefix by service | `NEXT_PUBLIC_`, `SENTRY_` |
| Group related variables | `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` |

---

## Prohibited Patterns

| Pattern | Why | Instead |
|---------|-----|---------|
| Hungarian notation | Unnecessary in TS | Use descriptive names |
| Single-letter vars | Not descriptive | Use full words (except loop counters) |
| Underscore prefix (`_`) | Confusing readability | Use descriptive names |
| `data`, `info`, `temp` | Too generic | Be specific |
| `foo`, `bar` | Placeholder in production | Use meaningful examples |
| Abbreviations like `usr` | Inconsistent | Full word: `user` |
| Double negatives (`notDisabled`) | Hard to read | `enabled` |
