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
} from '@nestjs/swagger';
import { PortalService } from './portal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Portal')
@Controller({ path: 'portal', version: ['1', VERSION_NEUTRAL] })
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyPortalData() {
    return this.portalService.getClientProjectData();
  }

  @Get('demo')
  async getDemoPortalData() {
    return this.portalService.getClientProjectData();
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
}
