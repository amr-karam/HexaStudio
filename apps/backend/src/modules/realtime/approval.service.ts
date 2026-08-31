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
import { AgentMemoryService } from '../agents/agent-memory.service';
import { StructuredOutputService } from '../ai/structured-output.service';
import { z } from 'zod';

/** Lightweight sentiment verdict computed from the submitter's recent chat history. */
const SentimentSchema = z.object({
  sentiment: z.enum(['positive', 'neutral', 'frustrated', 'urgent']),
  urgencyScore: z.number().int().min(0).max(100),
});

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

  constructor(
    private readonly repository: ApprovalRepository,
    private readonly agentMemory: AgentMemoryService,
    private readonly structuredOutput: StructuredOutputService,
  ) {}

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
    const approvals = await this.repository.listApprovalsByProject(projectId);

    // Enrich each pending approval with sentiment derived from the
    // submitter's recent chat history (last 20 messages).
    // This powers the cinematic urgency beacon on the Signing Chamber.
    return Promise.all(
      approvals.map(async (approval): Promise<PhaseApproval> => {
        if (approval.status !== 'submitted' || !approval.submittedBy) return approval;

        const sent = await this.computeSentimentFromEmail(approval.submittedBy);
        if (sent) {
          return { ...approval, ...sent };
        }
        return approval;
      }),
    );
  }

  /**
   * Compute real-time sentiment for a user based on their chat history.
   * Returns `{ sentiment, urgencyScore }` or null if history/LLM is unavailable.
   */
  private async computeSentimentFromEmail(
    email: string,
  ): Promise<Pick<PhaseApproval, 'sentiment' | 'urgencyScore'> | null> {
    try {
      const messages = await this.agentMemory.getHistory('portal', email, 20);
      if (!messages || messages.length === 0) return null;

      const text = messages
        .filter((m) => m.content !== null && m.content.length > 0)
        .map((m) => m.content)
        .join('\n');
      const result = await this.structuredOutput.generateStructuredOutput<z.infer<typeof SentimentSchema>>(
        `Analyze the following client chat transcript and determine their current sentiment and urgency level.\n\nTRANSCRIPT:\n${text}`,
        SentimentSchema,
        { temperature: 0.3, maxTokens: 500 },
      );

      // Map sentiment → urgency score
      let urgencyScore: number;
      switch (result.sentiment) {
        case 'positive':
          urgencyScore = 20;
          break;
        case 'neutral':
          urgencyScore = 45;
          break;
        case 'frustrated':
          urgencyScore = 75;
          break;
        case 'urgent':
          urgencyScore = 95;
          break;
        default:
          urgencyScore = result.urgencyScore;
      }

      return { sentiment: result.sentiment, urgencyScore: Math.max(urgencyScore, result.urgencyScore ?? 0) };
    } catch (err) {
      this.logger.warn(`Sentiment analysis failed for ${email}: ${err}`);
      return null;
    }
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
