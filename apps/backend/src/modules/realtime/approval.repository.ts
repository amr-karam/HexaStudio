/**
 * HEXA Hub - Approval Repository
 *
 * Redis-backed storage for phase approvals, their append-only audit trails,
 * and project annotations. Replaces the former in-memory Maps, which lost
 * all records on restart and diverged across instances.
 *
 * Storage layout:
 *   approval:item:{id}             JSON base record (no expiry - permanent ledger)
 *   approval:audit:{id}            LIST of audit entries (LPUSH; read reversed => chronological)
 *   approval:index:project:{pid}   SET of approval ids per project
 *   approval:index:time            ZSET of all approval ids (score = submittedAt ms)
 *   annotation:item:{id}           JSON ProjectAnnotation record
 *   annotation:index:project:{pid} SET of annotation ids per project
 *
 * Audit trails are immutable: entries are appended via lpush and are never
 * rewritten, reordered, or removed.
 *
 * @module realtime/approvals
 */

import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../storage/redis.service';
import type { AuditEntry, PhaseApproval, ProjectAnnotation } from './approval.types';

const APPROVAL_ITEM = 'approval:item:';
const APPROVAL_AUDIT = 'approval:audit:';
const APPROVAL_BY_PROJECT = 'approval:index:project:';
const APPROVAL_TIME_INDEX = 'approval:index:time';
const ANNOTATION_ITEM = 'annotation:item:';
const ANNOTATION_BY_PROJECT = 'annotation:index:project:';

/** Omit the audit trail from the persisted base record (it lives in its own list). */
type ApprovalBase = Omit<PhaseApproval, 'auditTrail'>;

@Injectable()
export class ApprovalRepository {
  private readonly logger = new Logger(ApprovalRepository.name);

  constructor(private readonly redis: RedisService) {}

  // -- Approvals -----------------------------------------------------------

  /** Persist a new approval, index it, and record its first audit entry. */
  async createApproval(approval: ApprovalBase, initialEntry: AuditEntry): Promise<void> {
    await this.redis.set(APPROVAL_ITEM + approval.id, approval, 0);
    await this.redis.sadd(APPROVAL_BY_PROJECT + approval.projectId, approval.id);
    if (approval.submittedAt) {
      await this.redis.zadd(APPROVAL_TIME_INDEX, new Date(approval.submittedAt).getTime(), approval.id);
    }
    await this.redis.lpush(APPROVAL_AUDIT + approval.id, initialEntry);
  }

  /** Update the base record in place. Indexes and audit history are untouched. */
  async updateApproval(approval: ApprovalBase): Promise<void> {
    await this.redis.set(APPROVAL_ITEM + approval.id, approval, 0);
  }

  /** Append an immutable audit entry (newest first in storage). */
  async appendAudit(id: string, entry: AuditEntry): Promise<void> {
    await this.redis.lpush(APPROVAL_AUDIT + id, entry);
  }

  /** Read one approval with its audit trail in chronological order (oldest first). */
  async getApproval(id: string): Promise<PhaseApproval | null> {
    const base = await this.redis.get<ApprovalBase>(APPROVAL_ITEM + id);
    if (!base) return null;
    const trail = await this.getAuditTrail(id);
    return { ...base, auditTrail: trail };
  }

  /** Read the audit trail in chronological order (storage is newest-first). */
  async getAuditTrail(id: string): Promise<AuditEntry[]> {
    const newestFirst = await this.redis.lrange<AuditEntry>(APPROVAL_AUDIT + id, 0, -1);
    return newestFirst.slice().reverse();
  }

  /** List a project's approvals, oldest first, cleaning stale index entries. */
  async listApprovalsByProject(projectId: string): Promise<PhaseApproval[]> {
    const ids = await this.redis.smembers(APPROVAL_BY_PROJECT + projectId);
    const approvals: PhaseApproval[] = [];
    for (const id of ids) {
      const approval = await this.getApproval(id);
      if (approval) {
        approvals.push(approval);
      } else {
        await this.redis.srem(APPROVAL_BY_PROJECT + projectId, id);
      }
    }
    approvals.sort((a, b) => {
      const at = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const bt = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return at - bt;
    });
    return approvals;
  }

  // -- Annotations ---------------------------------------------------------

  async saveAnnotation(annotation: ProjectAnnotation): Promise<void> {
    await this.redis.set(ANNOTATION_ITEM + annotation.id, annotation, 0);
    await this.redis.sadd(ANNOTATION_BY_PROJECT + annotation.projectId, annotation.id);
  }

  async getAnnotation(id: string): Promise<ProjectAnnotation | null> {
    return this.redis.get<ProjectAnnotation>(ANNOTATION_ITEM + id);
  }

  async listAnnotationsByProject(projectId: string): Promise<ProjectAnnotation[]> {
    const ids = await this.redis.smembers(ANNOTATION_BY_PROJECT + projectId);
    const annotations: ProjectAnnotation[] = [];
    for (const id of ids) {
      const annotation = await this.redis.get<ProjectAnnotation>(ANNOTATION_ITEM + id);
      if (annotation) {
        annotations.push(annotation);
      } else {
        await this.redis.srem(ANNOTATION_BY_PROJECT + projectId, id);
      }
    }
    annotations.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return annotations;
  }
}
