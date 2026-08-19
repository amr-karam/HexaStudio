import { Injectable } from '@nestjs/common';
import { OdooService } from '../../../odoo/odoo.service';
import { createTool, formatResults } from './tool-schemas';
import { AgentTool } from '../types/agent.types';

/**
 * Odoo tools — used by the ERP Analyst Agent and Sales Agent.
 *
 * These tools wrap the existing OdooService methods to provide
 * OpenAI-compatible function definitions for the agent loop.
 */
@Injectable()
export class OdooTools {
  constructor(private readonly odoo: OdooService) {}

  /** Query Odoo records by model with domain filter */
  searchReadTool(): AgentTool {
    return createTool(
      'odoo_search_read',
      'Query records from an Odoo model (crm.lead, project.project, res.partner, account.move, etc.)',
      {
        model: {
          type: 'string',
          description: 'Odoo model name, e.g. "crm.lead", "project.project", "account.move", "res.partner"',
        },
        domain: {
          type: 'string',
          description: 'JSON-encoded Odoo domain filter, e.g. "[["stage_id","=","won"]]" or "[]" for all records',
        },
        fields: {
          type: 'string',
          description: 'JSON array of field names to return, e.g. ["name","stage_id","planned_revenue"]',
        },
        limit: {
          type: 'string',
          description: 'Maximum number of records (default 50)',
        },
      },
      ['model', 'fields'],
      async (args) => {
        const model = args.model;
        const domain = args.domain ? JSON.parse(args.domain) : [];
        const fields = args.fields ? JSON.parse(args.fields) : [];
        const limit = args.limit ? parseInt(args.limit, 10) : 50;

        const data = await this.odoo.searchRead(model, domain, fields, { limit });
        return formatResults(data, limit);
      },
    );
  }

  /** Create a lead/opportunity record in Odoo CRM */
  createLeadTool(): AgentTool {
    return createTool(
      'odoo_create_lead',
      'Create a new CRM lead/opportunity in Odoo with the provided details',
      {
        name: { type: 'string', description: 'Lead name / opportunity title' },
        contact_name: { type: 'string', description: 'Contact person name' },
        email_from: { type: 'string', description: 'Contact email address' },
        phone: { type: 'string', description: 'Contact phone number' },
        planned_revenue: { type: 'string', description: 'Expected deal value in EUR' },
        stage_id: { type: 'string', description: 'Stage ID (optional, defaults to first stage)' },
        source: { type: 'string', description: 'Lead source' },
        service: { type: 'string', description: 'Service type (e.g. "Brand Identity", "Web Development")' },
      },
      ['name'],
      async (args) => {
        const leadData: Record<string, unknown> = {
          name: args.name,
          type: 'opportunity',
        };
        if (args.email_from) leadData.email_from = args.email_from;
        if (args.phone) leadData.phone = args.phone;
        if (args.contact_name) leadData.contact_name = args.contact_name;
        if (args.planned_revenue) leadData.planned_revenue = parseFloat(args.planned_revenue);
        if (args.stage_id) leadData.stage_id = parseInt(args.stage_id, 10);
        if (args.source) leadData.x_hexa_source = args.source;
        if (args.service) leadData.x_hexa_service = args.service;

        const id = await this.odoo.createLead(leadData);
        return JSON.stringify({ id, message: `Lead "${args.name}" created with ID ${id}` });
      },
    );
  }

  /** Query accounting/financial data from Odoo */
  queryFinancialDataTool(): AgentTool {
    return createTool(
      'odoo_financial_query',
      'Query financial data from Odoo — revenue, expenses, invoices, payments',
      {
        query_type: {
          type: 'string',
          enum: ['revenue', 'expenses', 'invoices', 'payments', 'profitability'],
          description: 'Type of financial data to retrieve',
        },
        date_from: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        date_to: { type: 'string', description: 'End date (YYYY-MM-DD)' },
        limit: { type: 'string', description: 'Maximum records (default 50)' },
      },
      ['query_type'],
      async (args) => {
        // Use the generic searchRead with appropriate model + domain
        const model = args.query_type === 'revenue' ? 'account.move' : 'account.move';
        const domain = [
          ['move_type', '=', 'out_invoice'],
          ['state', '=', 'posted'],
        ];
        if (args.date_from) domain.push(['invoice_date', '>=', args.date_from]);
        if (args.date_to) domain.push(['invoice_date', '<=', args.date_to]);

        const fields = ['name', 'invoice_date', 'amount_total', 'partner_id', 'state', 'payment_state'];
        const limit = args.limit ? parseInt(args.limit, 10) : 50;

        const data = await this.odoo.searchRead(model, domain, fields, { limit });
        return formatResults(data, limit);
      },
    );
  }

  /** Get all available tools */
  getAllTools(): AgentTool[] {
    return [
      this.searchReadTool(),
      this.createLeadTool(),
      this.queryFinancialDataTool(),
    ];
  }
}
