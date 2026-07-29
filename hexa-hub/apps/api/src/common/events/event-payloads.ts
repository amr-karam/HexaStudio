export interface InvoiceCreatedPayload {
  invoiceId: number;
  invoiceNumber: string;
  partnerId: number;
  partnerName: string;
  amountTotal: number;
  currency: string;
  date: string;
}

export interface InvoicePaidPayload {
  invoiceId: number;
  invoiceNumber: string;
  partnerId: number;
  partnerName: string;
  amountTotal: number;
  currency: string;
  paymentDate: string;
}

export interface LeadCreatedPayload {
  leadId: number;
  leadName: string;
  contactName: string;
  email: string;
  source: string;
  stage: string;
}

export interface LeadConvertedPayload {
  leadId: number;
  leadName: string;
  partnerId: number;
  partnerName: string;
  convertedDate: string;
}

export interface ProjectCreatedPayload {
  projectId: number;
  projectName: string;
  partnerId: number;
  partnerName: string;
  managerId: number;
  startDate: string;
}

export interface ProjectCompletedPayload {
  projectId: number;
  projectName: string;
  partnerId: number;
  partnerName: string;
  completedDate: string;
}

export interface TaskCompletedPayload {
  taskId: number;
  taskName: string;
  projectId: number;
  projectName: string;
  assigneeId: number;
  completedDate: string;
}

export interface MilestoneReachedPayload {
  milestoneId: number;
  milestoneName: string;
  projectId: number;
  projectName: string;
  reachedDate: string;
}

export interface QuotationAcceptedPayload {
  quotationId: number;
  quotationName: string;
  partnerId: number;
  partnerName: string;
  amountTotal: number;
  currency: string;
  acceptedDate: string;
}

export interface DeliverableSubmittedPayload {
  deliverableId: number;
  deliverableName: string;
  projectId: number;
  projectName: string;
  submittedDate: string;
}

export type DomainEventPayload =
  | InvoiceCreatedPayload
  | InvoicePaidPayload
  | LeadCreatedPayload
  | LeadConvertedPayload
  | ProjectCreatedPayload
  | ProjectCompletedPayload
  | TaskCompletedPayload
  | MilestoneReachedPayload
  | QuotationAcceptedPayload
  | DeliverableSubmittedPayload;
