import { Module } from '@nestjs/common';
import { OdooService } from './odoo.service';
import { OdooWebhookService } from './odoo-webhook.service';
import { OdooWebhookController } from './odoo-webhook.controller';

@Module({
  controllers: [OdooWebhookController],
  providers: [OdooService, OdooWebhookService],
  exports: [OdooService, OdooWebhookService],
})
export class OdooModule {}
