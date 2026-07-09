import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OdooService } from './odoo.service';
import { OdooWebhookController } from './odoo.webhook.controller';

@Module({
  imports: [ConfigModule],
  controllers: [OdooWebhookController],
  providers: [OdooService],
  exports: [OdooService],
})
export class OdooModule {}
