/**
 * HEXA Hub — Workflow Repository
 *
 * Redis-backed storage for workflow definitions and execution history.
 * Supports versioning, pagination, and TTL-based execution cleanup.
 *
 * @module workflow
 */

import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../storage/redis.service';
import {
  WorkflowDefinition,
  WorkflowExecution,
  CreateWorkflowDto,
  UpdateWorkflowDto,
} from './workflow.types';

// ─── Redis Key Patterns ─────────────────────────────────────────────────────

const WF_DEF_PREFIX = 'workflow:def:';
const WF_DEF_INDEX = 'workflow:def:index'; // Set of all workflow IDs
const WF_EXEC_PREFIX = 'workflow:exec:';
const WF_EXEC_INDEX = 'workflow:exec:index'; // Sorted set (score = startedAt timestamp)
const WF_EXEC_BY_WF = 'workflow:exec:by_wf:'; // Set per workflow of execution IDs

/** Execution history TTL: 30 days (2_592_000 seconds). */
const EXEC_TTL_SECONDS = 2_592_000;
/** Maximum number of execution records to retain per workflow. */
const MAX_EXEC_PER_WORKFLOW = 100;

/** Internal helper: generate a simple UUID v4. */
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

@Injectable()
export class WorkflowRepository {
  private readonly logger = new Logger(WorkflowRepository.name);

  constructor(private readonly redis: RedisService) {}

  // ─── Workflow Definition CRUD ───────────────────────────────────────────

  /**
   * Create a new workflow definition and persist it to Redis.
   *
   * @param dto - Workflow creation payload.
   * @returns The persisted WorkflowDefinition with generated ID and timestamps.
   */
  async createWorkflow(dto: CreateWorkflowDto): Promise<WorkflowDefinition> {
    const now = new Date().toISOString();
    const workflow: WorkflowDefinition = {
      id: generateId(),
      name: dto.name,
      description: dto.description ?? '',
      trigger: dto.trigger,
      steps: dto.steps,
      strategy: dto.strategy ?? 'sequential',
      enabled: dto.enabled ?? true,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    await this.redis.set(`${WF_DEF_PREFIX}${workflow.id}`, workflow, 0); // 0 = no expiry
    await this.redis.sadd(WF_DEF_INDEX, workflow.id);

    this.logger.log(`Workflow "${workflow.name}" created (${workflow.id})`);
    return workflow;
  }

  /**
   * Retrieve a workflow definition by ID.
   *
   * @param id - Workflow identifier.
   * @returns The workflow definition or null if not found.
   */
  async getWorkflow(id: string): Promise<WorkflowDefinition | null> {
    return this.redis.get<WorkflowDefinition>(`${WF_DEF_PREFIX}${id}`);
  }

  /**
   * List all workflow definitions.
   *
   * @returns Array of all workflow definitions.
   */
  async listWorkflows(): Promise<WorkflowDefinition[]> {
    const ids = await this.redis.smembers(WF_DEF_INDEX);
    if (ids.length === 0) return [];

    const workflows: WorkflowDefinition[] = [];
    for (const id of ids) {
      const wf = await this.redis.get<WorkflowDefinition>(`${WF_DEF_PREFIX}${id}`);
      if (wf) {
        workflows.push(wf);
      } else {
        // Clean up stale index entry
        await this.redis.srem(WF_DEF_INDEX, id);
      }
    }

    // Sort by creation date (newest first)
    workflows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return workflows;
  }

  /**
   * Update an existing workflow definition.
   * Increments the version number on every update.
   *
   * @param id - Workflow identifier.
   * @param dto - Fields to update.
   * @returns The updated workflow definition or null if not found.
   */
  async updateWorkflow(id: string, dto: UpdateWorkflowDto): Promise<WorkflowDefinition | null> {
    const existing = await this.redis.get<WorkflowDefinition>(`${WF_DEF_PREFIX}${id}`);
    if (!existing) return null;

    const updated: WorkflowDefinition = {
      ...existing,
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.trigger !== undefined && { trigger: dto.trigger }),
      ...(dto.steps !== undefined && { steps: dto.steps }),
      ...(dto.strategy !== undefined && { strategy: dto.strategy }),
      ...(dto.enabled !== undefined && { enabled: dto.enabled }),
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
    };

    await this.redis.set(`${WF_DEF_PREFIX}${id}`, updated, 0);
    this.logger.log(`Workflow "${updated.name}" updated to v${updated.version}`);
    return updated;
  }

  /**
   * Delete a workflow definition and its index entries.
   *
   * @param id - Workflow identifier.
   * @returns true if deleted, false if not found.
   */
  async deleteWorkflow(id: string): Promise<boolean> {
    const existing = await this.redis.get<WorkflowDefinition>(`${WF_DEF_PREFIX}${id}`);
    if (!existing) return false;

    await this.redis.del(`${WF_DEF_PREFIX}${id}`);
    await this.redis.srem(WF_DEF_INDEX, id);
    this.logger.log(`Workflow "${existing.name}" deleted (${id})`);
    return true;
  }

  // ─── Workflow Execution CRUD ────────────────────────────────────────────

  /**
   * Persist a new workflow execution record.
   *
   * @param execution - The execution instance to store.
   */
  async saveExecution(execution: WorkflowExecution): Promise<void> {
    const timestamp = new Date(execution.startedAt).getTime();
    await this.redis.set(
      `${WF_EXEC_PREFIX}${execution.id}`,
      execution,
      EXEC_TTL_SECONDS,
    );
    await this.redis.zadd(WF_EXEC_INDEX, timestamp, execution.id);
    await this.redis.sadd(`${WF_EXEC_BY_WF}${execution.workflowId}`, execution.id);
  }

  /**
   * Update an existing workflow execution record in place.
   *
   * @param execution - The execution instance with updated fields.
   */
  async updateExecution(execution: WorkflowExecution): Promise<void> {
    await this.redis.set(
      `${WF_EXEC_PREFIX}${execution.id}`,
      execution,
      EXEC_TTL_SECONDS,
    );
  }

  /**
   * Retrieve a workflow execution by ID.
   *
   * @param id - Execution identifier.
   * @returns The execution record or null if not found.
   */
  async getExecution(id: string): Promise<WorkflowExecution | null> {
    return this.redis.get<WorkflowExecution>(`${WF_EXEC_PREFIX}${id}`);
  }

  /**
   * List all executions, optionally filtered by workflow ID.
   * Returns newest-first, limited by the `limit` parameter.
   *
   * @param workflowId - Optional workflow filter.
   * @param limit - Maximum records to return (default 50).
   * @returns Array of execution records.
   */
  async listExecutions(workflowId?: string, limit = 50): Promise<WorkflowExecution[]> {
    let execIds: string[];

    if (workflowId) {
      execIds = await this.redis.smembers(`${WF_EXEC_BY_WF}${workflowId}`);
    } else {
      // Use sorted set (newest first)
      execIds = await this.redis.zrange(WF_EXEC_INDEX, 0, -1);
      execIds = execIds.reverse(); // newest first
    }

    // Limit the number of IDs we fetch
    const limitedIds = execIds.slice(0, limit);
    const executions: WorkflowExecution[] = [];

    for (const id of limitedIds) {
      const exec = await this.redis.get<WorkflowExecution>(`${WF_EXEC_PREFIX}${id}`);
      if (exec) {
        executions.push(exec);
      }
    }

    return executions;
  }

  /**
   * Remove old execution records for a workflow to enforce retention limits.
   *
   * @param workflowId - Workflow identifier to prune.
   */
  async pruneExecutions(workflowId: string): Promise<void> {
    const ids = await this.redis.smembers(`${WF_EXEC_BY_WF}${workflowId}`);
    if (ids.length <= MAX_EXEC_PER_WORKFLOW) return;

    // Fetch all, sort by startedAt, remove oldest
    const execs: WorkflowExecution[] = [];
    for (const id of ids) {
      const exec = await this.redis.get<WorkflowExecution>(`${WF_EXEC_PREFIX}${id}`);
      if (exec) execs.push(exec);
    }

    execs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    const toRemove = execs.slice(MAX_EXEC_PER_WORKFLOW);

    for (const exec of toRemove) {
      await this.redis.del(`${WF_EXEC_PREFIX}${exec.id}`);
      await this.redis.srem(`${WF_EXEC_BY_WF}${workflowId}`, exec.id);
      await this.redis.zrem(WF_EXEC_INDEX, exec.id);
    }

    if (toRemove.length > 0) {
      this.logger.log(`Pruned ${toRemove.length} old execution records for workflow ${workflowId}`);
    }
  }
}
