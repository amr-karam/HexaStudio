import { Injectable, Logger, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { OdooService } from './odoo.service';

/**
 * Verifies the HMAC-SHA256 signature of incoming Odoo webhooks over the RAW
 * request body (the exact bytes transmitted by Odoo), before any handler runs.
 *
 * Requires the global body parser to be created with `rawBody: true`
 * (see main.ts) so that `req.rawBody` holds the untransformed payload.
 */
@Injectable()
export class OdooWebhookSignatureMiddleware implements NestMiddleware {
  private readonly logger = new Logger(OdooWebhookSignatureMiddleware.name);

  constructor(private readonly odooService: OdooService) {}

  use(req: RawBodyRequest<Request>, _res: Response, next: NextFunction): void {
    const signature = req.headers['x-odoo-signature'];

    if (typeof signature !== 'string' || signature.length === 0) {
      this.logger.warn('Webhook rejected: missing x-odoo-signature header');
      throw new UnauthorizedException('Missing x-odoo-signature header');
    }

    const rawBody = req.rawBody;
    if (rawBody === undefined || !Buffer.isBuffer(rawBody) || rawBody.length === 0) {
      this.logger.warn('Webhook rejected: request body could not be captured for signature verification');
      throw new UnauthorizedException('Invalid webhook request body');
    }

    if (!this.odooService.verifyWebhookSignature(rawBody.toString('utf8'), signature)) {
      this.logger.warn('Webhook rejected: invalid signature');
      throw new UnauthorizedException('Invalid webhook signature');
    }

    next();
  }
}