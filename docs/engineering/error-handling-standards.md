# Error Handling Standards

**Last Updated:** 2026-07-08

---

## Frontend Error Handling

### Error Boundaries

Every 3D scene must be wrapped in an Error Boundary:

```typescript
// ✅ Good — 3D scene error boundary
<ThreeScene>
  <ErrorBoundary fallback={<SceneFallback />}>
    <Scene modelPath={path} />
  </ErrorBoundary>
</ThreeScene>
```

### Component Error Boundary

```typescript
'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error('React error boundary caught error', {
      error: error.message,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
```

### API Error Handling (Frontend)

```typescript
// ✅ Good — Handle all states
function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    retry: 3,
    staleTime: 30000,
  });
}

function ProjectList() {
  const { data, isLoading, error } = useProjects();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!data?.length) return <EmptyState message="No projects yet" />;

  return <Grid>{data.map(project => <ProjectCard key={project.id} project={project} />)}</Grid>;
}
```

## Backend Error Handling (NestJS)

### Global Exception Filter

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let title = 'Internal Server Error';
    let detail = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      title = exception.message;
      detail = exception.getResponse() as string;
    } else if (exception instanceof ValidationError) {
      status = 400;
      title = 'Validation Error';
      detail = this.formatValidationErrors(exception);
    }

    // Log error
    logger.error(title, {
      status,
      path: request.url,
      method: request.method,
      requestId: request.headers['x-request-id'],
      exception: exception instanceof Error ? exception.message : 'Unknown',
    });

    // Send to Sentry
    Sentry.captureException(exception);

    // RFC 7807 response
    response.status(status).json({
      type: `https://api.hexastudio.net/errors/${status}`,
      title,
      status,
      detail,
      instance: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private formatValidationErrors(error: ValidationError): string {
    return Object.values(error.constraints || {}).join(', ');
  }
}
```

### DTO Validation

```typescript
// ✅ Good — DTO with validation
export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  message!: string;

  @IsString()
  @IsOptional()
  company?: string;
}

// ✅ Good — Global validation pipe with strict mode
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,                // Strip unknown properties
  forbidNonWhitelisted: true,     // Throw error on unknown properties
  transform: true,                // Auto-transform types
  disableErrorMessages: process.env.NODE_ENV === 'production',
}));
```

## HTTP Status Codes

| Code | Usage | Example |
|------|-------|---------|
| 200 | Success | GET returns data |
| 201 | Created | POST creates resource |
| 204 | No Content | DELETE succeeds |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Error | Unexpected server error |
| 503 | Service Unavailable | Downstream service down |

## Error Response Format (RFC 7807)

```json
{
  "type": "https://api.hexastudio.net/errors/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "email must be a valid email address",
  "instance": "/v1/contacts",
  "timestamp": "2026-07-08T12:00:00Z",
  "errors": [
    { "field": "email", "message": "must be a valid email", "code": "isEmail" }
  ]
}
```

## Retry Strategy

```typescript
// ✅ Good — Exponential backoff with jitter
async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; baseDelay?: number } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000 } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 100;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Unreachable');
}
```

## Error Monitoring

| Tool | What It Monitors |
|------|-----------------|
| Sentry | Unhandled exceptions, API errors, performance issues |
| Prometheus | Error rate, request duration, 5xx count |
| Loki | Structured logs for post-hoc analysis |
| Uptime Kuma | Service availability monitoring |
