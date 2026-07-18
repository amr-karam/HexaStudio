import { Body, Controller, Headers, HttpCode, HttpStatus, Logger, Post, RawBodyRequest, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBody } from '@nestjs/swagger';
import { createHmac, timingSafeEqual } from 'crypto';
import { Request } from 'express';
import { OdooSyncService } from './odoo-sync.service';
import { getEnv } from '../../config/env';
import type { OdooWebhookPayload } from '@hexastudio/types';

@ApiTags('Odoo Webhook')
@Controller({ path: 'odoo/webhook', version: '1' })
export class OdooWebhookController {
  private readonly logger = new Logger(OdooWebhookController.name);

  constructor(private readonly odooSyncService: OdooSyncService) {}

  @Post()
  @ApiOperation({ summary: 'Receive an Odoo webhook event', description: 'Validates HMAC-SHA256 signature from the x-odoo-signature header and routes the event through the sync service.' })
  @ApiHeader({ name: 'x-odoo-signature', required: true, description: 'HMAC-SHA256 hex digest of the raw request body' })
  @ApiBody({ schema: { type: 'object', properties: { model: { type: 'string' }, id: { type: 'integer' }, action: { type: 'string' }, data: { type: 'object' } } } })
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('x-odoo-signature') signature: string,
    @Body() payload: OdooWebhookPayload,
    @Req() request: RawBodyRequest<Request>,
  ) {
    const secret = getEnv().ODOO_WEBHOOK_SECRET;

    if (!request.rawBody) {
      this.logger.error('Rejected Odoo webhook because the raw request body was unavailable');
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const expected = createHmac('sha256', secret).update(request.rawBody).digest('hex');

    const provided = Buffer.from(signature ?? '');
    const expectedBuf = Buffer.from(expected);
    if (
      !signature ||
      provided.length !== expectedBuf.length ||
      !timingSafeEqual(provided, expectedBuf)
    ) {
      this.logger.warn(`Unauthorized Odoo webhook attempt from ${payload.model}:${payload.id}`);
      throw new UnauthorizedException('Invalid webhook signature');
    }

    this.logger.log(`Odoo webhook received: ${payload.action} on ${payload.model}:${payload.id}`);

    // Route through the sync service (cache + event bus + Strapi bridge).
    await this.odooSyncService.handleWebhook(payload);

    return { success: true, message: 'Webhook processed' };
  }
}
