# 🔌 API INTEGRATION & BACKEND SUITE STANDARDS

**Version:** 1.0.0 | **Scope:** NestJS Supertest & Contract Validation | **Standard:** End-to-End API Integrity

---

## 1. OVERVIEW & SCOPE

Integration tests in `apps/backend` validate HTTP endpoint contracts, DTO validation pipes, database transactions (PostgreSQL), cache invalidations (Redis), and third-party fallback guards (Odoo ERP, OpenAI, Strapi).

---

## 2. INTEGRATION SUITE TOPOLOGY

Integration tests use NestJS `TestingModule` combined with `Supertest` to invoke real controller routes against a test database environment:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       SUPERTEST INTEGRATION PIPELINE                    │
│                                                                         │
│  HTTP Request ──► ValidationPipe ──► Controller ──► Service ──► DB/Redis │
│       ▲                                                              │  │
│       └──────────────── Expected JSON Response Envelope ─────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. KEY INTEGRATION SUITE PATTERNS

### A. Auth & DTO Validation Testing
```typescript
import * as request from "supertest";
import { INestApplication } from "@nestjs/common";

describe("POST /api/v1/contacts (Integration)", () => {
  let app: INestApplication;

  it("should reject invalid email format with 400 Bad Request", async () => {
    return request(app.getHttpServer())
      .post("/api/v1/contacts")
      .send({ name: "Jane Doe", email: "invalid-email" })
      .expect(400)
      .expect((res) => {
        expect(res.body.status).toBe("error");
      });
  });
});
```

### B. Odoo Live-Status Fallback Testing
Verifies that `GET /api/projects/:slug` gracefully returns project details even when Odoo ERP times out (2s circuit breaker timeout).

---

## 4. OPERATIONAL COMMANDS

```bash
# Run backend integration tests
npm run test:e2e --workspace=apps/backend

# Run integration tests against test database container
docker compose -f docker-compose.yml exec backend npm run test:e2e
```

---

## 5. RELATED DOCUMENTATION

- [UNIT_TESTS.md](UNIT_TESTS.md) — Unit testing.
- [API_DOCUMENTATION.md](../api/API_DOCUMENTATION.md) — Endpoint specifications.
- [SECURITY_STANDARDS.md](../security/SECURITY_STANDARDS.md) — API security rules.
