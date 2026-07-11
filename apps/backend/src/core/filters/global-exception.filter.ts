import {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import { ApiResponse } from '@hexastudio/types';

function resolveMessage(exception: HttpException | unknown): string {
  if (!(exception instanceof HttpException)) {
    return 'Internal server error';
  }

  const response = exception.getResponse();
  if (typeof response === 'string') {
    return response;
  }

  if (typeof response === 'object' && response !== null && 'message' in response) {
    const { message } = response as { message?: string | string[] };
    return Array.isArray(message) ? message.join(', ') : (message ?? 'An error occurred');
  }

  return 'An error occurred';
}

/**
 * Global Exception Filter to ensure consistent API error responses.
 * Maps all exceptions to a standardized ApiResponse format.
 */
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const isProduction = process.env.NODE_ENV === 'production';
    const message = resolveMessage(exception);

    // Never let an error pass through unobserved. Server-side faults (5xx) are
    // logged with their stack and reported to Sentry; client errors (4xx) are
    // logged at a lower level for diagnostics without adding noise.
    const context = `${request.method} ${request.url}`;
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${status} ${context} - ${message}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
      Sentry.captureException(exception);
    } else {
      this.logger.warn(`${status} ${context} - ${message}`);
    }

    const errorResponse: ApiResponse<null> = {
      data: null,
      status,
      message,
      error:
        !isProduction && exception instanceof Error
          ? { message: exception.message, code: 'INTERNAL_ERROR' }
          : undefined,
    };

    response.status(status).json(errorResponse);
  }
}
