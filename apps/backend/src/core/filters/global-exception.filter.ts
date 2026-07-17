import {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import type { ApiResponse } from '@hexastudio/types';

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
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const isProduction = process.env.NODE_ENV === 'production';

    const errorResponse: ApiResponse<null> = {
      data: null,
      status,
      message: resolveMessage(exception),
      error:
        !isProduction && exception instanceof Error
          ? { message: exception.message, code: 'INTERNAL_ERROR' }
          : undefined,
    };

    response.status(status).json(errorResponse);
  }
}
