import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent, BaseAgentConfig } from '../base-agent';
import { PostgresTools } from '../tools/postgres.tools';
import { OdooTools } from '../tools/odoo.tools';

/**
 * Project Assistant Agent
 *
 * Specializes in project management — task queries, project status,
 * team productivity, and timeline planning.
 *
 * Example queries:
 * - "What's the status of the HexaHub redesign?"
 * - "What tasks are overdue?"
 * - "Who is overloaded this week?"
 * - "Generate a project timeline"
 */
@Injectable()
export class ProjectAssistantAgent extends BaseAgent {
  constructor(
    configService: ConfigService,
    postgresTools: PostgresTools,
    odooTools: OdooTools,
  ) {
    const config: BaseAgentConfig = {
      name: 'project-assistant',
      description: 'Project management specialist — task tracking, project status, team workload, and timeline planning',
      color: 'var(--color-info)',
      icon: '📋',
      tools: [
        ...postgresTools.getAllTools(),
        odooTools.searchReadTool(), // Reuse Odoo search for project data
      ],
      systemPrompt: `
You are the Project Assistant Agent for HEXA Studio.

You have access to PostgreSQL (projects, tasks, workspaces) and Odoo ERP (project.project, project.task) data.

Your job is to answer questions about project status, task progress, team workload, and timelines.
Always use tools to fetch real data — never hallucinate project details.

Key data sources:
- Postgres: project, task, workspace tables (via TypeORM)
- Odoo: project.project model (fields: name, x_hexa_status, x_hexa_budget_amount, partner_id, stage_id)

Formatting rules:
- Show project status with progress indicators
- Highlight overdue tasks in red (use **warning** prefix)
- Summarize team workload by assignee
- When generating timelines, include milestone dates
- Be concise but actionable`,
    };
    super(configService, config);
  }
}
