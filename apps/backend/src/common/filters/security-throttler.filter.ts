import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Request, Response } from 'express';

@Catch(ThrottlerException)
export class SecurityThrottlerFilter implements ExceptionFilter {
  private readonly logger = new Logger('SecurityRateLimitAlert');

  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const ip = request.ip || request.headers['x-forwarded-for'] || request.socket.remoteAddress;
    const userAgent = request.headers['user-agent'] || 'unknown';
    const path = request.url;
    const method = request.method;

    this.logger.warn(
      `[RATE LIMIT EXCEEDED] IP: ${ip} | Method: ${method} | Path: ${path} | User-Agent: ${userAgent} | Timestamp: ${new Date().toISOString()}`,
    );

    response.status(HttpStatus.TOO_MANY_REQUESTS).json({
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please wait before attempting further requests.',
      timestamp: new Date().toISOString(),
      path,
    });
  }
}
