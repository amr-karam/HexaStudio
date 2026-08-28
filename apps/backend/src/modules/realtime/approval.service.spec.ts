/**
 * ApprovalService - unit tests for the Redis-backed approval workflow.
 *
 * Verifies: submit -> review lifecycle, append-only audit trail semantics,
 * honest NotFoundException paths, and annotation persistence delegation.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { vi } from 'vitest';
import { ApprovalService } from './approval.service';
import { ApprovalRepository } from './approval.repository';
import type { PhaseApproval } from './approval.types';

describe('ApprovalService', () => {
  let service: ApprovalService;
  let repository: ApprovalRepository;

  const now = '2026-08-28T10:00:00.000Z';
  vi.setSystemTime(new Date(now));

  const baseApproval: PhaseApproval = {
    id: 'app-1000',
    projectId: 'proj-1',
    phaseName: 'Phase 2: Visualization',
    status: 'submitted',
    submittedBy: 'artist-1',
    submittedAt: now,
    auditTrail: [
      { timestamp: now, action: 'submitted', actor: 'artist-1' },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovalService,
        {
          provide: ApprovalRepository,
          useValue: {
            createApproval: vi.fn(),
            updateApproval: vi.fn(),
            appendAudit: vi.fn(),
            getApproval: vi.fn(),
            listApprovalsByProject: vi.fn(),
            saveAnnotation: vi.fn(),
            getAnnotation: vi.fn(),
            listAnnotationsByProject: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ApprovalService);
    repository = module.get(ApprovalRepository);
  });

  describe('submitPhase', () => {
    it('persists a new approval with its initial audit entry', async () => {
      const created = await service.submitPhase('proj-1', 'Phase 2: Visualization', 'artist-1');

      expect(created.id).toMatch(/^app-/);
      expect(created.status).toBe('submitted');
      expect(created.auditTrail).toHaveLength(1);
      expect(created.auditTrail[0]).toMatchObject({ action: 'submitted', actor: 'artist-1' });
      expect(repository.createApproval).toHaveBeenCalledTimes(1);
      expect(repository.createApproval).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: 'proj-1', phaseName: 'Phase 2: Visualization' }),
        expect.objectContaining({ action: 'submitted', actor: 'artist-1' }),
      );
    });
  });

  describe('reviewPhase', () => {
    it('appends a review entry and updates the status without rewriting history', async () => {
      vi.mocked(repository.getApproval).mockResolvedValue(baseApproval);

      const reviewed = await service.reviewPhase('app-1000', 'approved', 'client-1', 'Excellent work');

      expect(reviewed.status).toBe('approved');
      expect(reviewed.reviewedBy).toBe('client-1');
      expect(reviewed.auditTrail).toEqual([
        baseApproval.auditTrail[0],
        expect.objectContaining({ action: 'approved', actor: 'client-1', comment: 'Excellent work' }),
      ]);
      expect(repository.updateApproval).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'app-1000', status: 'approved' }),
      );
      expect(repository.appendAudit).toHaveBeenCalledTimes(1);
    });

    it('omits the comment field when no comment is provided', async () => {
      vi.mocked(repository.getApproval).mockResolvedValue(baseApproval);

      await service.reviewPhase('app-1000', 'revision', 'client-1');

      expect(repository.appendAudit).toHaveBeenCalledWith(
        'app-1000',
        expect.not.objectContaining({ comment: expect.anything() }),
      );
    });

    it('throws NotFoundException for an unknown approval id', async () => {
      vi.mocked(repository.getApproval).mockResolvedValue(null);

      await expect(service.reviewPhase('missing', 'approved', 'client-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('annotations', () => {
    it('generates an id and createdAt on add, then persists via the repository', async () => {
      const annotation = await service.addAnnotation({
        projectId: 'proj-1',
        type: 'pin',
        position: { x: 0.5, y: 0.5 },
        content: 'Adjust the cornice',
        author: 'client-1',
        resolved: false,
      });

      expect(annotation.id).toMatch(/^ann-/);
      expect(annotation.createdAt).toBe(now);
      expect(repository.saveAnnotation).toHaveBeenCalledWith(annotation);
    });

    it('resolves an annotation by re-persisting it with resolved=true', async () => {
      vi.mocked(repository.getAnnotation).mockResolvedValue({
        id: 'ann-1',
        projectId: 'proj-1',
        type: 'pin',
        position: { x: 0.5, y: 0.5 },
        content: 'Adjust the cornice',
        author: 'client-1',
        createdAt: now,
        resolved: false,
      });

      const resolved = await service.resolveAnnotation('ann-1');

      expect(resolved.resolved).toBe(true);
      expect(repository.saveAnnotation).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'ann-1', resolved: true }),
      );
    });

    it('throws NotFoundException when resolving an unknown annotation', async () => {
      vi.mocked(repository.getAnnotation).mockResolvedValue(null);

      await expect(service.resolveAnnotation('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
