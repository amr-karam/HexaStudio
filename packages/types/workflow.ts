// HEXA Hub — Workflow Engine Type Definitions.
// Mirror of `apps/backend/src/modules/workflow/workflow.types.ts`.
// Strongly-typed interfaces for the workflow automation engine.
// No `any` types — every value is explicitly typed.

// ─── Trigger Types ──────────────────────────────────────────────────────────

/** Supported event names that can trigger workflows. */
export type WorkflowEventName =
  | 'lead.created'
  | 'lead.updated'
  | 'lead.stage_changed'
  | 'lead.won'
  | 'lead.lost'
  | 'task.created'
  | 'task.updated'
  | 'task.completed'
  | 'task.overdue'
  | 'project.created'
  | 'project.updated'
  | 'project.completed'
  | 'ticket.created'
  | 'ticket.updated'
  | 'ticket.resolved'
  | 'invoice.created'
  | 'invoice.paid'
  | 'invoice.overdue'
  | 'employee.hired'
  | 'timesheet.submitted'
  | 'manual';

/** Step type determines how the engine processes a workflow step. */
export type WorkflowStepType = 'action' | 'condition' | 'notification' | 'delay' | 'transform';

/** Supported condition comparison operators. */
export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'contains'
  | 'not_contains'
  | 'in'
  | 'not_in';

/** Supported modules that workflow steps can target. */
export type WorkflowTargetModule =
  | 'crm'
  | 'projects'
  | 'helpdesk'
  | 'accounting'
  | 'employees'
  | 'timesheets'
  | 'contacts'
  | 'calendar'
  | 'knowledge'
  | 'notification'
  | 'workflow';

// ─── Workflow Trigger ───────────────────────────────────────────────────────

/** Defines how a workflow is triggered. */
export interface WorkflowTrigger {
  /** Trigger mechanism. */
  type: 'event' | 'schedule' | 'manual';
  /** Event name (required when type is 'event'). */
  event?: WorkflowEventName;
  /** Cron expression (required when type is 'schedule'). */
  schedule?: string;
}

// ─── Workflow Step ──────────────────────────────────────────────────────────

/** Parameters for an action step. */
export interface ActionStepParams {
  /** Target module to invoke. */
  module: WorkflowTargetModule;
  /** Method name to call on the target module service. */
  method: string;
  /** Method arguments. */
  args?: Record<string, unknown>;
}

/** Parameters for a condition step. */
export interface ConditionStepParams {
  /** Field to evaluate (dot-notation supported, e.g. 'context.lead.priority'). */
  field: string;
  /** Comparison operator. */
  operator: ConditionOperator;
  /** Value to compare against. */
  value: string | number | boolean | string[];
  /** Step ID to jump to when condition is TRUE. */
  trueStepId: string;
  /** Step ID to jump to when condition is FALSE. */
  falseStepId: string;
}

/** Parameters for a notification step. */
export interface NotificationStepParams {
  /** Notification channel. */
  channel: 'email' | 'slack' | 'in_app';
  /** Recipient specification. */
  recipients: NotificationRecipient[];
  /** Template key or inline message. */
  template?: string;
  /** Inline message body (used when template is not provided). */
  message?: string;
  /** Message subject. */
  subject?: string;
}

/** Recipient for notifications. */
export type NotificationRecipient =
  | { type: 'user'; userId: string }
  | { type: 'role'; role: string }
  | { type: 'email'; email: string };

/** Parameters for a delay step. */
export interface DelayStepParams {
  /** Delay duration in milliseconds. */
  durationMs: number;
}

/** Parameters for a transform step. */
export interface TransformStepParams {
  /** Mapping rules: target field → source expression (dot-notation). */
  mapping: Record<string, string>;
  /** Target module to store the transformed result. */
  targetContextKey?: string;
}

/** A single step in a workflow definition. */
export interface WorkflowStep {
  /** Unique step ID within the workflow. */
  id: string;
  /** Human-readable step name. */
  name: string;
  /** Step type. */
  type: WorkflowStepType;
  /** Step-specific parameters (discriminated union based on type). */
  params: ActionStepParams | ConditionStepParams | NotificationStepParams | DelayStepParams | TransformStepParams;
  /** Step ID to execute next (for action / notification / delay / transform). */
  nextStepId?: string;
  /** Whether this step can fail without failing the whole workflow. */
  continueOnError?: boolean;
}

// ─── Workflow Definition ────────────────────────────────────────────────────

/** Execution strategy for the workflow. */
export type ExecutionStrategy = 'sequential' | 'parallel';

/** A complete workflow definition. */
export interface WorkflowDefinition {
  /** Unique workflow identifier (UUID). */
  id: string;
  /** Human-readable workflow name. */
  name: string;
  /** Optional description. */
  description: string;
  /** Trigger configuration. */
  trigger: WorkflowTrigger;
  /** Ordered list of steps to execute. */
  steps: WorkflowStep[];
  /** Execution strategy (default: sequential). */
  strategy: ExecutionStrategy;
  /** Whether the workflow is enabled. */
  enabled: boolean;
  /** Workflow version (auto-incremented on update). */
  version: number;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /** ISO-8601 last-update timestamp. */
  updatedAt: string;
}

// ─── Workflow Execution ─────────────────────────────────────────────────────

/** Execution status of a workflow run. */
export type WorkflowExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';

/** Represents a single step execution record. */
export interface StepExecutionRecord {
  /** Step ID from the definition. */
  stepId: string;
  /** Step name at time of execution. */
  stepName: string;
  /** Execution status of this step. */
  status: WorkflowExecutionStatus;
  /** ISO-8601 start time. */
  startedAt: string;
  /** ISO-8601 completion time (if finished). */
  completedAt?: string;
  /** Step result output. */
  result?: Record<string, unknown>;
  /** Error message if step failed. */
  error?: string;
}

/** A workflow execution instance (runtime state). */
export interface WorkflowExecution {
  /** Unique execution identifier (UUID). */
  id: string;
  /** Reference to the workflow definition. */
  workflowId: string;
  /** Workflow version at execution time. */
  workflowVersion: number;
  /** Current execution status. */
  status: WorkflowExecutionStatus;
  /** ID of the step currently being executed. */
  currentStepId?: string;
  /** ISO-8601 start time. */
  startedAt: string;
  /** ISO-8601 completion time (if finished). */
  completedAt?: string;
  /** Error message if execution failed. */
  error?: string;
  /** Shared context data passed between steps. */
  context: Record<string, unknown>;
  /** Ordered history of step executions. */
  steps: StepExecutionRecord[];
  /** Execution trigger metadata. */
  triggerPayload?: Record<string, unknown>;
}

// ─── Service Method Registry ────────────────────────────────────────────────

/** Maps (module, method) pairs to actual service method calls. */
export interface ServiceMethodRegistry {
  [module: string]: {
    [method: string]: (...args: unknown[]) => Promise<unknown>;
  };
}

// ─── DTOs (for controller validation) ──────────────────────────────────────

/** DTO for creating a workflow definition. */
export interface CreateWorkflowDto {
  name: string;
  description?: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  strategy?: ExecutionStrategy;
  enabled?: boolean;
}

/** DTO for updating a workflow definition. */
export interface UpdateWorkflowDto {
  name?: string;
  description?: string;
  trigger?: WorkflowTrigger;
  steps?: WorkflowStep[];
  strategy?: ExecutionStrategy;
  enabled?: boolean;
}

/** DTO for manually executing a workflow. */
export interface ExecuteWorkflowDto {
  /** Optional initial context to pass to the workflow. */
  context?: Record<string, unknown>;
}
