/**
 * HEXA Hub — Workflow Seeder
 *
 * Seeds a set of opinionated default workflows on bootstrap so the engine is
 * immediately useful and demonstrable. Each seed is idempotent — it is only
 * created when a workflow with the same name does not already exist.
 *
 * Defaults follow the Odoo-First Architecture: every action step targets the
 * unified OdooApiService (registered via WorkflowWiringService under domain
 * aliases such as `crm`, `projects`, `helpdesk`, `accounting`).
 *
 * @module workflow
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { WorkflowEngineService } from './workflow-engine.service';
import { CreateWorkflowDto } from './workflow.types';

/** Seed workflow definitions (idempotent by name). */
const SEED_WORKFLOWS: ReadonlyArray<CreateWorkflowDto> = [
  {
    name: 'New Lead → Create Project',
    description:
      'When a qualified lead reaches the "Qualified" stage, automatically create a project in Odoo for kickoff planning.',
    trigger: { type: 'event', event: 'lead.stage_changed' },
    strategy: 'sequential',
    enabled: true,
    steps: [
      {
        id: 'transform-lead',
        name: 'Transform lead data',
        type: 'transform',
        params: {
          mapping: {
            name: 'trigger.lead.name',
            partner_id: 'trigger.lead.partner_id',
            x_hexa_type: 'trigger.lead.x_hexa_service',
          },
          targetContextKey: 'leadData',
        },
      },
      {
        id: 'create-project',
        name: 'Create Odoo project',
        type: 'action',
        params: {
          module: 'projects',
          method: 'createProject',
          args: { data: '$.leadData' },
        },
        nextStepId: 'notify-owner',
      },
      {
        id: 'notify-owner',
        name: 'Notify project owner',
        type: 'notification',
        continueOnError: true,
        params: {
          channel: 'in_app',
          recipients: [{ type: 'role', role: 'admin' }],
          subject: 'Project auto-created from lead',
          message: 'A new project was created from a qualified lead.',
        },
      },
    ],
  },
  {
    name: 'High-Priority Ticket Escalation',
    description:
      'When a helpdesk ticket is created with high priority, notify the support team immediately.',
    trigger: { type: 'event', event: 'ticket.created' },
    strategy: 'sequential',
    enabled: true,
    steps: [
      {
        id: 'check-priority',
        name: 'Check ticket priority',
        type: 'condition',
        params: {
          field: 'trigger.ticket.priority',
          operator: 'equals',
          value: 'high',
          trueStepId: 'notify-support',
          falseStepId: 'done',
        },
      },
      {
        id: 'notify-support',
        name: 'Notify support team',
        type: 'notification',
        params: {
          channel: 'slack',
          recipients: [{ type: 'role', role: 'admin' }],
          subject: 'High-priority ticket',
          message: 'A high-priority ticket requires immediate attention.',
        },
      },
      {
        id: 'done',
        name: 'No action needed',
        type: 'delay',
        params: { durationMs: 0 },
      },
    ],
  },
  {
    name: 'Overdue Task Reminder',
    description:
      'Daily scheduled workflow that flags overdue tasks. Runs at 08:00 UTC.',
    trigger: { type: 'schedule', schedule: '0 8 * * *' },
    strategy: 'sequential',
    enabled: true,
    steps: [
      {
        id: 'notify-overdue',
        name: 'Notify overdue tasks',
        type: 'notification',
        params: {
          channel: 'email',
          recipients: [{ type: 'role', role: 'admin' }],
          subject: 'Overdue tasks review',
          message: 'Please review tasks that are past their deadlines.',
        },
      },
    ],
  },
];

@Injectable()
export class WorkflowSeeder implements OnModuleInit {
  private readonly logger = new Logger(WorkflowSeeder.name);

  constructor(private readonly engine: WorkflowEngineService) {}

  async onModuleInit(): Promise<void> {
    const existing = await this.engine.listWorkflows();
    const existingNames = new Set(existing.map((w) => w.name));

    for (const seed of SEED_WORKFLOWS) {
      if (existingNames.has(seed.name)) {
        this.logger.debug(`Workflow "${seed.name}" already seeded — skipping`);
        continue;
      }
      try {
        await this.engine.createWorkflow(seed);
        this.logger.log(`Seeded workflow: "${seed.name}"`);
      } catch (error) {
        this.logger.error(
          `Failed to seed workflow "${seed.name}": ${(error as Error).message}`,
        );
      }
    }
  }
}
