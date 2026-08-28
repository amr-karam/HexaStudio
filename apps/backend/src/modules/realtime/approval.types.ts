/**
 * HEXA Hub - Approval domain types.
 *
 * Shared by the approval service, repository, and controllers. The audit
 * trail is append-only: entries are written once and never rewritten
 * (PRODUCT.md: permanent, immutable audit log).
 */

export type ApprovalAction = 'approved' | 'rejected' | 'revision';

export interface AuditEntry {
  timestamp: string;
  action: string;
  actor: string;
  comment?: string;
}

export interface PhaseApproval {
  id: string;
  projectId: string;
  phaseName: string;
  status: 'pending' | 'submitted' | ApprovalAction;
  submittedBy?: string;
  reviewedBy?: string;
  comment?: string;
  submittedAt?: string;
  reviewedAt?: string;
  auditTrail: AuditEntry[];
}

export interface ProjectAnnotation {
  id: string;
  projectId: string;
  type: 'text' | 'drawing' | 'pin';
  position: { x: number; y: number; z?: number };
  content: string;
  author: string;
  createdAt: string;
  resolved: boolean;
}
