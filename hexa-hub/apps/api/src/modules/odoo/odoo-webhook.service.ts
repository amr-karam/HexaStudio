import { Injectable, Logger } from '@nestjs/common';
import { OdooService } from './odoo.service';

export interface WebhookPayload {
  model: string;
  id: number;
  action: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;
  timestamp?: string;
}

@Injectable()
export class OdooWebhookService {
  private readonly logger = new Logger(OdooWebhookService.name);
  private readonly eventHandlers = new Map<string, ((payload: WebhookPayload) => Promise<void>)[]>();

  constructor(private readonly odooService: OdooService) {}

  async processWebhook(payload: WebhookPayload): Promise<{ processed: boolean; message: string }> {
    const { model, id, action } = payload;
    this.logger.log(`Processing webhook: ${model} #${id} (${action})`);

    try {
      // Route to model-specific handlers
      const handlers = this.eventHandlers.get(model) || [];
      for (const handler of handlers) {
        await handler(payload);
      }

      // Emit domain event (placeholder for event bus)
      this.logger.log(`Webhook processed successfully: ${model} #${id}`);

      return { processed: true, message: 'Webhook processed' };
    } catch (error) {
      this.logger.error(`Webhook processing failed for ${model} #${id}: ${error.message}`);
      throw error;
    }
  }

  onModelEvent(model: string, handler: (payload: WebhookPayload) => Promise<void>): void {
    const handlers = this.eventHandlers.get(model) || [];
    handlers.push(handler);
    this.eventHandlers.set(model, handlers);
  }

  getSyncState(): Array<{ model: string; status: string; lastSync: string }> {
    return [
      { model: 'crm.lead', status: 'active', lastSync: new Date().toISOString() },
      { model: 'res.partner', status: 'active', lastSync: new Date().toISOString() },
      { model: 'project.project', status: 'active', lastSync: new Date().toISOString() },
      { model: 'sale.order', status: 'active', lastSync: new Date().toISOString() },
      { model: 'account.move', status: 'active', lastSync: new Date().toISOString() },
      { model: 'project.task', status: 'active', lastSync: new Date().toISOString() },
      { model: 'mail.activity', status: 'active', lastSync: new Date().toISOString() },
    ];
  }

  async triggerSync(model?: string): Promise<{ synced: number; errors: number }> {
    this.logger.log(`Triggering sync for ${model || 'all models'}`);
    // Placeholder: in production, this would trigger a background job
    return { synced: 0, errors: 0 };
  }
}
