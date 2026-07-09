import { Controller, Post, Body, Headers, UnauthorizedException, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { OdooService } from './odoo.service';
import { getEnv } from '../../config/env';

interface OdooWebhookPayload {
  model: string;
  id: number;
  action: 'create' | 'update' | 'delete';
  data?: Record<string, unknown>;
}

@Controller('odoo/webhook')
export class OdooWebhookController {
  private readonly logger = new Logger(OdooWebhookController.name);

  constructor(private readonly odooService: OdooService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('x-odoo-signature') signature: string,
    @Body() payload: OdooWebhookPayload,
  ) {
    const secret = getEnv().ODOO_WEBHOOK_SECRET;

    if (!signature || signature !== secret) {
      this.logger.warn(`Unauthorized Odoo webhook attempt from ${payload.model}:${payload.id}`);
      throw new UnauthorizedException('Invalid webhook signature');
    }

    this.logger.log(`Odoo webhook received: ${payload.action} on ${payload.model}:${payload.id}`);

    // Trigger the sync logic
    await this.syncData(payload);

    return { success: true, message: 'Webhook processed' };
  }

  private async syncData(payload: OdooWebhookPayload) {
    try {
      if (payload.model === 'project.project') {
        // Here we would trigger a cache invalidation or a Strapi update
        // For now, we log it and call the Odoo service to verify the data
        const data = await this.odooService.searchRead(
          payload.model,
          [[['id', '=', payload.id]]],
          ['name', 'stage_id', 'x_slug']
        );
        this.logger.log(`Synced Odoo Project ${payload.id}: ${JSON.stringify(data)}`);
      }
      // Handle other models (e.g., res.partner) as needed
    } catch (error) {
      this.logger.error(`Error syncing Odoo data for ${payload.model}:${payload.id}:`, error);
    }
  }
}
