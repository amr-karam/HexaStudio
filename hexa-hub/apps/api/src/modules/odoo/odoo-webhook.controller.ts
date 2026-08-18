import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException, UseGuards } from '@nestjs/common';
import { OdooWebhookService, WebhookPayload } from './odoo-webhook.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';

@Controller('odoo')
export class OdooWebhookController {
  constructor(
    private readonly webhookService: OdooWebhookService,
  ) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() body: WebhookPayload,
  ) {
    // Signature verification is enforced by OdooWebhookSignatureMiddleware,
    // which verifies the HMAC over the raw request body (see odoo.module.ts).

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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  @HttpCode(HttpStatus.OK)
  async triggerSync(@Body() body: { model?: string }) {
    return this.webhookService.triggerSync(body.model);
  }

  @Post('sync/state')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  @HttpCode(HttpStatus.OK)
  async getSyncState() {
    return { data: this.webhookService.getSyncState() };
  }
}