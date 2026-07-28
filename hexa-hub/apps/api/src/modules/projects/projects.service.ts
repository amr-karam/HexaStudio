import { Injectable, Logger } from '@nestjs/common';
import { OdooService } from '../odoo/odoo.service';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private readonly odoo: OdooService) {}

  async getProjects(query: { type?: string; status?: string; partner_id?: number; search?: string; page?: number; limit?: number }) {
    const domain: unknown[] = [];

    if (query.type) domain.push(['x_hexa_type', '=', query.type]);
    if (query.status) domain.push(['x_hexa_status', '=', query.status]);
    if (query.partner_id) domain.push(['partner_id', '=', query.partner_id]);
    if (query.search) {
      domain.push(['|']);
      domain.push(['name', 'ilike', query.search]);
    }

    const limit = query.limit || 25;
    const offset = query.page ? (query.page - 1) * limit : 0;

    const projects = await this.odoo.getProjects(
      domain,
      ['id', 'name', 'display_name', 'partner_id', 'user_id', 'stage_id', 'date_start', 'date', 'planned_hours', 'total_hours', 'x_hexa_type', 'x_hexa_status', 'x_hexa_client_portal_active', 'x_hexa_budget_amount', 'create_date'],
      { limit, offset, order: 'create_date desc' },
    );

    const total = await this.odoo.searchCount('project.project', domain);
    return { data: projects, meta: { total, page: query.page || 1, limit } };
  }

  async getProject(id: number) {
    const project = await this.odoo.getProject(id);
    if (!project) return null;

    const milestones = await this.odoo.getMilestones(id);
    return { ...(project as object), milestones };
  }

  async createProject(data: Record<string, unknown>) {
    const id = await this.odoo.createProject(data);
    return { id };
  }

  async updateProject(id: number, data: Record<string, unknown>) {
    await this.odoo.updateProject(id, data);
    return { id, updated: true };
  }

  async deleteProject(id: number) {
    await this.odoo.deleteProject(id);
    return { id, deleted: true };
  }

  // ─── Milestones ─────────────────────────────────────────────────────

  async getMilestones(projectId: number) {
    const milestones = await this.odoo.getMilestones(projectId);
    return { data: milestones };
  }

  async createMilestone(projectId: number, data: Record<string, unknown>) {
    const id = await this.odoo.createMilestone({ ...data, project_id: projectId });
    return { id };
  }

  async updateMilestone(milestoneId: number, data: Record<string, unknown>) {
    await this.odoo.updateMilestone(milestoneId, data);
    return { id: milestoneId, updated: true };
  }

  async completeMilestone(milestoneId: number) {
    await this.odoo.updateMilestone(milestoneId, {
      completed: true,
      completed_date: new Date().toISOString().split('T')[0],
    });
    return { id: milestoneId, completed: true };
  }

  // ─── Stats ──────────────────────────────────────────────────────────

  async getStats() {
    const projects = await this.odoo.getProjects([], ['x_hexa_type', 'x_hexa_status', 'x_hexa_budget_amount', 'create_date']);
    const allProjects = projects as Record<string, unknown>[];

    const total = allProjects.length;
    const active = allProjects.filter((p) => p.x_hexa_status === 'active').length;
    const totalBudget = allProjects.reduce((sum, p) => sum + ((p.x_hexa_budget_amount as number) || 0), 0);

    const byType: Record<string, number> = {};
    for (const project of allProjects) {
      const type = (project.x_hexa_type as string) || 'unknown';
      byType[type] = (byType[type] || 0) + 1;
    }

    return {
      total_projects: total,
      active_projects: active,
      total_budget: totalBudget,
      projects_by_type: byType,
    };
  }
}
