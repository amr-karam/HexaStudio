import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { MinioService } from '../storage/minio.service';
import { OdooApiService } from '../odoo/odoo-api.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { UploadDto } from './dto/upload.dto';
import { UploadResponseDto } from './dto/upload-response.dto';
import { UploadMetadata } from './interfaces/upload-metadata.interface';
import { extname } from 'path';

const MIME_MAP: Record<string, string> = {
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.bin': 'application/octet-stream',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.hdr': 'application/octet-stream',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.blend': 'application/octet-stream',
};

@Injectable()
export class MinioUploadService {
  private readonly logger = new Logger(MinioUploadService.name);
  private readonly BUCKET = 'uploads';
  private readonly EXPIRY_SECONDS = 3600; // 1 hour
  private readonly MINIO_PREFIX = '/hexastudio/projects';

  constructor(
    private readonly minioService: MinioService,
    private readonly odooApi: OdooApiService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async generateUploadUrl(
    projectId: number,
    dto: UploadDto,
  ): Promise<UploadResponseDto> {
    const filename = dto.filename.trim();
    if (!filename) {
      throw new BadRequestException('Filename is required');
    }

    // Build MinIO object key
    const key = this.buildObjectKey(projectId, filename);

    // Determine mimetype from extension
    const ext = extname(filename).toLowerCase();
    const mimetype = MIME_MAP[ext] || 'application/octet-stream';

    // Generate presigned PUT URL
    const uploadUrl = await this.minioService.getPresignedUploadUrl(
      this.BUCKET,
      key,
      this.EXPIRY_SECONDS,
    );

    // Build Odoo metadata for ir.attachment
    const now = new Date().toISOString();
    const odooAttachmentData: Record<string, unknown> = {
      name: filename,
      datas: '',                // empty — file goes to MinIO directly
      type: 'binary',
      res_model: dto.taskId ? 'project.task' : 'project.project',
      res_id: dto.taskId ?? projectId,
      mimetype,
      description: dto.description ?? '',
      create_date: now,
      create_uid: 1,            // default admin user — adjust per auth context
    };

    let odooAttachmentId: number | null = null;

    try {
      // Create ir.attachment record in Odoo
      odooAttachmentId = await this.odooApi.connect().then(async (client) => {
        const result = await client.execute_kw<number>(
          'ir.attachment',
          'create',
          [odooAttachmentData],
        );
        return result;
      });

      this.logger.log(
        `Created ir.attachment ${odooAttachmentId} for project ${projectId}, file ${filename}`,
      );

      // If taskId provided, update task's hexa_last_upload
      if (dto.taskId) {
        await this.odooApi.connect().then(async (client) => {
          await client.execute_kw(
            'project.task',
            'write',
            [[dto.taskId], { hexa_last_upload: now }],
          );
        });
        this.logger.log(`Updated task ${dto.taskId} hexa_last_upload = ${now}`);
      }

      // Update project's hexa_last_deliverable_at
      await this.odooApi.connect().then(async (client) => {
        await client.execute_kw(
          'project.project',
          'write',
          [[projectId], { hexa_last_deliverable_at: now }],
        );
      });
      this.logger.log(`Updated project ${projectId} hexa_last_deliverable_at = ${now}`);

    } catch (error) {
      this.logger.error(
        `Failed to write metadata to Odoo for project ${projectId}: ${(error as Error).message}`,
      );
      // Don't fail the upload — the presigned URL is still valid
    }

    // Build response metadata
    const metadata: UploadMetadata = {
      id: odooAttachmentId ?? 0,
      projectId,
      taskId: dto.taskId ?? null,
      filename,
      key,
      mimetype,
      description: dto.description ?? '',
      uploadedBy: 'System',      // TODO: resolve from JWT context
      timestamp: now,
      bucket: this.BUCKET,
    };

    // Emit Socket.io events
    this.realtimeGateway.emitToRoom(
      `project:${projectId}`,
      'project:uploading',
      { projectId, filename, timestamp: now },
    );

    this.realtimeGateway.emitToRoom(
      `project:${projectId}`,
      'project:uploaded',
      {
        projectId,
        filename,
        user: metadata.uploadedBy,
        timestamp: now,
        description: dto.description ?? '',
        taskId: dto.taskId ?? null,
      },
    );

    return {
      uploadUrl,
      key,
      expiresIn: this.EXPIRY_SECONDS,
      metadata,
    };
  }

  private buildObjectKey(projectId: number, filename: string): string {
    return `${this.MINIO_PREFIX}/${projectId}/deliverables/${filename}`;
  }
}
