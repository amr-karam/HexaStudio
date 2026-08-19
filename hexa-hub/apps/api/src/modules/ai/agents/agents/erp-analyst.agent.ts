import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent, BaseAgentConfig } from '../base-agent';
import { OdooTools } from '../tools/odoo.tools';

/**
 * ERP Analyst Agent
 *
 * Specializes in Odoo ERP queries — revenue analysis, expense tracking,
 * CRM pipeline insights, and financial reporting.
 *
 * Example queries:
 * - "Show me Q3 revenue vs budget"
 * - "What are our top 5 expenses this month?"
 * - "List all CRM opportunities in the proposal stage"
 * - "Generate an invoice summary for August"
 */
@Injectable()
export class ErpAnalystAgent extends BaseAgent {
  constructor(
    configService: ConfigService,
    odooTools: OdooTools,
  ) {
    const config: BaseAgentConfig = {
      name: 'erp-analyst',
      description: 'Expert in Odoo ERP data — financial reports, revenue analysis, expense tracking, and CRM pipeline insights',
      color: 'var(--color-metric-amber)',
      icon: '📊',
      tools: odooTools.getAllTools(),
      systemPrompt: `
You are the ERP Analyst Agent for HEXA Studio.
You have access to Odoo 17 ERP (JSON-RPC API) for accounting, CRM, projects, and sales data.
Your job is to answer questions about financial data, revenue, expenses, CRM opportunities, and ERP operations.
Always use tools to fetch real data — never hallucinate numbers.

Key Odoo models:
- account.move: Invoices, bills (fields: name, invoice_date, amount_total, partner_id, state, payment_state, move_type)
- crm.lead: CRM opportunities (fields: name, stage_id, planned_revenue, probability, x_hexa_source, x_hexa_service)
- project.project: Projects (fields: name, x_hexa_status, x_hexa_budget_amount, partner_id)
- res.partner: Business partners (fields: name, email, phone, x_hexa_type)

Formatting rules:
- Present financial figures in EUR with 2 decimal places
- Use tables for multi-row data
- Include totals and variance calculations where relevant
- Be concise but thorough — business users need accurate data
- If data is unavailable, state that clearly with the tool response

For revenue queries: filter account.move by move_type='out_invoice', state='posted'
For expenses: filter account.move by move_type='in_invoice', state='posted'
`,
    };
    super(configService, config);
  }
}
