/**
 * HEXA Hub — Workflow Event Listener
 *
 * Listens to domain events via the EventBus and dispatches them to the
 * Workflow Engine for processing. Acts as the bridge between the event
 * system and the workflow automation engine.
 *
 * @module workflow
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBus } from '../realtime/event-bus.service';
import { WorkflowEngineService } from './workflow-engine.service';
import { WorkflowEventName } from './workflow.types';

/**
 * Maps EventBus event names to workflow engine event names.
 * Allows the listener to normalize event formats.
 */
const EVENT_MAPPING: Record<string, WorkflowEventName> = {
  'odoo:lead': 'lead.created',
  'odoo:lead:update': 'lead.updated',
  'odoo:lead:stage': 'lead.stage_changed',
  'odoo:lead:won': 'lead.won',
  'odoo:lead:lost': 'lead.lost',
  'odoo:task': 'task.created',
  'odoo:task:update': 'task.updated',
  'odoo:task:done': 'task.completed',
  'odoo:task:overdue': 'task.overdue',
  'odoo:project': 'project.created',
  'odoo:project:update': 'project.updated',
  'odoo:project:done': 'project.completed',
  'odoo:ticket': 'ticket.created',
  'odoo:ticket:update': 'ticket.updated',
  'odoo:ticket:resolved': 'ticket.resolved',
  'odoo:invoice': 'invoice.created',
  'odoo:invoice:paid': 'invoice.paid',
  'odoo:invoice:overdue': 'invoice.overdue',
  'approval:action': 'task.updated',
  'annotation:add': 'task.updated',
  'project:update': 'project.updated',
};

@Injectable()
export class WorkflowEventListener implements OnModuleInit {
  private readonly logger = new Logger(WorkflowEventListener.name);

  constructor(
    private readonly eventBus: EventBus,
    private readonly engine: WorkflowEngineService,
  ) {}

  onModuleInit() {
    // Register listeners for all known event types
    for (const [busEvent, workflowEvent] of Object.entries(EVENT_MAPPING)) {
      this.eventBus.on(busEvent, async (payload: unknown) => {
        await this.onEvent(workflowEvent, busEvent, payload);
      });
    }

    this.logger.log(
      `Workflow event listener registered for ${Object.keys(EVENT_MAPPING).length} event types`,
    );
  }

  /**
   * Handle an incoming event and dispatch it to the workflow engine.
   *
   * @param workflowEvent - Normalized workflow event name.
   * @param busEvent - Original EventBus event name.
   * @param payload - Event payload.
   */
  private async onEvent(
    workflowEvent: WorkflowEventName,
    busEvent: string,
    payload: unknown,
  ): Promise<void> {
    try {
      const context = typeof payload === 'object' && payload !== null
        ? payload as Record<string, unknown>
        : { raw: payload };

      this.logger.debug(
        `Dispatching event "${busEvent}" as workflow event "${workflowEvent}"`,
      );

      await this.engine.handleEvent(workflowEvent, context);
    } catch (error) {
      this.logger.error(
        `Failed to process workflow event "${busEvent}": ${(error as Error).message}`,
      );
    }
  }
}
