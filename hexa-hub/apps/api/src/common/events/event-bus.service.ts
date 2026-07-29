import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEvent } from './event-types';
import {
  InvoiceCreatedPayload,
  InvoicePaidPayload,
  LeadCreatedPayload,
  LeadConvertedPayload,
  ProjectCreatedPayload,
  ProjectCompletedPayload,
  TaskCompletedPayload,
  MilestoneReachedPayload,
  QuotationAcceptedPayload,
  DeliverableSubmittedPayload,
} from './event-payloads';

@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  // ─── Invoice Events ─────────────────────────────────────────────────────

  emitInvoiceCreated(payload: InvoiceCreatedPayload): void {
    this.logger.log(`Emitting ${DomainEvent.INVOICE_CREATED} for invoice #${payload.invoiceNumber}`);
    this.eventEmitter.emit(DomainEvent.INVOICE_CREATED, payload);
  }

  emitInvoicePaid(payload: InvoicePaidPayload): void {
    this.logger.log(`Emitting ${DomainEvent.INVOICE_PAID} for invoice #${payload.invoiceNumber}`);
    this.eventEmitter.emit(DomainEvent.INVOICE_PAID, payload);
  }

  // ─── Lead Events ────────────────────────────────────────────────────────

  emitLeadCreated(payload: LeadCreatedPayload): void {
    this.logger.log(`Emitting ${DomainEvent.LEAD_CREATED} for lead "${payload.leadName}"`);
    this.eventEmitter.emit(DomainEvent.LEAD_CREATED, payload);
  }

  emitLeadConverted(payload: LeadConvertedPayload): void {
    this.logger.log(`Emitting ${DomainEvent.LEAD_CONVERTED} for lead "${payload.leadName}"`);
    this.eventEmitter.emit(DomainEvent.LEAD_CONVERTED, payload);
  }

  // ─── Project Events ─────────────────────────────────────────────────────

  emitProjectCreated(payload: ProjectCreatedPayload): void {
    this.logger.log(`Emitting ${DomainEvent.PROJECT_CREATED} for project "${payload.projectName}"`);
    this.eventEmitter.emit(DomainEvent.PROJECT_CREATED, payload);
  }

  emitProjectCompleted(payload: ProjectCompletedPayload): void {
    this.logger.log(`Emitting ${DomainEvent.PROJECT_COMPLETED} for project "${payload.projectName}"`);
    this.eventEmitter.emit(DomainEvent.PROJECT_COMPLETED, payload);
  }

  // ─── Task Events ────────────────────────────────────────────────────────

  emitTaskCompleted(payload: TaskCompletedPayload): void {
    this.logger.log(`Emitting ${DomainEvent.TASK_COMPLETED} for task "${payload.taskName}"`);
    this.eventEmitter.emit(DomainEvent.TASK_COMPLETED, payload);
  }

  // ─── Milestone Events ───────────────────────────────────────────────────

  emitMilestoneReached(payload: MilestoneReachedPayload): void {
    this.logger.log(`Emitting ${DomainEvent.MILESTONE_REACHED} for milestone "${payload.milestoneName}"`);
    this.eventEmitter.emit(DomainEvent.MILESTONE_REACHED, payload);
  }

  // ─── Quotation Events ───────────────────────────────────────────────────

  emitQuotationAccepted(payload: QuotationAcceptedPayload): void {
    this.logger.log(`Emitting ${DomainEvent.QUOTATION_ACCEPTED} for quotation "${payload.quotationName}"`);
    this.eventEmitter.emit(DomainEvent.QUOTATION_ACCEPTED, payload);
  }

  // ─── Deliverable Events ──────────────────────────────────────────────────

  emitDeliverableSubmitted(payload: DeliverableSubmittedPayload): void {
    this.logger.log(`Emitting ${DomainEvent.DELIVERABLE_SUBMITTED} for deliverable "${payload.deliverableName}"`);
    this.eventEmitter.emit(DomainEvent.DELIVERABLE_SUBMITTED, payload);
  }
}
