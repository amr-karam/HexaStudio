import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';

export interface ProjectRequest {
  id: string;
  projectId: string;
  clientId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'reviewed' | 'completed';
  createdAt: string;
}

@Injectable()
export class RequestsService {
  private readonly logger = new Logger(RequestsService.name);

  constructor(private readonly odooService: OdooService) {}

  async createRequest(data: Partial<ProjectRequest>): Promise<ProjectRequest> {
    const leadId = await this.odooService.create('crm.lead', {
      name: `[Request] ${data.title || 'Untitled Request'}`,
      partner_name: data.clientId || 'Unknown Client',
      description: `<p><strong>Project:</strong> ${data.projectId || 'N/A'}</p>
<p><strong>Priority:</strong> ${data.priority || 'medium'}</p>
<p><strong>Description:</strong></p><p>${data.description || ''}</p>`,
      priority: data.priority === 'high' ? '3' : data.priority === 'low' ? '1' : '2',
    });

    this.logger.log(`Created Odoo request lead #${leadId}`);

    return {
      id: `REQ-${leadId}`,
      projectId: data.projectId || 'default',
      clientId: data.clientId || 'default',
      title: data.title || 'Untitled Request',
      description: data.description || '',
      priority: data.priority || 'medium',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
  }

  async getRequestsByClient(clientEmail: string, page: number = 1, limit: number = 20): Promise<{ data: ProjectRequest[]; total: number; page: number; limit: number }> {
    const leads = await this.odooService.searchRead(
      'crm.lead',
      [['email_from', '=', clientEmail]],
      ['name', 'partner_name', 'description', 'priority', 'stage_id', 'create_date'],
    );

    const all: ProjectRequest[] = leads.map((lead: Record<string, unknown>) => ({
      id: `REQ-${lead.id}` as string,
      projectId: 'odoo',
      clientId: (lead.partner_name as string) || clientEmail,
      title: ((lead.name as string) || '').replace('[Request] ', ''),
      description: (lead.description as string) || '',
      priority: (lead.priority === '3' ? 'high' : lead.priority === '1' ? 'low' : 'medium') as ProjectRequest['priority'],
      status: 'pending' as ProjectRequest['status'],
      createdAt: (lead.create_date as string) || new Date().toISOString(),
    }));

    const skip = (page - 1) * limit;
    const data = all.slice(skip, skip + limit);
    return { data, total: all.length, page, limit };
  }

  async updateRequestStatus(id: string, status: ProjectRequest['status']): Promise<ProjectRequest> {
    const odooId = parseInt(id.replace('REQ-', ''), 10);
    if (isNaN(odooId)) throw new NotFoundException(`Invalid request ID: ${id}`);

    const stageMap: Record<string, string> = {
      pending: '1',
      reviewed: '2',
      completed: '3',
    };

    await this.odooService.write('crm.lead', [odooId], {
      stage_id: parseInt(stageMap[status] || '1', 10),
    });

    this.logger.log(`Updated Odoo lead #${odooId} status to ${status}`);

    return {
      id,
      projectId: 'odoo',
      clientId: '',
      title: '',
      description: '',
      priority: 'medium',
      status,
      createdAt: new Date().toISOString(),
    };
  }

  async findAll(page: number = 1, limit: number = 20): Promise<{ data: ProjectRequest[]; total: number; page: number; limit: number }> {
    const leads = await this.odooService.searchRead(
      'crm.lead',
      [['name', 'like', '[Request]%']],
      ['name', 'partner_name', 'description', 'priority', 'stage_id', 'create_date'],
    );

    const all: ProjectRequest[] = leads.map((lead: Record<string, unknown>) => ({
      id: `REQ-${lead.id}` as string,
      projectId: 'odoo',
      clientId: (lead.partner_name as string) || '',
      title: ((lead.name as string) || '').replace('[Request] ', ''),
      description: (lead.description as string) || '',
      priority: (lead.priority === '3' ? 'high' : lead.priority === '1' ? 'low' : 'medium') as ProjectRequest['priority'],
      status: 'pending' as ProjectRequest['status'],
      createdAt: (lead.create_date as string) || new Date().toISOString(),
    }));

    const skip = (page - 1) * limit;
    const data = all.slice(skip, skip + limit);
    return { data, total: all.length, page, limit };
  }
}
