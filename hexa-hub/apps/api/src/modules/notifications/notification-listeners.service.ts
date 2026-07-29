import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DomainEvent } from '../../common/events/event-types';
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
} from '../../common/events/event-payloads';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationListenersService {
  private readonly logger = new Logger(NotificationListenersService.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent(DomainEvent.INVOICE_CREATED)
  async handleInvoiceCreated(payload: InvoiceCreatedPayload): Promise<void> {
    this.logger.log(`Notification listener: ${DomainEvent.INVOICE_CREATED}`);
    await this.notificationsService.createNotification({
      userId: 'system',
      title: 'New Invoice Created',
      body: `Invoice #${payload.invoiceNumber} has been created for ${payload.partnerName}`,
      channel: 'in_app',
      actionUrl: `/accounting/invoices/${payload.invoiceId}`,
      metadata: { event: DomainEvent.INVOICE_CREATED, invoiceId: payload.invoiceId },
    });
  }

  @OnEvent(DomainEvent.INVOICE_PAID)
  async handleInvoicePaid(payload: InvoicePaidPayload): Promise<void> {
    this.logger.log(`Notification listener: ${DomainEvent.INVOICE_PAID}`);
    await this.notificationsService.createNotification({
      userId: 'system',
      title: 'Invoice Paid',
      body: `Invoice #${payload.invoiceNumber} has been paid by ${payload.partnerName}`,
      channel: 'in_app',
      actionUrl: `/accounting/invoices/${payload.invoiceId}`,
      metadata: { event: DomainEvent.INVOICE_PAID, invoiceId: payload.invoiceId },
    });
  }

  @OnEvent(DomainEvent.LEAD_CREATED)
  async handleLeadCreated(payload: LeadCreatedPayload): Promise<void> {
    this.logger.log(`Notification listener: ${DomainEvent.LEAD_CREATED}`);
    await this.notificationsService.createNotification({
      userId: 'system',
      title: 'New Lead',
      body: `New lead "${payload.leadName}" from ${payload.source}`,
      channel: 'in_app',
      actionUrl: `/crm/leads/${payload.leadId}`,
      metadata: { event: DomainEvent.LEAD_CREATED, leadId: payload.leadId },
    });
  }

  @OnEvent(DomainEvent.LEAD_CONVERTED)
  async handleLeadConverted(payload: LeadConvertedPayload): Promise<void> {
    this.logger.log(`Notification listener: ${DomainEvent.LEAD_CONVERTED}`);
    await this.notificationsService.createNotification({
      userId: 'system',
      title: 'Lead Converted',
      body: `Lead "${payload.leadName}" converted to client ${payload.partnerName}`,
      channel: 'in_app',
      actionUrl: `/crm/leads/${payload.leadId}`,
      metadata: { event: DomainEvent.LEAD_CONVERTED, leadId: payload.leadId, partnerId: payload.partnerId },
    });
  }

  @OnEvent(DomainEvent.PROJECT_CREATED)
  async handleProjectCreated(payload: ProjectCreatedPayload): Promise<void> {
    this.logger.log(`Notification listener: ${DomainEvent.PROJECT_CREATED}`);
    await this.notificationsService.createNotification({
      userId: 'system',
      title: 'New Project',
      body: `Project "${payload.projectName}" has been created for ${payload.partnerName}`,
      channel: 'in_app',
      actionUrl: `/projects/${payload.projectId}`,
      metadata: { event: DomainEvent.PROJECT_CREATED, projectId: payload.projectId },
    });
  }

  @OnEvent(DomainEvent.PROJECT_COMPLETED)
  async handleProjectCompleted(payload: ProjectCompletedPayload): Promise<void> {
    this.logger.log(`Notification listener: ${DomainEvent.PROJECT_COMPLETED}`);
    await this.notificationsService.createNotification({
      userId: 'system',
      title: 'Project Completed',
      body: `Project "${payload.projectName}" has been completed`,
      channel: 'in_app',
      actionUrl: `/projects/${payload.projectId}`,
      metadata: { event: DomainEvent.PROJECT_COMPLETED, projectId: payload.projectId },
    });
  }

  @OnEvent(DomainEvent.TASK_COMPLETED)
  async handleTaskCompleted(payload: TaskCompletedPayload): Promise<void> {
    this.logger.log(`Notification listener: ${DomainEvent.TASK_COMPLETED}`);
    await this.notificationsService.createNotification({
      userId: 'system',
      title: 'Task Completed',
      body: `Task "${payload.taskName}" completed in project "${payload.projectName}"`,
      channel: 'in_app',
      actionUrl: `/projects/${payload.projectId}/tasks/${payload.taskId}`,
      metadata: { event: DomainEvent.TASK_COMPLETED, taskId: payload.taskId, projectId: payload.projectId },
    });
  }

  @OnEvent(DomainEvent.MILESTONE_REACHED)
  async handleMilestoneReached(payload: MilestoneReachedPayload): Promise<void> {
    this.logger.log(`Notification listener: ${DomainEvent.MILESTONE_REACHED}`);
    await this.notificationsService.createNotification({
      userId: 'system',
      title: 'Milestone Reached',
      body: `Milestone "${payload.milestoneName}" reached in project "${payload.projectName}"`,
      channel: 'in_app',
      actionUrl: `/projects/${payload.projectId}`,
      metadata: { event: DomainEvent.MILESTONE_REACHED, milestoneId: payload.milestoneId, projectId: payload.projectId },
    });
  }

  @OnEvent(DomainEvent.QUOTATION_ACCEPTED)
  async handleQuotationAccepted(payload: QuotationAcceptedPayload): Promise<void> {
    this.logger.log(`Notification listener: ${DomainEvent.QUOTATION_ACCEPTED}`);
    await this.notificationsService.createNotification({
      userId: 'system',
      title: 'Quotation Accepted',
      body: `Quotation "${payload.quotationName}" accepted by ${payload.partnerName}`,
      channel: 'in_app',
      actionUrl: `/sales/quotations/${payload.quotationId}`,
      metadata: { event: DomainEvent.QUOTATION_ACCEPTED, quotationId: payload.quotationId },
    });
  }

  @OnEvent(DomainEvent.DELIVERABLE_SUBMITTED)
  async handleDeliverableSubmitted(payload: DeliverableSubmittedPayload): Promise<void> {
    this.logger.log(`Notification listener: ${DomainEvent.DELIVERABLE_SUBMITTED}`);
    await this.notificationsService.createNotification({
      userId: 'system',
      title: 'Deliverable Submitted',
      body: `Deliverable "${payload.deliverableName}" submitted for project "${payload.projectName}"`,
      channel: 'in_app',
      actionUrl: `/projects/${payload.projectId}`,
      metadata: { event: DomainEvent.DELIVERABLE_SUBMITTED, deliverableId: payload.deliverableId, projectId: payload.projectId },
    });
  }
}
