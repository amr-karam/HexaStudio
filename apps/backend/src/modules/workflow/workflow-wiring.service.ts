/**
 * HEXA Hub — Workflow Wiring Service
 *
 * Registers domain services with the WorkflowEngineService at bootstrap time.
 * The workflow engine is deliberately decoupled from domain modules to avoid
 * circular dependency chains. This wiring service bridges the gap: it injects
 * the exported domain services (OdooApiService — the single source of truth
 * per the Odoo-First Architecture) and registers them under every domain
 * module alias that workflow steps can target.
 *
 * Because Odoo is the SSOT, the unified OdooApiService backs all domain
 * aliases (crm, projects, helpdesk, …). Future domain services (e.g. a native
 * Hub-only service) can be registered here too — the engine resolves method
 * calls dynamically on the registered instance.
 *
 * @module workflow
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { WorkflowEngineService } from './workflow-engine.service';
import { OdooApiService } from '../odoo/odoo-api.service';
import { WorkflowTargetModule } from './workflow.types';

/**
 * Maps each workflow-targetable module name to the concrete service that
 * implements its operations. The OdooApiService is the unified Odoo-first
 * service covering every domain.
 */
const MODULE_SERVICE_ALIASES: ReadonlyArray<WorkflowTargetModule> = [
  'crm',
  'projects',
  'helpdesk',
  'accounting',
  'employees',
  'timesheets',
  'contacts',
  'calendar',
  'knowledge',
];

@Injectable()
export class WorkflowWiringService implements OnModuleInit {
  private readonly logger = new Logger(WorkflowWiringService.name);

  constructor(
    private readonly engine: WorkflowEngineService,
    private readonly odooApi: OdooApiService,
  ) {}

  onModuleInit(): void {
    // Register the unified Odoo API service under every domain module alias.
    for (const alias of MODULE_SERVICE_ALIASES) {
      this.engine.registerService(alias, this.odooApi);
    }

    this.logger.log(
      `Workflow engine wired: OdooApiService registered for ${MODULE_SERVICE_ALIASES.length} module aliases ` +
        `(${MODULE_SERVICE_ALIASES.join(', ')})`,
    );
  }
}
