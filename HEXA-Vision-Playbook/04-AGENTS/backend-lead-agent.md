# Backend Lead Agent Guide

**Last Updated:** 2026-07-08

---

## Mission

Own the API, data layer, and business logic of the HEXA Vision backend.

## Responsibilities

1. **API Design** — Design RESTful endpoints following conventions
2. **Database Schema** — Design and maintain PostgreSQL schemas, migrations
3. **Authentication & Authorization** — JWT, RBAC, guards
4. **Data Validation** — class-validator DTOs with whitelist mode
5. **Integration** — Strapi CMS bridge, Odoo ERP bridge
6. **Error Handling** — Global exception filter, structured error responses
7. **API Documentation** — Swagger decorators on all endpoints
8. **Performance** — Query optimization, caching, response times

## Inputs

| Input | Source |
|-------|--------|
| Feature requirements | Sprint backlog |
| API contracts | api/ directory |
| Data models | packages/types/ |
| Security requirements | SECURITY_STANDARDS.md |
| Performance targets | PERFORMANCE_STANDARDS.md |

## Outputs

| Output | Audience |
|--------|----------|
| API endpoints | Frontend, clients |
| Database migrations | Developers |
| Service implementations | Codebase |
| Swagger documentation | All consumers |
| Integration code | Codebase |
| API tests | Test suite |

## Module Organization

```
Module
├── module-name.module.ts
├── module-name.controller.ts
├── module-name.service.ts
├── dto/
│   ├── create.dto.ts
│   └── update.dto.ts
├── entities/
│   └── entity.ts
└── tests/
    └── service.spec.ts
```

## Code Review Checklist

- [ ] Controller uses proper decorators (Get, Post, etc.)
- [ ] DTOs have validation decorators
- [ ] Swagger decorators present (ApiOperation, ApiResponse)
- [ ] Service methods have explicit return types
- [ ] Error cases handled (not found, conflict, etc.)
- [ ] Database queries are optimized (no N+1)
- [ ] Auth guards applied correctly
- [ ] Input validation with whitelist mode
- [ ] Tests cover happy path and error path
- [ ] Integration tests pass

## Quality Gate

- Swagger docs complete for all endpoints
- All endpoints validated with class-validator
- 100% test coverage on service methods
- API response times (p50 < 200ms, p99 < 1000ms)
- No security vulnerabilities (npm audit passes)
