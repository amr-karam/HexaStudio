/**
 * HEXA Hub — Workflow Engine Service
 *
 * Core orchestration service that executes cross-module workflows.
 * Supports sequential and parallel step execution, condition branching,
 * delay steps, notification dispatching, and shared context between steps.
 *
 * @module workflow
 */

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EventBus } from '../realtime/event-bus.service';
import { WorkflowRepository } from './workflow.repository';
import {
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowStep,
  StepExecutionRecord,
  ActionStepParams,
  ConditionStepParams,
  NotificationStepParams,
  DelayStepParams,
  TransformStepParams,
  CreateWorkflowDto,
  UpdateWorkflowDto,
  WorkflowEventName,
} from './workflow.types';

/** Maximum concurrent step executions for parallel workflows. */
const MAX_PARALLEL_CONCURRENCY = 10;
/** Maximum allowed workflow depth (prevents infinite loops). */
const MAX_STEP_CHAIN_LENGTH = 50;

@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  /** In-memory registry of module service instances, populated at init. */
  private serviceRegistry = new Map<string, unknown>();

  constructor(
    private readonly repository: WorkflowRepository,
    private readonly eventBus: EventBus,
  ) {}

  // ─── Service Registry ────────────────────────────────────────────────────

  /**
   * Register a named module service so workflow steps can invoke its methods.
   *
   * @param name - Module name (e.g. 'crm', 'projects').
   * @param serviceInstance - The NestJS injectable service instance.
   */
  registerService(name: string, serviceInstance: unknown): void {
    this.serviceRegistry.set(name, serviceInstance);
    this.logger.debug(`Service "${name}" registered with workflow engine`);
  }

  /**
   * Get a registered service by name.
   *
   * @param name - Module name.
   * @returns The service instance.
   * @throws BadRequestException if the service is not registered.
   */
  private getService(name: string): unknown {
    const service = this.serviceRegistry.get(name);
    if (!service) {
      throw new BadRequestException(`Service "${name}" is not registered with the workflow engine`);
    }
    return service;
  }

  // ─── Workflow Definition Management ──────────────────────────────────────

  /**
   * Create a new workflow definition.
   *
   * @param dto - Workflow creation payload.
   * @returns The created workflow definition.
   */
  async createWorkflow(dto: CreateWorkflowDto): Promise<WorkflowDefinition> {
    this.validateStepChain(dto.steps);
    return this.repository.createWorkflow(dto);
  }

  /**
   * List all workflow definitions.
   *
   * @returns Array of workflow definitions.
   */
  async listWorkflows(): Promise<WorkflowDefinition[]> {
    return this.repository.listWorkflows();
  }

  /**
   * Get a workflow definition by ID.
   *
   * @param id - Workflow identifier.
   * @returns The workflow definition.
   * @throws NotFoundException if not found.
   */
  async getWorkflow(id: string): Promise<WorkflowDefinition> {
    const workflow = await this.repository.getWorkflow(id);
    if (!workflow) {
      throw new NotFoundException(`Workflow "${id}" not found`);
    }
    return workflow;
  }

  /**
   * Update a workflow definition.
   *
   * @param id - Workflow identifier.
   * @param dto - Fields to update.
   * @returns The updated workflow definition.
   * @throws NotFoundException if not found.
   */
  async updateWorkflow(id: string, dto: UpdateWorkflowDto): Promise<WorkflowDefinition> {
    if (dto.steps) {
      this.validateStepChain(dto.steps);
    }
    const updated = await this.repository.updateWorkflow(id, dto);
    if (!updated) {
      throw new NotFoundException(`Workflow "${id}" not found`);
    }
    return updated;
  }

  /**
   * Delete a workflow definition.
   *
   * @param id - Workflow identifier.
   * @throws NotFoundException if not found.
   */
  async deleteWorkflow(id: string): Promise<void> {
    const deleted = await this.repository.deleteWorkflow(id);
    if (!deleted) {
      throw new NotFoundException(`Workflow "${id}" not found`);
    }
  }

  // ─── Workflow Execution ──────────────────────────────────────────────────

  /**
   * Execute a workflow manually (or called by trigger handler).
   *
   * @param workflowId - Workflow to execute.
   * @param triggerPayload - Data that triggered the workflow (event payload).
   * @param initialContext - Optional initial context to seed the execution.
   * @returns The completed (or in-progress) execution record.
   */
  async executeWorkflow(
    workflowId: string,
    triggerPayload: Record<string, unknown> = {},
    initialContext: Record<string, unknown> = {},
  ): Promise<WorkflowExecution> {
    const workflow = await this.getWorkflow(workflowId);

    if (!workflow.enabled) {
      throw new BadRequestException(`Workflow "${workflow.name}" is disabled`);
    }

    const execution: WorkflowExecution = {
      id: this.generateId(),
      workflowId: workflow.id,
      workflowVersion: workflow.version,
      status: 'running',
      startedAt: new Date().toISOString(),
      context: {
        ...initialContext,
        trigger: triggerPayload,
      },
      steps: [],
      triggerPayload,
    };

    await this.repository.saveExecution(execution);

    try {
      if (workflow.strategy === 'parallel') {
        await this.executeStepsParallel(workflow, execution);
      } else {
        await this.executeStepsSequential(workflow, execution);
      }

      // Check if all steps completed successfully
      const failedSteps = execution.steps.filter((s) => s.status === 'failed');
      if (failedSteps.length > 0 && !this.hasContinueOnError(failedSteps, workflow)) {
        execution.status = 'failed';
        execution.error = `Step(s) failed: ${failedSteps.map((s) => s.stepName).join(', ')}`;
      } else {
        execution.status = 'completed';
      }
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Workflow "${workflow.name}" execution ${execution.id} failed: ${execution.error}`,
      );
    }

    execution.completedAt = new Date().toISOString();
    await this.repository.updateExecution(execution);
    await this.repository.pruneExecutions(workflowId);

    return execution;
  }

  /**
   * Handle an incoming event by finding and executing matching workflows.
   *
   * @param eventName - The event name (e.g. 'lead.created').
   * @param payload - Event payload data.
   */
  async handleEvent(eventName: WorkflowEventName, payload: Record<string, unknown>): Promise<void> {
    const workflows = await this.repository.listWorkflows();
    const matchingWorkflows = workflows.filter(
      (wf) => wf.enabled && wf.trigger.type === 'event' && wf.trigger.event === eventName,
    );

    if (matchingWorkflows.length === 0) {
      this.logger.debug(`No workflows registered for event "${eventName}"`);
      return;
    }

    this.logger.log(
      `Event "${eventName}" triggered ${matchingWorkflows.length} workflow(s)`,
    );

    // Execute all matching workflows (fire-and-forget for event-driven triggers)
    for (const wf of matchingWorkflows) {
      this.executeWorkflow(wf.id, payload).catch((error) => {
        this.logger.error(
          `Event-triggered workflow "${wf.name}" failed: ${(error as Error).message}`,
        );
      });
    }
  }

  // ─── Execution History ──────────────────────────────────────────────────

  /**
   * List workflow executions, optionally filtered by workflow ID.
   *
   * @param workflowId - Optional workflow filter.
   * @param limit - Maximum records.
   * @returns Array of execution records.
   */
  async listExecutions(workflowId?: string, limit?: number): Promise<WorkflowExecution[]> {
    return this.repository.listExecutions(workflowId, limit);
  }

  /**
   * Get a single execution record by ID.
   *
   * @param id - Execution identifier.
   * @returns The execution record.
   * @throws NotFoundException if not found.
   */
  async getExecution(id: string): Promise<WorkflowExecution> {
    const execution = await this.repository.getExecution(id);
    if (!execution) {
      throw new NotFoundException(`Execution "${id}" not found`);
    }
    return execution;
  }

  // ─── Step Execution Internals ────────────────────────────────────────────

  /**
   * Execute workflow steps sequentially, following nextStepId links.
   */
  private async executeStepsSequential(
    workflow: WorkflowDefinition,
    execution: WorkflowExecution,
  ): Promise<void> {
    const stepMap = new Map(workflow.steps.map((s) => [s.id, s]));
    let currentStepId: string | undefined = workflow.steps[0]?.id;
    let chainLength = 0;

    while (currentStepId) {
      chainLength++;
      if (chainLength > MAX_STEP_CHAIN_LENGTH) {
        throw new InternalServerErrorException(
          `Workflow exceeded maximum step chain length (${MAX_STEP_CHAIN_LENGTH}). Possible infinite loop.`,
        );
      }

      const step = stepMap.get(currentStepId);
      if (!step) {
        this.logger.warn(`Step "${currentStepId}" not found in workflow "${workflow.name}"`);
        break;
      }

      execution.currentStepId = currentStepId;
      await this.repository.updateExecution(execution);

      const record = await this.executeStep(step, execution);
      execution.steps.push(record);

      if (record.status === 'failed' && !step.continueOnError) {
        throw new Error(`Step "${step.name}" failed: ${record.error}`);
      }

      // Determine next step
      if (step.type === 'condition') {
        const params = step.params as ConditionStepParams;
        const conditionResult = record.result?.conditionResult as boolean | undefined;
        currentStepId = conditionResult ? params.trueStepId : params.falseStepId;
      } else {
        currentStepId = step.nextStepId ?? undefined;
      }
    }
  }

  /**
   * Execute all workflow steps in parallel (topology-ordered).
   */
  private async executeStepsParallel(
    workflow: WorkflowDefinition,
    execution: WorkflowExecution,
  ): Promise<void> {
    // Simple parallel: execute all steps concurrently up to the concurrency limit
    const stepChunks = this.chunkArray(workflow.steps, MAX_PARALLEL_CONCURRENCY);

    for (const chunk of stepChunks) {
      const promises = chunk.map((step) => this.executeStep(step, execution));
      const records = await Promise.allSettled(promises);

      for (let i = 0; i < records.length; i++) {
        const result = records[i];
        if (result.status === 'fulfilled') {
          execution.steps.push(result.value);
        } else {
          execution.steps.push({
            stepId: chunk[i].id,
            stepName: chunk[i].name,
            status: 'failed',
            startedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            error: result.reason instanceof Error ? result.reason.message : String(result.reason),
          });
        }
      }
    }
  }

  /**
   * Execute a single workflow step and return a step execution record.
   */
  private async executeStep(
    step: WorkflowStep,
    execution: WorkflowExecution,
  ): Promise<StepExecutionRecord> {
    const record: StepExecutionRecord = {
      stepId: step.id,
      stepName: step.name,
      status: 'running',
      startedAt: new Date().toISOString(),
    };

    try {
      let result: Record<string, unknown> | undefined;

      switch (step.type) {
        case 'action':
          result = await this.executeActionStep(step.params as ActionStepParams, execution);
          break;
        case 'condition':
          result = await this.executeConditionStep(step.params as ConditionStepParams, execution);
          break;
        case 'notification':
          result = await this.executeNotificationStep(step.params as NotificationStepParams, execution);
          break;
        case 'delay':
          result = await this.executeDelayStep(step.params as DelayStepParams);
          break;
        case 'transform':
          result = await this.executeTransformStep(step.params as TransformStepParams, execution);
          break;
        default:
          throw new Error(`Unknown step type: ${(step as WorkflowStep).type}`);
      }

      record.status = 'completed';
      record.result = result;
    } catch (error) {
      record.status = 'failed';
      record.error = error instanceof Error ? error.message : String(error);
      this.logger.error(`Step "${step.name}" failed: ${record.error}`);
    }

    record.completedAt = new Date().toISOString();
    return record;
  }

  // ─── Step Type Implementations ───────────────────────────────────────────

  /**
   * Execute an action step by invoking a registered service method.
   */
  private async executeActionStep(
    params: ActionStepParams,
    execution: WorkflowExecution,
  ): Promise<Record<string, unknown>> {
    const service = this.getService(params.module);
    const method = (service as Record<string, unknown>)[params.method];

    if (typeof method !== 'function') {
      throw new Error(
        `Method "${params.method}" not found on service "${params.module}"`,
      );
    }

    // Resolve parameters from context if they contain template expressions
    const resolvedArgs = params.args
      ? this.resolveContextRefs(params.args, execution.context)
      : {};

    const args = Object.values(resolvedArgs);
    const result = await (method as (...a: unknown[]) => Promise<unknown>).call(service, ...args);

    return { result: result as Record<string, unknown> };
  }

  /**
   * Execute a condition step by evaluating a context field against a value.
   */
  private async executeConditionStep(
    params: ConditionStepParams,
    execution: WorkflowExecution,
  ): Promise<Record<string, unknown>> {
    const fieldValue = this.resolveContextPath(params.field, execution.context);
    const result = this.evaluateCondition(fieldValue, params.operator, params.value);

    return { conditionResult: result, fieldValue, expectedValue: params.value };
  }

  /**
   * Execute a notification step by dispatching via the EventBus.
   */
  private async executeNotificationStep(
    params: NotificationStepParams,
    execution: WorkflowExecution,
  ): Promise<Record<string, unknown>> {
    const message = params.template
      ? `Template: ${params.template}`
      : params.message ?? 'No message';

    const subject = params.subject ?? 'Workflow Notification';

    // Dispatch notification event for downstream listeners (Slack, email, etc.)
    await this.eventBus.emit('workflow:notification', {
      channel: params.channel,
      recipients: params.recipients,
      subject,
      message,
      executionId: execution.id,
      workflowId: execution.workflowId,
      context: execution.context,
    });

    this.logger.log(
      `Notification dispatched via ${params.channel} for execution ${execution.id}`,
    );

    return { dispatched: true, channel: params.channel, recipientCount: params.recipients.length };
  }

  /**
   * Execute a delay step by waiting for the specified duration.
   */
  private async executeDelayStep(
    params: DelayStepParams,
  ): Promise<Record<string, unknown>> {
    const maxDelay = 300_000; // Cap at 5 minutes for safety
    const delayMs = Math.min(params.durationMs, maxDelay);

    if (delayMs > 0) {
      this.logger.log(`Delay step: waiting ${delayMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    return { delayedMs: delayMs };
  }

  /**
   * Execute a transform step by mapping context values to new fields.
   */
  private async executeTransformStep(
    params: TransformStepParams,
    execution: WorkflowExecution,
  ): Promise<Record<string, unknown>> {
    const transformed: Record<string, unknown> = {};

    for (const [targetField, sourceExpression] of Object.entries(params.mapping)) {
      transformed[targetField] = this.resolveContextPath(sourceExpression, execution.context);
    }

    // Store in context if targetContextKey is specified
    if (params.targetContextKey) {
      execution.context[params.targetContextKey] = transformed;
    }

    return { transformed };
  }

  // ─── Context Resolution & Condition Evaluation ───────────────────────────

  /**
   * Resolve dot-notation paths against the context object.
   * e.g. 'trigger.lead.priority' → context.trigger.lead.priority
   */
  private resolveContextPath(path: string, context: Record<string, unknown>): unknown {
    const parts = path.split('.');
    let current: unknown = context;

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = (current as Record<string, unknown>)[part];
    }

    return current;
  }

  /**
   * Resolve template references in an args object.
   * Values starting with '$' are treated as context path references.
   */
  private resolveContextRefs(
    args: Record<string, unknown>,
    context: Record<string, unknown>,
  ): Record<string, unknown> {
    const resolved: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(args)) {
      if (typeof value === 'string' && value.startsWith('$.')) {
        resolved[key] = this.resolveContextPath(value.slice(2), context);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        resolved[key] = this.resolveContextRefs(value as Record<string, unknown>, context);
      } else {
        resolved[key] = value;
      }
    }
    return resolved;
  }

  /**
   * Evaluate a condition against a field value.
   */
  private evaluateCondition(
    fieldValue: unknown,
    operator: string,
    expectedValue: unknown,
  ): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === expectedValue;
      case 'not_equals':
        return fieldValue !== expectedValue;
      case 'greater_than':
        return Number(fieldValue) > Number(expectedValue);
      case 'less_than':
        return Number(fieldValue) < Number(expectedValue);
      case 'greater_than_or_equal':
        return Number(fieldValue) >= Number(expectedValue);
      case 'less_than_or_equal':
        return Number(fieldValue) <= Number(expectedValue);
      case 'contains':
        return String(fieldValue).includes(String(expectedValue));
      case 'not_contains':
        return !String(fieldValue).includes(String(expectedValue));
      case 'in':
        return Array.isArray(expectedValue) && expectedValue.includes(fieldValue as string);
      case 'not_in':
        return Array.isArray(expectedValue) && !expectedValue.includes(fieldValue as string);
      default:
        this.logger.warn(`Unknown condition operator: ${operator}`);
        return false;
    }
  }

  // ─── Validation Helpers ──────────────────────────────────────────────────

  /**
   * Validate that a step chain is well-formed (no orphaned nextStepId references).
   */
  private validateStepChain(steps: WorkflowStep[]): void {
    if (steps.length === 0) {
      throw new BadRequestException('Workflow must have at least one step');
    }

    const stepIds = new Set(steps.map((s) => s.id));

    // Check for duplicate step IDs
    if (stepIds.size !== steps.length) {
      throw new BadRequestException('Workflow contains duplicate step IDs');
    }

    // Validate step references
    for (const step of steps) {
      if (step.nextStepId && !stepIds.has(step.nextStepId)) {
        throw new BadRequestException(
          `Step "${step.name}" references non-existent nextStepId "${step.nextStepId}"`,
        );
      }

      if (step.type === 'condition') {
        const params = step.params as ConditionStepParams;
        if (params.trueStepId && !stepIds.has(params.trueStepId)) {
          throw new BadRequestException(
            `Condition step "${step.name}" references non-existent trueStepId "${params.trueStepId}"`,
          );
        }
        if (params.falseStepId && !stepIds.has(params.falseStepId)) {
          throw new BadRequestException(
            `Condition step "${step.name}" references non-existent falseStepId "${params.falseStepId}"`,
          );
        }
      }
    }
  }

  /**
   * Check if any of the failed steps have continueOnError enabled.
   */
  private hasContinueOnError(
    failedSteps: StepExecutionRecord[],
    workflow: WorkflowDefinition,
  ): boolean {
    return failedSteps.some((record) => {
      const step = workflow.steps.find((s) => s.id === record.stepId);
      return step?.continueOnError === true;
    });
  }

  // ─── Utility ─────────────────────────────────────────────────────────────

  /**
   * Split an array into chunks of a given size.
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Generate a UUID v4 identifier.
   */
  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
