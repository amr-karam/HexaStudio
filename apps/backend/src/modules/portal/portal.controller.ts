import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  VERSION_NEUTRAL } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { PortalService } from './portal.service';
import { PortalCopilotService } from './portal-copilot.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { PortalDashboardData, PortalTask, PortalTeamMember, PortalProjectDetail } from './portal-dashboard.types';

/**
 * DTO for the multimodal copilot query endpoint.
 */
class MultimodalQueryDto {
  /** The text query from the user */
  query!: string;
  /** Optional project name context (default: 'Horizon Villa') */
  projectName?: string;
  /** Base64-encoded image data for vision analysis */
  imageData?: string;
  /** MIME type of the image (required if imageData is provided) */
  mimeType?: string;
  /** Base64-encoded audio data for speech-to-text transcription */
  audioData?: string;
  /** MIME type of the audio (required if audioData is provided, e.g. 'audio/webm', 'audio/wav') */
  audioMimeType?: string;
}

@ApiTags('Portal')
@Controller({ path: 'portal', version: ['1', VERSION_NEUTRAL] })
export class PortalController {
  constructor(
    private readonly portalService: PortalService,
    private readonly portalCopilot: PortalCopilotService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyPortalData() {
    return this.portalService.getClientProjectData();
  }

  // --- Dashboard Aggregation ---

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get aggregated dashboard data',
    description:
      'Returns project health, KPIs, recent activity, upcoming milestones, pending approvals, and notification summary for the authenticated client.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data returned successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized – invalid or missing JWT.' })
  async getDashboard(@Req() req: { user: { email: string } }): Promise<PortalDashboardData> {
    return this.portalService.getDashboardData(req.user.email);
  }

  // --- Client-scoped Odoo endpoints ---

  @Get('odoo/projects')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get Odoo projects visible to the authenticated client' })
  async getClientProjects(@Req() req: { user: { email: string } }) {
    const partnerId = await this.portalService.resolvePartnerId(req.user.email);
    if (!partnerId) return [];
    return this.portalService.getClientProjects(partnerId);
  }

  @Get('odoo/projects/:id/milestones')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get client-viewable milestones for a project' })
  async getClientMilestones(@Req() req: { user: { email: string } }, @Param('id') id: string) {
    const partnerId = await this.portalService.resolvePartnerId(req.user.email);
    if (!partnerId) return [];
    // Verify project belongs to this client before returning milestones
    const projects = await this.portalService.getClientProjects(partnerId);
    const project = projects.find((p) => p.id === parseInt(id, 10));
    if (!project) return [];
    return project.milestones;
  }

  @Get('odoo/invoices')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get Odoo invoices for the authenticated client' })
  async getClientInvoices(@Req() req: { user: { email: string } }) {
    const partnerId = await this.portalService.resolvePartnerId(req.user.email);
    if (!partnerId) return [];
    return this.portalService.getClientInvoices(partnerId);
  }

  // --- Workspace & Kanban ---

  @Get('projects/:projectId/detail')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get detailed project information for the workspace',
    description: 'Returns project metadata, team members, milestones, and progress for the authenticated client.',
  })
  @ApiResponse({ status: 200, description: 'Project detail returned successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized – invalid or missing JWT.' })
  async getProjectDetail(
    @Param('projectId') projectId: string,
    @Req() req: { user: { email: string } },
  ): Promise<PortalProjectDetail | null> {
    return this.portalService.getProjectDetail(parseInt(projectId, 10), req.user.email);
  }

  @Get('projects/:projectId/tasks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Kanban tasks for a project',
    description: 'Returns client-visible tasks mapped to Kanban status columns (Todo, In Progress, Review, Done).',
  })
  @ApiResponse({ status: 200, description: 'Tasks returned successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized – invalid or missing JWT.' })
  async getProjectTasks(@Param('projectId') projectId: string): Promise<PortalTask[]> {
    return this.portalService.getProjectTasks(parseInt(projectId, 10));
  }

  @Get('projects/:projectId/team')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get team members assigned to a project',
    description: 'Returns HEXA Studio team members working on the project.',
  })
  @ApiResponse({ status: 200, description: 'Team members returned successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized – invalid or missing JWT.' })
  async getProjectTeam(@Param('projectId') projectId: string): Promise<PortalTeamMember[]> {
    return this.portalService.getProjectTeam(parseInt(projectId, 10));
  }

  // --- Document Endpoints ---

  @Post('projects/:projectId/documents')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a document to a portal project' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (PDF, images, Word, Excel, ZIP; max 50MB)',
        },
        description: {
          type: 'string',
          description: 'Optional description of the document',
        },
      },
    },
  })
  async uploadDocument(
    @Param('projectId') projectId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType:
              '(pdf|png|jpeg|jpg|gif|webp|svg\\+xml|msword|openxmlformats-officedocument|ms-excel|spreadsheetml|zip)',
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Req() req: { user: { email: string } },
    @Body('description') description?: string,
  ) {
    return this.portalService.uploadDocument(
      projectId,
      file,
      req.user.email,
      description,
    );
  }

  @Get('projects/:projectId/documents')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all documents for a portal project' })
  async getDocuments(@Param('projectId') projectId: string) {
    return this.portalService.getDocuments(projectId);
  }

  @Delete('projects/:projectId/documents/:documentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a document from a portal project' })
  async deleteDocument(
    @Param('projectId') projectId: string,
    @Param('documentId') documentId: string,
  ) {
    await this.portalService.deleteDocument(projectId, documentId);
    return { message: 'Document deleted successfully' };
  }

  @Put('notifications/preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update notification preferences for the authenticated user' })
  async updateNotificationPreferences(
    @Req() req: { user: { id: string } },
    @Body('preferences') preferences: Record<string, boolean>,
    @Body('userId') userId?: string,
  ) {
    const targetUserId = userId || req.user.id;
    await this.portalService.saveNotificationPreferences(targetUserId, preferences);
    return { message: 'Notification preferences saved' };
  }

  @Get('notifications/preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get notification preferences for the authenticated user' })
  async getNotificationPreferences(@Req() req: { user: { id: string } }) {
    return this.portalService.getNotificationPreferences(req.user.id);
  }

  // --- Copilot Endpoints ---

  /**
   * Standard text-only copilot query.
   */
  @Post('copilot/query')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Query the HEXA Portal AI Copilot for project context' })
  @ApiResponse({ status: 200, description: 'Copilot response returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized – invalid or missing JWT.' })
  async copilotQuery(
    @Body('query') query: string,
    @Body('projectName') projectName?: string,
  ) {
    return this.portalCopilot.processClientQuery(query, projectName);
  }

  /**
   * Multimodal copilot query supporting image analysis and/or audio transcription.
   *
   * Accepts:
   *   - `imageData` (base64) + `mimeType` for vision-based context
   *   - `audioData` (base64) + `audioMimeType` for speech-to-text transcription
   *   - Both, or neither (falls back to text-only query)
   *
   * Returns:
   *   - `reply`: AI-generated response referencing any provided media
   *   - `tags`: (optional) Array of vision-derived tags when imageData is provided
   */
  @Post('copilot/multimodal-query')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Query the HEXA Portal AI Copilot with multimodal support (image + voice)',
    description: `Processes a query that may include image data (base64 + mimeType) for vision analysis 
and/or audio data (base64 + audioMimeType) for speech-to-text transcription. 
Returns an enriched response that references what was seen/heard, along with extracted tags.`,
  })
  @ApiResponse({ status: 200, description: 'Multimodal copilot response returned with optional tags.' })
  @ApiResponse({ status: 400, description: 'Invalid request: missing required fields.' })
  @ApiResponse({ status: 401, description: 'Unauthorized – invalid or missing JWT.' })
  @ApiBody({ type: MultimodalQueryDto })
  async copilotMultimodalQuery(
    @Body() dto: MultimodalQueryDto,
  ): Promise<{ reply: string; tags?: Array<{ tag: string; confidence: number; category: string }> }> {
    if (!dto.query) {
      return { reply: 'Please provide a query to process.' };
    }

    return this.portalCopilot.processMultimodalQuery(
      dto.query,
      dto.projectName ?? 'Horizon Villa',
      dto.imageData,
      dto.mimeType,
      dto.audioData,
      dto.audioMimeType,
    );
  }
}
