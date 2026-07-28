# 🧪 UNIT TESTING STANDARDS & PATTERNS

**Version:** 1.1.0 | **Scope:** Vitest & Jest Suites | **Standard:** 80%+ Mandatory Code Coverage

---

## 1. OVERVIEW & FRAMEWORK

HEXA Vision uses **Vitest** for `apps/frontend` and **Jest / Vitest** for `apps/backend` unit testing. Unit tests validate pure helper functions, React components, state hooks, NestJS services, and DTO validation pipes.

---

## 2. COVERAGE TARGETS & GATES

| Workspace | Target Branch Coverage | Target Statement Coverage | Active Test Suite Count |
|-----------|------------------------|---------------------------|-------------------------|
| `apps/frontend` | $\ge 80\%$ | $\ge 85\%$ | 176 Passing Specs |
| `apps/backend` | $\ge 80\%$ | $\ge 85\%$ | 285 Passing Specs |
| `packages/utils` | $\ge 90\%$ | $\ge 95\%$ | Pure Function Suite |
| `packages/types` | $100\%$ Type Correctness | N/A | Type Check Gate |

---

## 3. FRONTEND COMPONENT & HOOK TESTING PATTERNS

Frontend component tests (`React Testing Library` + `Vitest`) mock Framer Motion and matchMedia to ensure deterministic execution:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Counter } from "@/components/ui/Counter";

describe("Counter Component", () => {
  it("renders final target value under reduced motion", () => {
    render(<Counter value={100} label="Projects Delivered" />);
    expect(screen.getByText("100")).toBeInTheDocument();
  });
});
```

---

## 4. BACKEND SERVICE & CONTROLLER TESTING PATTERNS

NestJS services use mock repositories and Redis cache providers:

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { ProjectsService } from "./projects.service";

describe("ProjectsService", () => {
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: "REDIS_CLIENT", useValue: { get: vi.fn(), set: vi.fn() } },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
```

---

## 5. OPERATIONAL COMMANDS

```bash
# Run unit tests across all workspaces
npm run test

# Run frontend unit tests in watch mode
npm run test --workspace=apps/frontend -- --watch

# Generate code coverage reports
npm run test -- --coverage
```

---

## 6. RELATED DOCUMENTATION

- [INTEGRATION_TESTS.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/HEXA-Vision-Playbook/15-QUALITY/INTEGRATION_TESTS.md) — API integration testing.
- [QUALITY_GATES.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/HEXA-Vision-Playbook/15-QUALITY/QUALITY_GATES.md) — Coverage quality gates.
- [CODING_STANDARDS.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/HEXA-Vision-Playbook/06-STANDARDS/CODING_STANDARDS.md) — Development guidelines.
