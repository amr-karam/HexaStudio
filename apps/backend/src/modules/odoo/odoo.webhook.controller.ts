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
          const data = await this.odooService.searchRead(
            payload.model,
            [[['id', '=', payload.id]]],
            ['name', 'stage_id', 'x_slug']
          );

          if (data && data.length > 0) {
            const project = data[0];
            this.logger.log(`Syncing project ${project.name} (slug: ${project.x_slug}) to Strapi...`);
            
            // In a production environment, we would call the Strapi API here
            // Example: await this.strapiService.updateProject(project.x_slug, { 
            //   status: project.stage_id,
            //   updatedAt: new Date()
            // });
            
            this.logger.log(`Successfully synced Odoo Project ${payload.id} to Strapi.`);
          }
        }
      } catch (error) {
        this.logger.error(`Error syncing Odoo data for ${payload.model}:${payload.id}:`, error);
      }
    }
}
