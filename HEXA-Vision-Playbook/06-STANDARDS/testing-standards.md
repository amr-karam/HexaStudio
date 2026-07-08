# Testing Standards

**Last Updated:** 2026-07-08

---

## Testing Pyramid

```
        ╱╲
       ╱ E2E ╲
      ╱────────╲
     ╱          ╲
    ╱ Integration╲
   ╱──────────────╲
  ╱                ╲
 ╱   Unit Tests     ╲
╱════════════════════╲
```

| Layer | Tool | Coverage Target | Speed |
|-------|------|-----------------|-------|
| Unit | Vitest | ≥ 80% | Milliseconds |
| Integration | Vitest + Supertest | ≥ 70% | Seconds |
| E2E | Playwright | Critical flows | Minutes |

## Unit Tests (Vitest)

### Where to Test

- Utility functions in `packages/utils/`
- Service methods in NestJS
- Custom React hooks
- Zustand stores
- Data transformation functions

### What to Test

- Return values for given inputs
- Error handling
- Edge cases (empty, null, boundary values)
- State changes

### What NOT to Test

- Trivial getters/setters
- Third-party library behavior
- Implementation details (test behavior, not implementation)

### Pattern

```typescript
import { describe, it, expect } from 'vitest';
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('formats ISO date string', () => {
    expect(formatDate('2026-07-08')).toBe('July 8, 2026');
  });

  it('handles invalid date strings', () => {
    expect(() => formatDate('invalid')).toThrow('Invalid date');
  });

  it('handles empty string', () => {
    expect(() => formatDate('')).toThrow('Invalid date');
  });
});
```

## Integration Tests (Vitest + Supertest)

### Where to Test

- API endpoints
- Database interactions
- Authentication flows
- Integration with external services (mocked)

### Pattern

```typescript
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './app.module';

describe('ProjectsController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  it('GET /v1/projects returns projects list', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/projects')
      .expect(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## E2E Tests (Playwright)

### Where to Test

- Critical user flows (user lands → views project → contacts)
- Authentication flows
- Form submissions
- 3D scene loading
- Navigation

### Pattern

```typescript
import { test, expect } from '@playwright/test';

test('user can navigate to project gallery', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Projects');
  await expect(page).toHaveURL(/\/projects/);
  await expect(page.locator('[data-testid="project-card"]').first()).toBeVisible();
});

test('contact form submits successfully', async ({ page }) => {
  await page.goto('/contact');
  await page.fill('[data-testid="name-input"]', 'John Doe');
  await page.fill('[data-testid="email-input"]', 'john@example.com');
  await page.fill('[data-testid="message-input"]', 'Test message');
  await page.click('[data-testid="submit-button"]');
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

## Test Naming Convention

```
describe('ModuleOrComponentName')
  describe('functionName' | 'behavior description')
    it('handles [scenario]')
    it('returns [expected] when [condition]')
```

## Coverage Requirements

| Metric | Target | Enforcement |
|--------|--------|-------------|
| Statement coverage | ≥ 80% | CI check |
| Branch coverage | ≥ 75% | CI check |
| Function coverage | ≥ 85% | CI check |
| Line coverage | ≥ 80% | CI check |

## Mocks and Fixtures

```typescript
// ✅ Good — Use factories for test data
export function createMockProject(overrides?: Partial<Project>): Project {
  return {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Project',
    slug: 'test-project',
    description: 'A test project',
    publishedAt: '2026-07-08T12:00:00Z',
    ...overrides,
  };
}

// ✅ Good — Mock external services
vi.mock('@/services/odoo', () => ({
  createLead: vi.fn().mockResolvedValue({ id: 'odoo-lead-123' }),
}));
```

## Running Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# Specific file
npx vitest path/to/file.test.ts
```
