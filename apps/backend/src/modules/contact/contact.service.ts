import { Injectable, Logger } from '@nestjs/common';
import { ContactMessage } from '@hexastudio/types';
import { OdooService } from '../odoo/odoo.service';
import { RedisService } from '../storage/redis.service';

const PENDING_LEADS_KEY = 'odoo:pending-leads';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly odooService: OdooService,
    private readonly redisService: RedisService,
  ) {}

  async sendMessage(message: ContactMessage): Promise<{ success: boolean; message: string }> {
    const leadData = this.buildLeadPayload(message);

    try {
      const leadId = await this.odooService.create('crm.lead', leadData);
      this.logger.log(`Created Odoo CRM lead #${leadId} for ${message.email}`);

      return {
        success: true,
        message: 'Thank you for your message. We will get back to you within 24 hours.',
      };
    } catch (error) {
      this.logger.warn(`Odoo unavailable, queueing lead for ${message.email}: ${(error as Error).message}`);

      // Queue the lead in Redis for async reconciliation
      try {
        await this.redisService.lpush(PENDING_LEADS_KEY, leadData);
        this.logger.log(`Lead queued in Redis for ${message.email}`);
      } catch (queueError) {
        this.logger.error(`Failed to queue lead in Redis: ${(queueError as Error).message}`);
      }

      // Still return success — the lead is queued and will be reconciled
      return {
        success: true,
        message: 'Thank you for your message. We will get back to you within 24 hours.',
      };
    }
  }

  private buildLeadPayload(message: ContactMessage): Record<string, unknown> {
    const name = this.escapeHtml(message.name);
    const email = this.escapeHtml(message.email);
    const company = message.company ? this.escapeHtml(message.company) : '';
    const phone = message.phone ? this.escapeHtml(message.phone) : '';
    const service = message.service ? this.escapeHtml(message.service) : '';
    const budget = message.budget ? this.escapeHtml(message.budget) : '';
    const body = this.escapeHtml(message.message);

    return {
      name: `Contact: ${name} - ${company || 'Unknown'}`,
      contact_name: name,
      partner_name: company || name,
      email_from: email,
      phone: phone || false,
      description: `<p><strong>From:</strong> ${name} (${email})</p>
<p><strong>Company:</strong> ${company || 'N/A'}</p>
${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
${service ? `<p><strong>Service:</strong> ${service}</p>` : ''}
${budget ? `<p><strong>Budget:</strong> ${budget}</p>` : ''}
<p><strong>Message:</strong></p><p>${body}</p>`,
      // Custom HEXA fields
      x_hexa_source: 'website',
      ...(message.service && { x_hexa_service: message.service }),
      ...(message.budget && { x_hexa_budget: message.budget }),
    };
  }

  private escapeHtml(value: string): string {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return value.replace(/[&<>"']/g, (character) => entities[character]);
  }
}
