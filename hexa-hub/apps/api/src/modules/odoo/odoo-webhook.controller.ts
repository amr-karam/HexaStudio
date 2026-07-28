import { Controller, Post, Body, Headers, HttpCode, HttpStatus, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { OdooWebhookService, WebhookPayload } from './odoo-webhook.service';
import { OdooService } from './odoo.service';

@Controller('odoo')
export class OdooWebhookController {
  private readonly logger = new Logger(OdooWebhookController.name);

  constructor(
    private readonly webhookService: OdooWebhookService,
    private readonly odooService: OdooService,
  ) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() body: WebhookPayload,
    @Headers('x-odoo-signature') signature: string,
  ) {
    // Verify signature
    if (signature) {
      const bodyStr = JSON.stringify(body);
      if (!this.odooService.verifyWebhookSignature(bodyStr, signature)) {
        this.logger.warn('Invalid webhook signature received');
        throw new UnauthorizedException('Invalid webhook signature');
      }
    }

    // Validate payload
    if (!body.model || !body.id || !body.action) {
      throw new BadRequestException('Invalid webhook payload: model, id, and action are required');
    }

    const validActions = ['create', 'update', 'delete'];
    if (!validActions.includes(body.action)) {
      throw new BadRequestException(`Invalid action: ${body.action}. Must be one of: ${validActions.join(', ')}`);
    }

    return this.webhookService.processWebhook(body);
  }

  @Post('sync/trigger')
  @HttpCode(HttpStatus.OK)
  async triggerSync(@Body() body: { model?: string }) {
    return this.webhookService.triggerSync(body.model);
  }

  @Post('sync/state')
  @HttpCode(HttpStatus.OK)
  async getSyncState() {
    return { data: this.webhookService.getSyncState() };
  }
}
