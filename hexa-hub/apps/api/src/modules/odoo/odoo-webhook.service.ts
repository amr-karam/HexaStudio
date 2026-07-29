import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OdooService } from './odoo.service';
import { WebhookLog } from './entities/webhook-log.entity';
import { EventBusService } from '../../common/events/event-bus.service';

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

  constructor(
    private readonly odooService: OdooService,
    @InjectRepository(WebhookLog)
    private readonly webhookLogRepository: Repository<WebhookLog>,
    private readonly eventBus: EventBusService,
  ) {}

  async processWebhook(payload: WebhookPayload): Promise<{ processed: boolean; message: string }> {
    const { model, id, action } = payload;
    this.logger.log(`Processing webhook: ${model} #${id} (${action})`);

    // Create log entry with 'pending' status
    const logEntry = this.webhookLogRepository.create({
      model,
      recordId: id,
      action,
      status: 'pending',
      payload: payload as unknown as Record<string, unknown>,
      signature: null,
      retryCount: 0,
    });
    const savedLog = await this.webhookLogRepository.save(logEntry);

    try {
      // Route to model-specific handlers
      const handlers = this.eventHandlers.get(model) || [];
      for (const handler of handlers) {
        await handler(payload);
      }

      // Emit domain event for cross-module reactions
      this.emitDomainEvent(payload);

      // Update log to success
      savedLog.status = 'success';
      savedLog.processedAt = new Date();
      savedLog.response = { message: 'Webhook processed successfully' };
      await this.webhookLogRepository.save(savedLog);

      this.logger.log(`Webhook processed successfully: ${model} #${id}`);
      return { processed: true, message: 'Webhook processed' };
    } catch (error) {
      // Update log to failed
      savedLog.status = 'failed';
      savedLog.error = error instanceof Error ? error.message : String(error);
      savedLog.nextRetryAt = new Date(Date.now() + 5 * 60 * 1000); // retry in 5 min
      await this.webhookLogRepository.save(savedLog);

      this.logger.error(`Webhook processing failed for ${model} #${id}: ${savedLog.error}`);
      throw error;
    }
  }

  private emitDomainEvent(payload: WebhookPayload): void {
    const { model, id, action, data } = payload;

    switch (model) {
      case 'account.move':
        if (action === 'create') {
          this.eventBus.emitInvoiceCreated({
            invoiceId: id,
            invoiceNumber: (data.name as string) || `#${id}`,
            partnerId: (data.partner_id as number) || 0,
            partnerName: (data.partner_name as string) || 'Unknown',
            amountTotal: (data.amount_total as number) || 0,
            currency: (data.currency_id as string) || 'USD',
            date: (data.invoice_date as string) || new Date().toISOString(),
          });
        } else if (action === 'update' && data.payment_state === 'paid') {
          this.eventBus.emitInvoicePaid({
            invoiceId: id,
            invoiceNumber: (data.name as string) || `#${id}`,
            partnerId: (data.partner_id as number) || 0,
            partnerName: (data.partner_name as string) || 'Unknown',
            amountTotal: (data.amount_total as number) || 0,
            currency: (data.currency_id as string) || 'USD',
            paymentDate: (data.payment_date as string) || new Date().toISOString(),
          });
        }
        break;

      case 'crm.lead':
        if (action === 'create') {
          this.eventBus.emitLeadCreated({
            leadId: id,
            leadName: (data.name as string) || `Lead #${id}`,
            contactName: (data.contact_name as string) || '',
            email: (data.email_from as string) || '',
            source: (data.x_hexa_source as string) || 'odoo',
            stage: (data.stage_name as string) || 'New',
          });
        } else if (action === 'update' && data.stage_name === 'Won') {
          this.eventBus.emitLeadConverted({
            leadId: id,
            leadName: (data.name as string) || `Lead #${id}`,
            partnerId: (data.partner_id as number) || 0,
            partnerName: (data.partner_name as string) || 'Unknown',
            convertedDate: (data.date_conversion as string) || new Date().toISOString(),
          });
        }
        break;

      case 'project.project':
        if (action === 'create') {
          this.eventBus.emitProjectCreated({
            projectId: id,
            projectName: (data.name as string) || `Project #${id}`,
            partnerId: (data.partner_id as number) || 0,
            partnerName: (data.partner_name as string) || 'Unknown',
            managerId: (data.user_id as number) || 0,
            startDate: (data.date_start as string) || new Date().toISOString(),
          });
        } else if (action === 'update' && data.stage === 'Done') {
          this.eventBus.emitProjectCompleted({
            projectId: id,
            projectName: (data.name as string) || `Project #${id}`,
            partnerId: (data.partner_id as number) || 0,
            partnerName: (data.partner_name as string) || 'Unknown',
            completedDate: (data.date as string) || new Date().toISOString(),
          });
        }
        break;

      case 'project.task':
        if (action === 'update' && data.stage === 'Done') {
          this.eventBus.emitTaskCompleted({
            taskId: id,
            taskName: (data.name as string) || `Task #${id}`,
            projectId: (data.project_id as number) || 0,
            projectName: (data.project_name as string) || 'Unknown',
            assigneeId: (data.user_id as number) || 0,
            completedDate: (data.date_last_stage_update as string) || new Date().toISOString(),
          });
        }
        break;

      case 'project.milestone':
        if (action === 'update' && data.completed === true) {
          this.eventBus.emitMilestoneReached({
            milestoneId: id,
            milestoneName: (data.name as string) || `Milestone #${id}`,
            projectId: (data.project_id as number) || 0,
            projectName: (data.project_name as string) || 'Unknown',
            reachedDate: (data.completed_date as string) || new Date().toISOString(),
          });
        }
        break;

      case 'sale.order':
        if (action === 'update' && data.state === 'sale') {
          this.eventBus.emitQuotationAccepted({
            quotationId: id,
            quotationName: (data.name as string) || `Quotation #${id}`,
            partnerId: (data.partner_id as number) || 0,
            partnerName: (data.partner_name as string) || 'Unknown',
            amountTotal: (data.amount_total as number) || 0,
            currency: (data.currency_id as string) || 'USD',
            acceptedDate: (data.date_order as string) || new Date().toISOString(),
          });
        }
        break;

      case 'documents.document':
        if (action === 'create' && data.document_type === 'deliverable') {
          this.eventBus.emitDeliverableSubmitted({
            deliverableId: id,
            deliverableName: (data.name as string) || `Deliverable #${id}`,
            projectId: (data.project_id as number) || 0,
            projectName: (data.project_name as string) || 'Unknown',
            submittedDate: (data.create_date as string) || new Date().toISOString(),
          });
        }
        break;

      default:
        this.logger.debug(`No domain event mapping for model: ${model}`);
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
    return { synced: 0, errors: 0 };
  }
}
