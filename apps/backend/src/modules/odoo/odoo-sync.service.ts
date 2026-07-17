import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OdooService } from './odoo.service';
import { RedisService } from '../storage/redis.service';
import { EventBus } from '../realtime/event-bus.service';
import { OdooWebhookPayload } from '@hexastudio/types';

export interface SyncState {
  lastSync: number;
  lastError?: string;
  counts: Record<string, number>;
}

const SYNC_INTERVAL_MS = 10 * 60 * 1000;
const PENDING_LEADS_KEY = 'odoo:pending-leads';

/**
 * Reconciles Odoo business data into the NestJS cache and emits domain events.
 * Acts as the single bidirectional bridge between Odoo and the rest of the platform.
 */
@Injectable()
export class OdooSyncService implements OnModuleInit {
  private readonly logger = new Logger(OdooSyncService.name);
  private state: SyncState = { lastSync: 0, counts: {} };

  constructor(
    private readonly odooService: OdooService,
    private readonly redisService: RedisService,
    private readonly eventBus: EventBus,
  ) {}

  onModuleInit() {
    this.logger.log('OdooSyncService initialized. Scheduled pull active (every 10 min).');
    void this.pullAll();
    setInterval(() => void this.pullAll(), SYNC_INTERVAL_MS);
  }

  getState(): SyncState {
    return this.state;
  }

  /** Handle an inbound webhook from Odoo (real-time push). */
  async handleWebhook(payload: OdooWebhookPayload): Promise<void> {
    const key = `odoo:sync:${payload.model}:${payload.id}`;
    await this.redisService.set(key, payload, 3600);

    switch (payload.model) {
      case 'project.project':
        await this.syncProject(payload);
        this.eventBus.emit('odoo:project', payload);
        break;
      case 'crm.lead':
        this.eventBus.emit('odoo:lead', payload);
        break;
      case 'account.move':
        this.eventBus.emit('odoo:invoice', payload);
        break;
      case 'sync':
        await this.pullAll();
        break;
      default:
        this.logger.debug(`Unmapped Odoo webhook model: ${payload.model}`);
    }
  }

  private async syncProject(payload: OdooWebhookPayload): Promise<void> {
    const data = await this.odooService.searchRead(
      'project.project',
      [['id', '=', payload.id]],
      ['name', 'stage_id', 'x_slug', 'x_hexa_status', 'x_hexa_type', 'x_hexa_client_portal_active'],
    );
    if (data?.length) {
      await this.redisService.set(`odoo:project:${payload.id}`, data[0], 900);
    }
  }

  /** Scheduled fallback pull — reconciles recent Odoo changes every 10 minutes. */
  async pullAll(): Promise<void> {
    try {
      const [leads, projects, invoices] = await Promise.all([
        this.odooService.searchRead('crm.lead', [], ['id', 'stage_id'], false),
        this.odooService.searchRead('project.project', [], ['id', 'x_slug', 'stage_id'], false),
        this.odooService.searchRead('account.move', [['move_type', '=', 'out_invoice']], ['id'], false),
      ]);
      this.state = {
        lastSync: Date.now(),
        counts: {
          leads: leads.length,
          projects: projects.length,
          invoices: invoices.length,
        },
      };
      this.logger.log(
        `Odoo scheduled pull complete: ${leads.length} leads, ${projects.length} projects, ${invoices.length} invoices`,
      );

      // Flush any pending leads that were queued while Odoo was unavailable
      await this.flushPendingLeads();
    } catch (error) {
      this.state.lastError = (error as Error).message;
      this.logger.warn(`Odoo scheduled pull failed: ${(error as Error).message}`);
    }
  }

  /** Flush pending leads from Redis queue to Odoo. */
  async flushPendingLeads(): Promise<void> {
    const pendingCount = await this.redisService.llen(PENDING_LEADS_KEY);
    if (pendingCount === 0) return;

    this.logger.log(`Flushing ${pendingCount} pending leads from Redis queue`);
    const pendingLeads = await this.redisService.lrange<Record<string, unknown>>(PENDING_LEADS_KEY, 0, pendingCount - 1);

    let flushed = 0;
    for (const leadData of pendingLeads) {
      try {
        await this.odooService.create('crm.lead', leadData);
        await this.redisService.lrem(PENDING_LEADS_KEY, 1, leadData);
        flushed++;
      } catch (error) {
        this.logger.warn(`Failed to flush pending lead: ${(error as Error).message}`);
        break; // Stop if Odoo is still unavailable
      }
    }

    if (flushed > 0) {
      this.logger.log(`Flushed ${flushed} pending leads to Odoo`);
    }
  }
}
