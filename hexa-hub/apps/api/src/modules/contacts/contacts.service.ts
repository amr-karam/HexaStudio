import { Injectable, Logger } from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(private readonly odoo: OdooService) {}

  async getContacts(query: { search?: string; is_client?: boolean; page?: number; limit?: number }) {
    const domain: unknown[] = [];

    if (query.search) {
      domain.push('|');
      domain.push(['name', 'ilike', query.search]);
      domain.push(['email', 'ilike', query.search]);
    }
    if (query.is_client !== undefined) {
      domain.push(['x_hexa_client', '=', query.is_client]);
    }

    const limit = query.limit || 25;
    const offset = query.page ? (query.page - 1) * limit : 0;

    const contacts = await this.odoo.getContacts(
      domain,
      ['id', 'name', 'display_name', 'email', 'phone', 'mobile', 'function', 'parent_id', 'is_company', 'x_hexa_client', 'x_hexa_source', 'create_date'],
      { limit, offset, order: 'create_date desc' },
    );

    const total = await this.odoo.searchCount('res.partner', domain);
    return { data: contacts, meta: { total, page: query.page || 1, limit } };
  }

  async getContact(id: number) {
    return this.odoo.getContact(id);
  }

  async createContact(data: Record<string, unknown>) {
    const id = await this.odoo.createContact(data);
    return { id };
  }

  async updateContact(id: number, data: Record<string, unknown>) {
    await this.odoo.updateContact(id, data);
    return { id, updated: true };
  }

  async deleteContact(id: number) {
    await this.odoo.deleteContact(id);
    return { id, deleted: true };
  }

  async getClientContacts() {
    const contacts = await this.odoo.getContacts(
      [['x_hexa_client', '=', true]],
      ['id', 'name', 'display_name', 'email', 'phone', 'function', 'parent_id', 'x_hexa_source'],
    );
    return { data: contacts };
  }
}
