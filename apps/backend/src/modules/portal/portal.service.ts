import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { OdooService } from '../odoo/odoo.service';
import { MinioService } from '../storage/minio.service';
import { RedisService } from '../storage/redis.service';
import type {
  PortalDashboardData,
  ProjectHealthStatus,
  ActivityItem,
  UpcomingMilestone,
  PendingApproval,
  NotificationSummaryItem,
  PortalTask,
  PortalTeamMember,
  PortalProjectDetail,
  TaskStatus,
  TaskPriority,
  ExecutiveBrief,
  GeneratedContract,
} from './portal-dashboard.types';

export interface PortalProjectStatus {
  phase: string;
  status: 'completed' | 'in-progress' | 'pending';
  description: string;
  date?: string;
}

export interface PortalDocument {
  id: string;
  projectId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
  downloadUrl?: string;
}

export interface PortalInvoice {
  id: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
}

export interface ClientProject {
  id: number;
  name: string;
  status: string;
  type: string;
  startDate: string;
  endDate: string;
  milestones: ClientMilestone[];
}

export interface ClientMilestone {
  id: number;
  name: string;
  date: string;
  completed: boolean;
  description: string;
}

export interface ClientInvoice {
  id: number;
  name: string;
  date: string;
  amount: number;
  residual: number;
  paymentState: string;
  state: string;
}

export interface NotificationPreferences {
  projectUpdates: boolean;
  phaseApprovals: boolean;
  newAnnotations: boolean;
  documentUploads: boolean;
  milestoneCompletions: boolean;
}

const PORTAL_DOCUMENTS_PREFIX = 'portal:documents';
const PORTAL_BUCKET = 'portal';
const DOCUMENTS_INDEX_KEY = `${PORTAL_DOCUMENTS_PREFIX}:index`;
const PORTAL_NOTIFICATIONS_PREFIX = 'portal:notifications';

@Injectable()
export class PortalService {
  private readonly logger = new Logger(PortalService.name);

  constructor(
    private readonly odooService: OdooService,
    private readonly minioService: MinioService,
    private readonly redisService: RedisService,
  ) {}

  async getClientProjectData(clientEmail?: string) {
    // Scope everything to the authenticated client's Odoo partner.
    const partnerId = clientEmail ? await this.resolvePartnerId(clientEmail) : null;

    const projects = partnerId ? await this.getClientProjects(partnerId) : [];
    const invoices = partnerId ? await this.getClientInvoices(partnerId) : [];

    const primaryProject = projects[0];
    const milestones = primaryProject?.milestones ?? [];

    const timeline = milestones.map((m: ClientMilestone) => ({
      phase: m.name,
      status: (m.completed ? 'completed' : 'pending') as PortalProjectStatus['status'],
      description: m.description,
      date: m.date || undefined,
    }));

    const invoiceData: PortalInvoice[] = invoices.map((inv) => ({
      id: String(inv.id),
      amount: inv.amount,
      date: inv.date || new Date().toISOString(),
      status:
        inv.paymentState === 'paid'
          ? 'paid'
          : inv.paymentState === 'not_paid'
            ? 'pending'
            : 'overdue',
    }));

    const projectId = primaryProject ? String(primaryProject.id) : undefined;
    const documents = projectId ? await this.getDocuments(projectId) : [];

    return {
      project: {
        title: primaryProject?.name ?? 'No Project',
        category: primaryProject?.type ?? '',
        status: primaryProject?.status ?? '',
      },
      timeline,
      documents,
      invoices: invoiceData,
      lead: {
        name: 'Client',
        role: 'Project Manager',
        email: clientEmail || 'client@hexastudio.net',
        avatar: '/avatars/default.jpg',
      },
    };
  }

  // --- Dashboard Aggregation ---

  /**
   * Build the aggregated dashboard data for the authenticated client.
   *
   * The health score algorithm:
   *   1. Start at 100
   *   2. Deduct -5 per unpaid invoice, -10 per overdue invoice
   *   3. Deduct proportional points for incomplete milestones
   *   4. Add +2 per recent activity item (last 7 days)
   *   5. Clamp to 0-100
   */
  async getDashboardData(clientEmail: string): Promise<PortalDashboardData> {
    this.logger.log(`Building dashboard data for ${clientEmail}`);

    const partnerId = await this.resolvePartnerId(clientEmail);

    // ── Fetch raw data ──────────────────────────────────────────────────────
    const projects = partnerId ? await this.getClientProjects(partnerId) : [];
    const invoices = partnerId ? await this.getClientInvoices(partnerId) : [];

    // Gather documents across all projects
    const allDocuments: PortalDocument[] = [];
    for (const project of projects) {
      try {
        const docs = await this.getDocuments(String(project.id));
        allDocuments.push(...docs);
      } catch {
        this.logger.warn(`Failed to fetch documents for project ${project.id}`);
      }
    }

    // ── KPIs ────────────────────────────────────────────────────────────────
    const activeProjects = projects.filter(
      (p) => p.status !== 'completed' && p.status !== 'cancelled',
    ).length;

    const unpaidInvoices = invoices.filter((i) => i.paymentState === 'not_paid');
    const overdueInvoices = invoices.filter(
      (i) => i.paymentState === 'overdue' || i.paymentState === 'partial',
    );
    const totalOutstanding = invoices.reduce(
      (sum, inv) => sum + (inv.residual > 0 ? inv.residual : 0),
      0,
    );

    const kpis = {
      activeProjects,
      pendingTasks: this.countPendingTasks(projects),
      outstandingInvoices: unpaidInvoices.length + overdueInvoices.length,
      totalOutstandingAmount: Math.round(totalOutstanding * 100) / 100,
      pendingApprovals: 0, // computed below after approval build
      openSupportTickets: 0, // placeholder – no ticket system wired yet
    };

    // ── Recent Activity (last 10 items) ─────────────────────────────────────
    const recentActivity = this.buildActivityFeed(projects, invoices, allDocuments);

    // ── Upcoming Milestones ─────────────────────────────────────────────────
    const upcomingMilestones = this.buildUpcomingMilestones(projects);

    // ── Pending Approvals ───────────────────────────────────────────────────
    const pendingApprovals = this.buildPendingApprovals(projects);
    kpis.pendingApprovals = pendingApprovals.length;

    // ── Notifications summary (from Redis) ──────────────────────────────────
    const notifications = await this.getNotificationsSummary(clientEmail);

    // ── Project Health Score ─────────────────────────────────────────────────
    const projectHealth = this.computeProjectHealth(
      projects,
      unpaidInvoices,
      overdueInvoices,
      recentActivity,
    );

    return {
      projectHealth,
      kpis,
      recentActivity,
      upcoming: {
        meetings: [], // No meeting system wired yet
        milestones: upcomingMilestones,
      },
      pendingApprovals,
      notifications,
    };
  }

  // ── Dashboard helpers (private) ──────────────────────────────────────────────

  /**
   * Count tasks that are still pending across all project milestones.
   */
  private countPendingTasks(projects: ClientProject[]): number {
    let pending = 0;
    for (const project of projects) {
      for (const milestone of project.milestones) {
        if (!milestone.completed) pending++;
      }
    }
    return pending;
  }

  /**
   * Build a reverse-chronological activity feed (max 10 items).
   * Sources: milestone completions, document uploads, invoice status changes.
   */
  private buildActivityFeed(
    projects: ClientProject[],
    invoices: ClientInvoice[],
    documents: PortalDocument[],
  ): ActivityItem[] {
    const items: ActivityItem[] = [];

    // Milestone completions
    for (const project of projects) {
      for (const milestone of project.milestones) {
        if (milestone.completed) {
          items.push({
            id: `milestone-${milestone.id}`,
            type: 'milestone_completed',
            title: `Milestone "${milestone.name}" completed`,
            description: milestone.description || `Completed in ${project.name}`,
            timestamp: milestone.date || new Date().toISOString(),
            projectId: project.id,
            projectName: project.name,
          });
        }
      }
    }

    // Document uploads
    for (const doc of documents) {
      items.push({
        id: `doc-${doc.id}`,
        type: 'document_uploaded',
        title: `Document "${doc.originalName}" uploaded`,
        description: doc.description || `Uploaded to project ${doc.projectId}`,
        timestamp: doc.uploadedAt,
        projectId: doc.projectId ? parseInt(doc.projectId, 10) : undefined,
      });
    }

    // Invoice status changes (every invoice is an event)
    for (const inv of invoices) {
      const type =
        inv.paymentState === 'paid' ? 'status_update' : 'invoice_sent';
      items.push({
        id: `invoice-${inv.id}`,
        type,
        title:
          inv.paymentState === 'paid'
            ? `Invoice ${inv.name} paid`
            : `Invoice ${inv.name} sent`,
        description: `Amount: ${inv.amount.toFixed(2)} | Status: ${inv.paymentState}`,
        timestamp: inv.date || new Date().toISOString(),
      });
    }

    // Sort newest-first and take top 10
    items.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    return items.slice(0, 10);
  }

  /**
   * Collect milestones with a future due date across all projects.
   */
  private buildUpcomingMilestones(projects: ClientProject[]): UpcomingMilestone[] {
    const now = new Date();
    const upcoming: UpcomingMilestone[] = [];

    for (const project of projects) {
      for (const milestone of project.milestones) {
        if (!milestone.completed && milestone.date) {
          const dueDate = new Date(milestone.date);
          if (dueDate >= now) {
            const totalMilestones = project.milestones.length;
            const completedMilestones = project.milestones.filter((m) => m.completed).length;
            upcoming.push({
              id: String(milestone.id),
              name: milestone.name,
              dueDate: milestone.date,
              projectName: project.name,
              progress:
                totalMilestones > 0
                  ? Math.round((completedMilestones / totalMilestones) * 100)
                  : 0,
            });
          }
        }
      }
    }

    // Sort by due date ascending
    upcoming.sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );
    return upcoming;
  }

  /**
   * Derive pending approval items from incomplete milestones that are
   * marked as "approval required" in the project workflow.
   *
   * Since Odoo doesn't have a dedicated approval table exposed to the
   * portal, we treat incomplete milestones with a future due date as
   * "pending approvals" to give the client actionable visibility.
   */
  private buildPendingApprovals(projects: ClientProject[]): PendingApproval[] {
    const approvals: PendingApproval[] = [];

    for (const project of projects) {
      for (const milestone of project.milestones) {
        if (!milestone.completed && milestone.date) {
          const dueDate = new Date(milestone.date);
          const now = new Date();
          const daysUntilDue =
            (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

          // Determine priority based on proximity to due date
          let priority: 'low' | 'medium' | 'high' = 'low';
          if (daysUntilDue < 0) priority = 'high'; // overdue
          else if (daysUntilDue < 7) priority = 'medium';

          approvals.push({
            id: `approval-${milestone.id}`,
            type: 'deliverable',
            title: `Approve: ${milestone.name}`,
            submittedAt: milestone.date,
            projectName: project.name,
            priority,
          });
        }
      }
    }

    return approvals;
  }

  /**
   * Retrieve the notifications summary for a user from Redis.
   */
  private async getNotificationsSummary(
    clientEmail: string,
  ): Promise<{ unread: number; total: number; recent: NotificationSummaryItem[] }> {
    try {
      const key = `${PORTAL_NOTIFICATIONS_PREFIX}:${clientEmail}`;
      const notifications = await this.redisService.lrange<NotificationSummaryItem>(key, 0, 9);
      const total = await this.redisService.llen(key);
      const unread = notifications.filter((n) => !n.read).length;

      return {
        unread,
        total,
        recent: notifications,
      };
    } catch (err) {
      this.logger.warn(`Failed to fetch notifications for ${clientEmail}: ${err}`);
      return { unread: 0, total: 0, recent: [] };
    }
  }

  /**
   * Compute a 0-100 health score for the client's portfolio.
   *
   * Algorithm:
   *   1. Start at 100
   *   2. Deduct -5 per unpaid invoice
   *   3. Deduct -10 per overdue invoice
   *   4. Deduct proportional points for incomplete milestones
   *   5. Add +2 per activity in the last 7 days (max +20 bonus)
   *   6. Clamp to 0-100
   */
  private computeProjectHealth(
    projects: ClientProject[],
    unpaidInvoices: ClientInvoice[],
    overdueInvoices: ClientInvoice[],
    recentActivity: ActivityItem[],
  ): { score: number; status: ProjectHealthStatus; activeProjects: number; completedProjects: number; totalProjects: number } {
    let score = 100;

    // Deductions for unpaid invoices
    score -= unpaidInvoices.length * 5;

    // Deductions for overdue invoices
    score -= overdueInvoices.length * 10;

    // Deductions for incomplete milestones (proportional)
    let totalMilestones = 0;
    let completedMilestones = 0;
    for (const project of projects) {
      totalMilestones += project.milestones.length;
      completedMilestones += project.milestones.filter((m) => m.completed).length;
    }
    if (totalMilestones > 0) {
      const completionRate = completedMilestones / totalMilestones;
      const incompleteDeduction = Math.round((1 - completionRate) * 20); // max -20
      score -= incompleteDeduction;
    }

    // Bonus for recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentCount = recentActivity.filter(
      (a) => new Date(a.timestamp) >= sevenDaysAgo,
    ).length;
    score += Math.min(recentCount * 2, 20); // max +20 bonus

    // Clamp to 0-100
    score = Math.max(0, Math.min(100, score));

    // Determine status label
    let status: ProjectHealthStatus;
    if (score >= 80) status = 'excellent';
    else if (score >= 60) status = 'good';
    else if (score >= 40) status = 'attention';
    else status = 'critical';

    const activeProjects = projects.filter(
      (p) => p.status !== 'completed' && p.status !== 'cancelled',
    ).length;
    const completedProjects = projects.filter((p) => p.status === 'completed').length;

    return {
      score,
      status,
      activeProjects,
      completedProjects,
      totalProjects: projects.length,
    };
  }

  // --- Workspace & Kanban ---

  /**
   * Map Odoo task state to our portal TaskStatus.
   */
  private mapOdooTaskState(state: string): TaskStatus {
    switch (state) {
      case '01_in_progress': return 'in_progress';
      case '02_changes_requested': return 'review';
      case '03_approved': return 'done';
      case '1_in_progress': return 'in_progress';
      case '2_changes_requested': return 'review';
      case '3_approved': return 'done';
      case 'done': return 'done';
      case 'running': return 'in_progress';
      case 'pending': return 'todo';
      default: return 'todo';
    }
  }

  /**
   * Map Odoo task priority to our portal TaskPriority.
   */
  private mapOdooTaskPriority(priority: unknown): TaskPriority {
    const p = Number(priority) || 0;
    if (p >= 3) return 'urgent';
    if (p === 2) return 'high';
    if (p === 1) return 'medium';
    return 'low';
  }

  /**
   * Get client-visible tasks for a project, mapped to PortalTask format.
   */
  async getProjectTasks(projectId: number): Promise<PortalTask[]> {
    try {
      const tasks = await this.odooService.execute<Record<string, unknown>[]>(
        'project.task',
        'search_read',
        [
          [
            ['project_id', '=', projectId],
            ['x_hexa_client_viewable', '=', true],
          ],
          ['id', 'name', 'description', 'state', 'x_hexa_priority', 'user_ids', 'date_deadline', 'date_assign', 'stage_id', 'project_id'],
          0, 100,
          'date_deadline asc',
        ],
      );

      return tasks.map((t) => ({
        id: String(t.id),
        projectId,
        title: (t.name as string) || '',
        description: (t.description as string) || '',
        status: this.mapOdooTaskState((t.state as string) || ''),
        priority: this.mapOdooTaskPriority(t['x_hexa_priority']),
        assigneeName: undefined, // resolved separately if needed
        dueDate: (t.date_deadline as string) || undefined,
        createdAt: (t.date_assign as string) || new Date().toISOString(),
      }));
    } catch (err) {
      this.logger.warn(`Failed to fetch tasks for project ${projectId}: ${err}`);
      return [];
    }
  }

  /**
   * Get project team members visible to the client.
   */
  async getProjectTeam(projectId: number): Promise<PortalTeamMember[]> {
    try {
      // Fetch users assigned to tasks in this project
      const tasks = await this.odooService.execute<Record<string, unknown>[]>(
        'project.task',
        'search_read',
        [
          [['project_id', '=', projectId]],
          ['user_ids'],
          0, 100,
        ],
      );

      // Collect unique user IDs
      const userIdSet = new Set<number>();
      for (const task of tasks) {
        const userIds = task.user_ids as number[] | false;
        if (Array.isArray(userIds)) {
          userIds.forEach((id) => userIdSet.add(id));
        }
      }

      if (userIdSet.size === 0) return [];

      // Fetch user details
      const userIds = Array.from(userIdSet);
      const users = await this.odooService.execute<Record<string, unknown>[]>(
        'res.users',
        'search_read',
        [
          [['id', 'in', userIds]],
          ['id', 'name', 'login', 'image_128'],
          0, userIds.length,
        ],
      );

      return users.map((u) => ({
        id: String(u.id),
        name: (u.name as string) || '',
        role: 'Team Member',
        email: (u.login as string) || '',
        avatar: undefined, // could build from image_128 if needed
      }));
    } catch (err) {
      this.logger.warn(`Failed to fetch team for project ${projectId}: ${err}`);
      return [];
    }
  }

  /**
   * Get detailed project information for the workspace view.
   */
  async getProjectDetail(
    projectId: number,
    clientEmail: string,
  ): Promise<PortalProjectDetail | null> {
    try {
      const partnerId = await this.resolvePartnerId(clientEmail);
      if (!partnerId) return null;

      // Verify client has access
      const projects = await this.getClientProjects(partnerId);
      const project = projects.find((p) => p.id === projectId);
      if (!project) return null;

      // Get team in parallel
      const team = await this.getProjectTeam(projectId);

      // Compute overall progress from milestones
      const completedMilestones = project.milestones.filter((m) => m.completed).length;
      const totalMilestones = project.milestones.length;
      const progress = totalMilestones > 0
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : 0;

      return {
        id: project.id,
        name: project.name,
        type: project.type,
        status: project.status,
        progress,
        startDate: project.startDate,
        endDate: project.endDate,
        description: undefined,
        team,
        milestones: project.milestones.map((m) => ({
          id: m.id,
          name: m.name,
          date: m.date,
          completed: m.completed,
          description: m.description,
        })),
        budgetSummary: undefined, // Could be enriched from Odoo accounting if needed
      };
    } catch (err) {
      this.logger.warn(`Failed to fetch project detail for ${projectId}: ${err}`);
      return null;
    }
  }

  // --- Document Management (MinIO + Redis) ---

  private documentRedisKey(projectId: string): string {
    return `${PORTAL_DOCUMENTS_PREFIX}:${projectId}`;
  }

  /**
   * Upload a document to MinIO and store metadata in Redis.
   */
  async uploadDocument(
    projectId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    userId: string,
    description?: string,
  ): Promise<PortalDocument> {
    const docId = randomUUID();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${projectId}/${docId}-${safeName}`;

    // Upload to MinIO portal bucket
    await this.minioService.uploadFile(PORTAL_BUCKET, storagePath, file.buffer, {
      'Content-Type': file.mimetype,
    });

    this.logger.log(
      `Uploaded document ${safeName} (${(file.size / 1024).toFixed(1)} KB) to portal/${storagePath}`,
    );

    const doc: PortalDocument = {
      id: docId,
      projectId,
      fileName: `${docId}-${safeName}`,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      storagePath,
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
      description,
    };

    // Store metadata in Redis hash and global index
    await this.redisService.hset(this.documentRedisKey(projectId), docId, doc);
    await this.redisService.hset(DOCUMENTS_INDEX_KEY, docId, projectId);

    return doc;
  }

  /**
   * Get all documents for a project with signed download URLs.
   */
  async getDocuments(projectId: string): Promise<PortalDocument[]> {
    const key = this.documentRedisKey(projectId);
    const docsMap = await this.redisService.hgetall<PortalDocument>(key);

    const docs = Object.values(docsMap);

    // Attach signed URLs
    const enriched = await Promise.all(
      docs.map(async (doc) => {
        try {
          const downloadUrl = await this.minioService.getPresignedDownloadUrl(
            PORTAL_BUCKET,
            doc.storagePath,
            3600,
          );
          return { ...doc, downloadUrl };
        } catch {
          this.logger.warn(`Failed to generate signed URL for ${doc.storagePath}`);
          return { ...doc, downloadUrl: '' };
        }
      }),
    );

    // Sort by upload date descending (newest first)
    enriched.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    );

    return enriched;
  }

  /**
   * Delete a document from MinIO and Redis.
   */
  async deleteDocument(projectId: string, documentId: string): Promise<void> {
    const key = this.documentRedisKey(projectId);

    // Check if document exists in Redis
    const exists = await this.redisService.hexists(key, documentId);
    if (!exists) {
      throw new NotFoundException(`Document ${documentId} not found for project ${projectId}`);
    }

    // Get metadata to find storage path
    const docsMap = await this.redisService.hgetall<PortalDocument>(key);
    const doc = docsMap[documentId];
    if (!doc) {
      throw new NotFoundException(`Document ${documentId} metadata not found`);
    }

    // Delete from MinIO
    try {
      await this.minioService.deleteFile(PORTAL_BUCKET, doc.storagePath);
      this.logger.log(`Deleted file portal/${doc.storagePath} from MinIO`);
    } catch (err) {
      this.logger.warn(`Failed to delete file from MinIO: ${err}`);
      // Continue — still remove the metadata entry
    }

    // Delete metadata from Redis
    await this.redisService.hdel(key, documentId);
    await this.redisService.hdel(DOCUMENTS_INDEX_KEY, documentId);
    this.logger.log(`Deleted document ${documentId} metadata from Redis`);
  }

  // --- Client-scoped Odoo methods ---

  /**
   * Resolve the Odoo partner_id for a given user email.
   * Looks up res.partner by email where x_hexa_client = true.
   */
  async resolvePartnerId(email: string): Promise<number | null> {
    try {
      const partners = await this.odooService.execute<Record<string, unknown>[]>(
        'res.partner',
        'search_read',
        [[['email', '=', email], ['x_hexa_client', '=', true]], ['id'], 0, 1],
      );
      if (partners.length > 0) {
        return partners[0].id as number;
      }
      return null;
    } catch (err) {
      this.logger.warn(`Failed to resolve partner for email ${email}: ${err}`);
      return null;
    }
  }

  /**
   * Get projects visible to the client (partner_id match + portal active).
   */
  async getClientProjects(partnerId: number): Promise<ClientProject[]> {
    try {
      const projects = await this.odooService.execute<Record<string, unknown>[]>(
        'project.project',
        'search_read',
        [
          [['partner_id', '=', partnerId], ['x_hexa_client_portal_active', '=', true]],
          ['id', 'name', 'x_hexa_status', 'x_hexa_type', 'date_start', 'date'],
          0, 50,
          'date_start desc',
        ],
      );

      const result: ClientProject[] = [];
      for (const p of projects) {
        const milestones = await this.getClientMilestones(p.id as number);
        result.push({
          id: p.id as number,
          name: p.name as string,
          status: (p.x_hexa_status as string) || 'active',
          type: (p.x_hexa_type as string) || '',
          startDate: (p.date_start as string) || '',
          endDate: (p.date as string) || '',
          milestones,
        });
      }
      return result;
    } catch (err) {
      this.logger.warn(`Failed to fetch client projects for partner ${partnerId}: ${err}`);
      return [];
    }
  }

  /**
   * Get client-viewable milestones for a project.
   */
  async getClientMilestones(projectId: number): Promise<ClientMilestone[]> {
    try {
      const milestones = await this.odooService.execute<Record<string, unknown>[]>(
        'project.milestone',
        'search_read',
        [
          [['project_id', '=', projectId], ['x_hexa_client_viewable', '=', true]],
          ['id', 'name', 'date', 'completed', 'x_hexa_description', 'x_hexa_order'],
          0, 100,
          'x_hexa_order asc',
        ],
      );
      return milestones.map((m) => ({
        id: m.id as number,
        name: m.name as string,
        date: (m.date as string) || '',
        completed: (m.completed as boolean) || false,
        description: (m.x_hexa_description as string) || '',
      }));
    } catch (err) {
      this.logger.warn(`Failed to fetch milestones for project ${projectId}: ${err}`);
      return [];
    }
  }

  /**
   * Get invoices for the client's partner_id.
   */
  async getClientInvoices(partnerId: number): Promise<ClientInvoice[]> {
    try {
      const invoices = await this.odooService.execute<Record<string, unknown>[]>(
        'account.move',
        'search_read',
        [
          [['move_type', '=', 'out_invoice'], ['partner_id', '=', partnerId]],
          ['id', 'name', 'invoice_date', 'amount_total', 'amount_residual', 'payment_state', 'state'],
          0, 50,
          'invoice_date desc',
        ],
      );
      return invoices.map((inv) => ({
        id: inv.id as number,
        name: (inv.name as string) || '',
        date: (inv.invoice_date as string) || '',
        amount: (inv.amount_total as number) || 0,
        residual: (inv.amount_residual as number) || 0,
        paymentState: (inv.payment_state as string) || 'not_paid',
        state: (inv.state as string) || 'draft',
      }));
    } catch (err) {
      this.logger.warn(`Failed to fetch invoices for partner ${partnerId}: ${err}`);
      return [];
    }
  }

  /**
   * Generate an executive brief report for a project.
   */
  async getExecutiveBrief(
    projectId: number,
    clientEmail: string,
  ): Promise<ExecutiveBrief> {
    const partnerId = await this.resolvePartnerId(clientEmail);
    if (!partnerId) {
      throw new NotFoundException('Client not found');
    }

    const projects = await this.getClientProjects(partnerId);
    const project = projects.find((p) => p.id === projectId);
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    const detail = await this.getProjectDetail(projectId, clientEmail);
    const invoices = await this.getClientInvoices(partnerId);
    const projectInvoices = invoices.filter(
      (inv) => inv.name?.includes(project.name) || true,
    );

    const totalInvoiced = projectInvoices.reduce(
      (sum, inv) => sum + (inv.amount || 0),
      0,
    );
    const totalRemaining = projectInvoices.reduce(
      (sum, inv) => sum + (inv.residual || 0),
      0,
    );

    return {
      projectName: project.name,
      projectType: project.type || 'N/A',
      status: project.status,
      progress: detail?.progress ?? 0,
      startDate: project.startDate,
      endDate: project.endDate,
      milestones: project.milestones.map((m) => ({
        name: m.name,
        date: m.date,
        completed: m.completed,
      })),
      budgetSummary: {
        total: totalInvoiced + totalRemaining,
        invoiced: totalInvoiced,
        remaining: totalRemaining,
      },
      team: detail?.team ?? [],
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate a contract / change order document.
   */
  async generateContract(
    _clientEmail: string,
    dto: { title: string; impactAmount: string; description: string },
  ): Promise<GeneratedContract> {
    const contractId = `CTR-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const quotationRef = `QUO-${Date.now()}`;

    const agreementText = [
      `# ${dto.title}`,
      '',
      `**Impact:** ${dto.impactAmount}`,
      '',
      dto.description,
      '',
      '---',
      `**Contract ID:** ${contractId}`,
      `**Quotation Reference:** ${quotationRef}`,
      `**Status:** Draft`,
      `**Generated:** ${new Date().toISOString()}`,
      '',
      'This document is a draft change order generated by the HEXA Studio Client Portal.',
      'Please review and sign off in the Approval Center.',
    ].join('\n');

    return {
      contractId,
      quotationRef,
      agreementText,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Persist notification preferences for a portal user.
   */
  async saveNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>,
  ): Promise<void> {
    const key = `${PORTAL_NOTIFICATIONS_PREFIX}:${userId}`;
    const existing = (await this.redisService.get<NotificationPreferences>(key)) || {
      projectUpdates: true,
      phaseApprovals: true,
      newAnnotations: true,
      documentUploads: true,
      milestoneCompletions: true,
    };
    const merged = { ...existing, ...preferences };
    await this.redisService.set(key, merged, 0);
  }

  /**
   * Retrieve notification preferences for a portal user.
   */
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    const key = `${PORTAL_NOTIFICATIONS_PREFIX}:${userId}`;
    return (
      (await this.redisService.get<NotificationPreferences>(key)) || {
        projectUpdates: true,
        phaseApprovals: true,
        newAnnotations: true,
        documentUploads: true,
        milestoneCompletions: true,
      }
    );
  }
}
