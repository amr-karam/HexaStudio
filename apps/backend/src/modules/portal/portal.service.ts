import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { OdooService } from '../odoo/odoo.service';
import { MinioService } from '../storage/minio.service';
import { RedisService } from '../storage/redis.service';

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
