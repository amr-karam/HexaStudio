/**
 * HEXA Hub - Approval Service
 *
 * Phase-approval workflows with a permanent, append-only audit trail, backed by
 * the Redis ApprovalRepository (survives restarts; consistent across instances).
 * Public method signatures are unchanged from the previous in-memory version.
 *
 * @module realtime/approvals
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ApprovalRepository } from './approval.repository';
import type { AuditEntry, PhaseApproval, ProjectAnnotation } from './approval.types';

interface AnnotationInput {
  projectId: string;
  type: 'text' | 'drawing' | 'pin';
  position: { x: number; y: number; z?: number };
  content: string;
  author: string;
  resolved: boolean;
}

@Injectable()
export class ApprovalService {
  private readonly logger = new Logger(ApprovalService.name);

  constructor(private readonly repository: ApprovalRepository) {}

  async submitPhase(projectId: string, phaseName: string, userId: string): Promise<PhaseApproval> {
    const now = new Date().toISOString();
    const approval: Omit<PhaseApproval, 'auditTrail'> = {
      id: `app-${Date.now()}`,
      projectId,
      phaseName,
      status: 'submitted',
      submittedBy: userId,
      submittedAt: now,
    };

    const initialEntry: AuditEntry = {
      timestamp: now,
      action: 'submitted',
      actor: userId,
    };

    await this.repository.createApproval(approval, initialEntry);
    this.logger.log(`Approval ${approval.id} submitted for phase "${phaseName}" (project ${projectId})`);
    return { ...approval, auditTrail: [initialEntry] };
  }

  async reviewPhase(
    id: string,
    action: 'approved' | 'rejected' | 'revision',
    userId: string,
    comment?: string,
  ): Promise<PhaseApproval> {
    const approval = await this.repository.getApproval(id);
    if (!approval) throw new NotFoundException(`Approval ${id} not found`);

    const now = new Date().toISOString();

    // The audit trail is append-only: prior entries are never rewritten.
    const entry: AuditEntry = {
      timestamp: now,
      action,
      actor: userId,
      ...(comment !== undefined && comment.length > 0 && { comment }),
    };

    const updated: Omit<PhaseApproval, 'auditTrail'> = {
      ...approval,
      status: action,
      reviewedBy: userId,
      reviewedAt: now,
    };

    await this.repository.updateApproval(updated);
    await this.repository.appendAudit(id, entry);
    this.logger.log(`Approval ${id} reviewed: ${action} by ${userId}`);
    return { ...updated, auditTrail: [...approval.auditTrail, entry] };
  }

  async getPhaseApprovals(projectId: string): Promise<PhaseApproval[]> {
    return this.repository.listApprovalsByProject(projectId);
  }

  async addAnnotation(input: AnnotationInput): Promise<ProjectAnnotation> {
    const annotation: ProjectAnnotation = {
      ...input,
      id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    await this.repository.saveAnnotation(annotation);
    return annotation;
  }

  async resolveAnnotation(id: string): Promise<ProjectAnnotation> {
    const annotation = await this.repository.getAnnotation(id);
    if (!annotation) throw new NotFoundException(`Annotation ${id} not found`);
    annotation.resolved = true;
    await this.repository.saveAnnotation(annotation);
    return annotation;
  }

  async getAnnotations(projectId: string): Promise<ProjectAnnotation[]> {
    return this.repository.listAnnotationsByProject(projectId);
  }
}
