
/**
 * ApprovalRepository - unit tests (mocked RedisService).
 *
 * Verifies the storage contract: base records persisted, per-project and
 * time indexes maintained, stale index entries cleaned, and the audit
 * trail appended newest-first but read back in chronological order.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApprovalRepository } from './approval.repository';
import { RedisService } from '../storage/redis.service';
import type { AuditEntry, PhaseApproval, ProjectAnnotation } from './approval.types';

function makeRedisMock() {
  const strings = new Map<string, string>();
  const sets = new Map<string, Set<string>>();
  const lists = new Map<string, unknown[]>();
  const zsets = new Map<string, Map<string, number>>();

  return {
    strings, sets, lists, zsets,
    get: vi.fn(async (key: string) => {
      const raw = strings.get(key);
      return raw === undefined ? null : JSON.parse(raw);
    }),
    set: vi.fn(async (key: string, value: unknown) => {
      strings.set(key, JSON.stringify(value));
    }),
    sadd: vi.fn(async (key: string, member: string) => {
      if (!sets.has(key)) sets.set(key, new Set());
      sets.get(key)!.add(member);
    }),
    srem: vi.fn(async (key: string, member: string) => {
      sets.get(key)?.delete(member);
    }),
    smembers: vi.fn(async (key: string) => {
      return Array.from(sets.get(key) ?? []);
    }),
    zadd: vi.fn(async (key: string, score: number, member: string) => {
      if (!zsets.has(key)) zsets.set(key, new Map());
      zsets.get(key)!.set(member, score);
    }),
    lpush: vi.fn(async (key: string, value: unknown) => {
      if (!lists.has(key)) lists.set(key, []);
      lists.get(key)!.unshift(JSON.stringify(value));
    }),
    lrange: vi.fn(async (key: string, start: number, stop: number) => {
      const list = lists.get(key) ?? [];
      const slice = stop === -1 ? list.slice(start) : list.slice(start, stop + 1);
      return slice.map((item) => JSON.parse(item as string));
    }),
  };
}

type RedisMock = ReturnType<typeof makeRedisMock>;

describe('ApprovalRepository', () => {
  let repo: ApprovalRepository;
  let redis: RedisMock;

  const base: Omit<PhaseApproval, 'auditTrail'> = {
    id: 'app-1',
    projectId: 'proj-9',
    phaseName: 'Phase 2: Visualization',
    status: 'submitted',
    submittedBy: 'user-1',
    submittedAt: '2026-08-27T10:00:00.000Z',
  };

  const firstEntry: AuditEntry = {
    timestamp: '2026-08-27T10:00:00.000Z',
    action: 'submitted',
    actor: 'user-1',
  };

  beforeEach(() => {
    redis = makeRedisMock();
    repo = new ApprovalRepository(redis as unknown as RedisService);
  });

  it('persists a new approval with its initial audit entry and indexes it', async () => {
    await repo.createApproval(base, firstEntry);

    expect(redis.set).toHaveBeenCalledWith('approval:item:app-1', base, 0);
    expect(redis.sadd).toHaveBeenCalledWith('approval:index:project:proj-9', 'app-1');
    expect(redis.zadd).toHaveBeenCalledWith('approval:index:time', Date.parse(base.submittedAt!), 'app-1');
    expect(redis.lpush).toHaveBeenCalledWith('approval:audit:app-1', firstEntry);
  });

  it('reads an approval with its audit trail in chronological order', async () => {
    await repo.createApproval(base, firstEntry);

    const later: AuditEntry = {
      timestamp: '2026-08-27T12:00:00.000Z',
      action: 'approved',
      actor: 'user-2',
      comment: 'Looks great',
    };
    await repo.appendAudit('app-1', later);

    const stored = await repo.getApproval('app-1');
    expect(stored).not.toBeNull();
    expect(stored!.auditTrail).toEqual([firstEntry, later]);
  });

  it('returns null for an unknown approval id', async () => {
    expect(await repo.getApproval('nope')).toBeNull();
  });

  it('lists a project approvals oldest-first and cleans stale index entries', async () => {
    const older: Omit<PhaseApproval, 'auditTrail'> = {
      ...base,
      id: 'app-old',
      submittedAt: '2026-08-26T10:00:00.000Z',
    };
    await repo.createApproval(older, firstEntry);
    await repo.createApproval(base, firstEntry);
    // Stale index entry pointing at a deleted record
    await redis.sadd('approval:index:project:proj-9', 'app-ghost');

    const list = await repo.listApprovalsByProject('proj-9');

    expect(list.map((a) => a.id)).toEqual(['app-old', 'app-1']);
    expect(redis.srem).toHaveBeenCalledWith('approval:index:project:proj-9', 'app-ghost');
  });

  it('stores and lists annotations for a project', async () => {
    const annotation: ProjectAnnotation = {
      id: 'ann-1',
      projectId: 'proj-9',
      type: 'pin',
      position: { x: 0.5, y: 0.5 },
      content: 'Adjust the cornice',
      author: 'user-1',
      createdAt: '2026-08-27T10:00:00.000Z',
      resolved: false,
    };
    await repo.saveAnnotation(annotation);

    const fetched = await repo.getAnnotation('ann-1');
    expect(fetched).toEqual(annotation);

    const list = await repo.listAnnotationsByProject('proj-9');
    expect(list).toEqual([annotation]);
  });
});
