import { Injectable, Logger, NotFoundException } from '@nestjs/common';

export interface PhaseApproval {
  id: string;
  projectId: string;
  phaseName: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'revision';
  submittedBy?: string;
  reviewedBy?: string;
  comment?: string;
  submittedAt?: string;
  reviewedAt?: string;
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

@Injectable()
export class ApprovalService {
  private readonly logger = new Logger(ApprovalService.name);
  private approvals = new Map<string, PhaseApproval>();
  private annotations = new Map<string, ProjectAnnotation>();

  async submitPhase(projectId: string, phaseName: string, userId: string): Promise<PhaseApproval> {
    const approval: PhaseApproval = {
      id: `app-${Date.now()}`,
      projectId,
      phaseName,
      status: 'submitted',
      submittedBy: userId,
      submittedAt: new Date().toISOString(),
    };
    this.approvals.set(approval.id, approval);
    return approval;
  }

  async reviewPhase(id: string, action: 'approved' | 'rejected' | 'revision', userId: string, comment?: string): Promise<PhaseApproval> {
    const approval = this.approvals.get(id);
    if (!approval) throw new NotFoundException(`Approval ${id} not found`);

    approval.status = action;
    approval.reviewedBy = userId;
    approval.reviewedAt = new Date().toISOString();
    if (comment) approval.comment = comment;

    return approval;
  }

  async getPhaseApprovals(projectId: string): Promise<PhaseApproval[]> {
    return Array.from(this.approvals.values()).filter((a) => a.projectId === projectId);
  }

  async addAnnotation(annotation: Omit<ProjectAnnotation, 'id' | 'createdAt'>): Promise<ProjectAnnotation> {
    const newAnnotation: ProjectAnnotation = {
      ...annotation,
      id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    this.annotations.set(newAnnotation.id, newAnnotation);
    return newAnnotation;
  }

  async resolveAnnotation(id: string): Promise<ProjectAnnotation> {
    const annotation = this.annotations.get(id);
    if (!annotation) throw new NotFoundException(`Annotation ${id} not found`);
    annotation.resolved = true;
    return annotation;
  }

  async getAnnotations(projectId: string): Promise<ProjectAnnotation[]> {
    return Array.from(this.annotations.values()).filter((a) => a.projectId === projectId);
  }
}
