# Logging Standards

**Last Updated:** 2026-07-08

---

## Format

All logs must be structured **JSON** for machine parsing and aggregation in Loki.

```json
{
  "timestamp": "2026-07-08T12:00:00.000Z",
  "level": "info",
  "service": "backend",
  "message": "User logged in successfully",
  "context": {
    "userId": "uuid",
    "ip": "::1",
    "userAgent": "Mozilla/5.0..."
  },
  "requestId": "req-uuid",
  "duration_ms": 45
}
```

## Log Levels

| Level | Usage | Example |
|-------|-------|---------|
| `error` | Failures that need human attention | Database connection failed, API call failed |
| `warn` | Recoverable issues | Rate limit approaching, deprecated API used |
| `info` | Normal flow events | User login, project created, form submitted |
| `debug` | Development-only details | Function entry/exit, variable values |
| `trace` | Deep debugging | HTTP request/response bodies |

## Service Name Convention

| Service | `service` field |
|---------|----------------|
| Next.js Frontend | `frontend` |
| NestJS API | `backend` |
| Strapi CMS | `cms` |
| Odoo ERP | `odoo` |
| Database | `postgres` |
| Cache | `redis` |
| Storage | `minio` |

## Implementation

### Frontend (Next.js)

```typescript
// lib/logger.ts
enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: 'frontend',
    message,
    context,
    requestId: getRequestId(),
  };

  // In development, pretty-print to console
  if (process.env.NODE_ENV === 'development') {
    console[level](`[${level.toUpperCase()}] ${message}`, context ?? '');
  }

  // In production, send to logging backend (or just console for Loki capture)
  if (process.env.NODE_ENV === 'production') {
    console[level](JSON.stringify(entry));
  }
}

export const logger = {
  error: (message: string, context?: Record<string, unknown>) => log(LogLevel.ERROR, message, context),
  warn: (message: string, context?: Record<string, unknown>) => log(LogLevel.WARN, message, context),
  info: (message: string, context?: Record<string, unknown>) => log(LogLevel.INFO, message, context),
  debug: (message: string, context?: Record<string, unknown>) => log(LogLevel.DEBUG, message, context),
};
```

### Backend (NestJS)

```typescript
// Use NestJS built-in Logger with structured output
import { Logger } from '@nestjs/common';

const logger = new Logger('ProjectsService');

// ✅ Good
logger.log({ message: 'Project created', projectId: id, duration_ms: elapsed });

// ❌ Bad
console.log('Project created:', id);
```

## What to Log

### Always Log
- Authentication events (login, logout, failed login)
- CRUD operations on business data (project created, contact form submitted)
- Integration calls (Strapi sync, Odoo sync)
- Errors and exceptions (with stack traces)
- Performance anomalies (slow queries, timeouts)
- Security events (unauthorized access attempts)

### Never Log
- Passwords or password hashes
- JWT secrets or API keys
- Full credit card numbers
- Personal data beyond what's necessary
- File contents or binary data

## Log Retention

| Environment | Retention | Destination |
|-------------|-----------|-------------|
| Development | 7 days | Console |
| Staging | 14 days | Loki |
| Production | 30 days | Loki (with cold storage archive) |
| Audit logs | 1 year | Loki + encrypted S3 backup |
