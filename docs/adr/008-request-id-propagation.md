# ADR-008: Request ID Propagation for End-to-End Traceability

## Status
Accepted

## Date
2026-07-26

## Context
Requests flowing through HEXA Studio traverse multiple layers: Cloudflare → Traefik → Frontend (Next.js) → Backend (NestJS) → Database/External APIs. Without a correlation ID, it was impossible to:

1. Match a frontend error to the corresponding backend log entry
2. Track a user's request across service boundaries during incident investigation
3. Provide unique identifiers in API responses for client-side debugging

## Decision
We will generate a `X-Request-ID` at the earliest possible point (Next.js middleware) and propagate it through all downstream services.

Implementation:
- **Generation**: UUID v4 created in `apps/frontend/src/middleware.ts` for every incoming request
- **Propagation**: Passed as `X-Request-ID` header to the backend via fetch calls
- **Backend handling**: NestJS `RequestIdMiddleware` reads the header (or generates if missing) and attaches it to the request context
- **Response**: `X-Request-ID` included in all API responses
- **Logging**: Request ID included in all structured log entries via the logger context
- **Tracing**: Request ID set as a span attribute in OpenTelemetry traces

## Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| Cloudflare Ray ID | No code changes needed | Only available for proxied requests; lost on errors |
| Backend-only generation | Simpler | Cannot correlate frontend errors to backend traces |
| No request IDs | Zero overhead | Impossible to debug cross-service issues |

## Rationale
- Frontend generation ensures the ID exists before any backend processing
- UUID v4 provides uniqueness without centralized ID generation service
- Middleware runs on every request with minimal overhead
- Standards-compliant (uses `X-Request-ID` header per RFC)

## Consequences
- All API responses now include a traceable `X-Request-ID` header
- Frontend middleware adds ~0.1ms per request (UUID generation)
- Backend middleware must be registered before any other middleware
- Client applications can use the header when reporting errors

## References
- `apps/frontend/src/middleware.ts` — Request ID generation (Next.js middleware)
- `apps/backend/src/common/middleware/request-id.middleware.ts` — NestJS middleware
- `docs/devops/OBSERVABILITY.md` — Observability governance
