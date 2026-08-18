import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OdooService } from './odoo.service';
import { OdooWebhookService } from './odoo-webhook.service';
import { OdooWebhookController } from './odoo-webhook.controller';
import { OdooWebhookSignatureMiddleware } from './odoo-webhook-signature.middleware';
import { WebhookAdminService } from './webhook-admin.service';
import { WebhookAdminController } from './webhook-admin.controller';
import { WebhookLog } from './entities/webhook-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WebhookLog])],
  controllers: [OdooWebhookController, WebhookAdminController],
  providers: [OdooService, OdooWebhookService, WebhookAdminService],
  exports: [OdooService, OdooWebhookService, WebhookAdminService],
})
export class OdooModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(OdooWebhookSignatureMiddleware)
      .forRoutes({ path: 'odoo/webhook', method: RequestMethod.POST });
  }
}