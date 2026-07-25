import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UnauthorizedException,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBody } from '@nestjs/swagger';
import { timingSafeEqual } from 'crypto';
import { StrapiProjectSyncService } from './strapi-project-sync.service';
import { getEnv } from '../../config/env';

/**
 * Payload shape expected from Strapi webhooks.
 * Strapi 5 sends: { event, model, entry, ... }
 */
interface StrapiWebhookBody {
  event: string; // e.g. "entry.create", "entry.update", "entry.delete"
  model: string; // e.g. "portfolio"
  entry: Record<string, unknown>;
}

@ApiTags('Strapi Webhook')
@Controller({ path: 'strapi/webhook', version: ['1', VERSION_NEUTRAL] })
export class StrapiWebhookController {
  private readonly logger = new Logger(StrapiWebhookController.name);

  constructor(private readonly strapiProjectSyncService: StrapiProjectSyncService) {}

  @Post()
  @ApiOperation({
    summary: 'Receive a Strapi webhook event',
    description:
      'Validates the x-strapi-secret header, then routes portfolio events to the ' +
      'bidirectional sync service so Strapi entries are mirrored to Odoo projects.',
  })
  @ApiHeader({
    name: 'x-strapi-secret',
    required: true,
    description: 'Shared secret configured in Strapi admin → Settings → Webhooks',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        event: { type: 'string', example: 'entry.create' },
        model: { type: 'string', example: 'portfolio' },
        entry: { type: 'object' },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('x-strapi-secret') signature: string,
    @Body() payload: StrapiWebhookBody,
  ) {
    const secret = getEnv().STRAPI_WEBHOOK_SECRET;

    if (!secret) {
      this.logger.warn('STRAPI_WEBHOOK_SECRET is not configured — skipping Strapi webhook validation');
      return { success: false, message: 'Webhook secret not configured on server' };
    }

    // Timing-safe compare of the shared secret
    const provided = Buffer.from(signature ?? '');
    const expected = Buffer.from(secret);
    if (
      !signature ||
      provided.length !== expected.length ||
      !timingSafeEqual(provided, expected)
    ) {
      this.logger.warn('Unauthorized Strapi webhook attempt — invalid secret');
      throw new UnauthorizedException('Invalid webhook secret');
    }

    this.logger.log(`Strapi webhook received: ${payload.event} on ${payload.model}`);

    // Only process portfolio entries
    if (payload.model !== 'portfolio') {
      return { success: true, message: `Event ignored — model "${payload.model}" not mapped` };
    }

    const entry = payload.entry;
    const slug =
      (entry.slug as string) ??
      ((entry.attributes as Record<string, unknown>)?.slug as string);

    if (!slug) {
      this.logger.debug('Strapi webhook received but entry has no slug — skipping');
      return { success: true, message: 'Event ignored — entry has no slug' };
    }

    switch (payload.event) {
      case 'entry.create':
      case 'entry.update':
        await this.strapiProjectSyncService.syncPortfolioToOdoo(slug);
        break;
      case 'entry.delete':
        this.logger.log(`Portfolio "${slug}" deleted in Strapi — Odoo project not auto-deleted`);
        // Odoo deletion is intentionally not automatic (safety measure)
        break;
      case 'entry.publish':
      case 'entry.unpublish':
        await this.strapiProjectSyncService.syncPortfolioToOdoo(slug);
        break;
      default:
        this.logger.debug(`Unhandled Strapi event: ${payload.event}`);
    }

    return { success: true, message: 'Webhook processed' };
  }
}
