import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBus } from '../realtime/event-bus.service';
import { RedisService } from '../storage/redis.service';
import type { OdooWebhookPayload } from '@hexastudio/types';

/**
 * Consumes Odoo domain events from the EventBus and keeps derived caches fresh.
 * On a project change it invalidates the Odoo project cache entry so the next
 * Strapi-enriched project read reflects the latest Odoo state.
 */
@Injectable()
export class OdooEventListener implements OnModuleInit {
  private readonly logger = new Logger(OdooEventListener.name);

  constructor(
    private readonly eventBus: EventBus,
    private readonly redisService: RedisService,
  ) {}

  onModuleInit() {
    this.eventBus.on('odoo:project', (payload) => this.onProject(payload));
  }

  private async onProject(payload: unknown): Promise<void> {
    const p = payload as OdooWebhookPayload;
    try {
      await this.redisService.del(`odoo:project:${p.id}`);
      this.logger.log(`Invalidated Odoo project cache for #${p.id}`);
    } catch (error) {
      this.logger.warn(`Failed to invalidate Odoo project cache: ${(error as Error).message}`);
    }
  }
}
