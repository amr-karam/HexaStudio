import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { AuditService } from './audit.service';
import { AuditAction } from './audit.entity';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Maps HTTP methods to audit action types.
 */
function methodToAction(method: string): AuditAction {
  switch (method) {
    case 'POST':
      return AuditAction.CREATE;
    case 'DELETE':
      return AuditAction.DELETE;
    case 'PUT':
    case 'PATCH':
    default:
      return AuditAction.UPDATE;
  }
}

/**
 * Extracts a human-readable entity type from the request path.
 * Example: /api/v1/users/abc-123 → users
 */
function extractEntityType(path: string): string {
  const segments = path.replace(/^\/api\/v\d+\//, '').split('/');
  return segments[0] || 'unknown';
}

/**
 * Extracts an entity ID from the request path.
 * Example: /api/v1/users/abc-123 → abc-123
 */
function extractEntityId(path: string): string {
  const segments = path.replace(/^\/api\/v\d+\//, '').split('/');
  return segments[1] || 'unknown';
}

/**
 * Strips sensitive fields (passwords, tokens) from the payload
 * before persisting to the audit log.
 */
function sanitizePayload(payload: unknown): Record<string, unknown> | null {
  if (!payload || typeof payload !== 'object') return null;

  const sensitiveKeys = [
    'password',
    'newPassword',
    'currentPassword',
    'token',
    'refreshToken',
    'accessToken',
    'secret',
    'apiKey',
  ];

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizePayload(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

interface AuthenticatedRequest extends Request {
  user?: { id?: string; sub?: string };
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<AuthenticatedRequest>();
    const response = httpContext.getResponse<Response>();
    const method = request.method.toUpperCase();

    // Only audit mutation requests
    if (!MUTATION_METHODS.has(method)) {
      return next.handle();
    }

    const entityType = extractEntityType(request.path);
    const entityId = extractEntityId(request.path);
    const action = methodToAction(method);
    const userId = request.user?.id ?? request.user?.sub ?? null;
    const ipAddress = this.getClientIp(request);
    const userAgent = request.headers['user-agent'] ?? null;
    const newValues = sanitizePayload(request.body);

    return next.handle().pipe(
      tap({
        next: () => {
          // Successfully handled — log with response status
          this.auditService.log({
            userId,
            action,
            entityType,
            entityId,
            newValues,
            ipAddress,
            userAgent,
            method,
            endpoint: request.path,
            statusCode: response.statusCode,
          });
        },
        error: (error) => {
          // Error occurred — still log the attempt
          const statusCode =
            error?.status ?? error?.statusCode ?? response.statusCode ?? 500;

          this.auditService.log({
            userId,
            action,
            entityType,
            entityId,
            newValues,
            ipAddress,
            userAgent,
            method,
            endpoint: request.path,
            statusCode,
          });
        },
      }),
    );
  }

  /**
   * Extracts the real client IP considering proxy headers.
   */
  private getClientIp(request: AuthenticatedRequest): string {
    const forwarded = request.headers['x-forwarded-for'] as string | undefined;
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    return (
      request.headers['x-real-ip'] as string
      || request.socket?.remoteAddress
      || 'unknown'
    );
  }
}
