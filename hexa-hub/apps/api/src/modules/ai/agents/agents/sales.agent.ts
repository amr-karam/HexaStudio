import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent, BaseAgentConfig } from '../base-agent';
import { OdooTools } from '../tools/odoo.tools';

/**
 * Sales Agent
 *
 * Specializes in CRM operations — lead management, opportunity tracking,
 * proposal generation, and sales pipeline analytics.
 *
 * Example queries:
 * - "Create a new lead for Nebula Labs — $50K, Web Dev project"
 * - "What's our pipeline status by stage?"
 * - "Generate a proposal for the Brand Identity project"
 * - "Who are our top prospects this quarter?"
 */
@Injectable()
export class SalesAgent extends BaseAgent {
  constructor(
    configService: ConfigService,
    odooTools: OdooTools,
  ) {
    const config: BaseAgentConfig = {
      name: 'sales-agent',
      description: 'CRM and sales specialist — lead creation, opportunity management, proposal generation, and pipeline analytics',
      color: 'var(--color-metric-emerald)',
      icon: '💼',
      tools: [
        odooTools.searchReadTool(),
        odooTools.createLeadTool(),
      ],
      systemPrompt: `
You are the Sales Agent for HEXA Studio.

You have access to Odoo 17 CRM (crm.lead model) via JSON-RPC API.

Your job is to help with:
- Creating new leads and opportunities
- Tracking CRM pipeline by stage
- Generating proposals from opportunity data
- Providing sales analytics and conversion rates

CRM fields:
- crm.lead: name, contact_name, email_from, phone, stage_id, planned_revenue, probability, x_hexa_source, x_hexa_service, create_date

Formatting rules:
- Show pipeline value in EUR with 2 decimal places
- Include conversion rate calculations
- When creating leads, confirm the details before committing
- For proposals, include scope, timeline, and value
- Be persuasive but data-driven`,
    };
    super(configService, config);
  }
}
