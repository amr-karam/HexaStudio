import { Controller, Get, Query, Post, Patch, Delete, Param, Body, UploadedFile, UseInterceptors, UseGuards, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, VERSION_NEUTRAL } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { OdooApiService } from './odoo-api.service';
import { OdooSyncService } from './odoo-sync.service';
import { OdooDocumentService } from './odoo-document.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Odoo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller({ path: 'odoo', version: ['1', VERSION_NEUTRAL] })
export class OdooApiController {
  constructor(
    private readonly odooApi: OdooApiService,
    private readonly odooSync: OdooSyncService,
    private readonly odooDocument: OdooDocumentService,
  ) {}

  // --- CRM Pipeline & Leads ---

  @Get('crm/pipeline')
  @ApiOperation({ summary: 'Get CRM pipeline summary by stage' })
  async getPipeline() {
    return this.odooApi.getCrmPipeline();
  }

  @Get('crm/leads')
  @ApiOperation({ summary: 'List CRM leads' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getLeads(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.odooApi.getLeads(limit ? parseInt(limit, 10) : 50, offset ? parseInt(offset, 10) : 0);
  }

  @Get('crm/leads/:id')
  @ApiOperation({ summary: 'Get lead detail' })
  @ApiParam({ name: 'id', type: Number })
  async getLeadDetail(@Param('id') id: string) {
    return this.odooApi.getLeadDetail(parseInt(id, 10));
  }

  @Post('crm/leads')
  @ApiOperation({ summary: 'Create a new CRM lead' })
  async createLead(@Body() data: Record<string, unknown>) {
    const id = await this.odooApi.createLead(data);
    return { id, success: true };
  }

  @Patch('crm/leads/:id')
  @ApiOperation({ summary: 'Update a CRM lead' })
  @ApiParam({ name: 'id', type: Number })
  async updateLead(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    await this.odooApi.updateLead(parseInt(id, 10), data);
    return { success: true };
  }

  @Delete('crm/leads/:id')
  @ApiOperation({ summary: 'Archive a CRM lead' })
  @ApiParam({ name: 'id', type: Number })
  async archiveLead(@Param('id') id: string) {
    await this.odooApi.archiveLead(parseInt(id, 10));
    return { success: true };
  }

  // --- Contacts / Partners ---

  @Get('contacts')
  @ApiOperation({ summary: 'List contacts/partners' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getContacts(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('search') search?: string,
  ) {
    return this.odooApi.getContacts(limit ? parseInt(limit, 10) : 50, offset ? parseInt(offset, 10) : 0, search);
  }

  @Get('contacts/:id')
  @ApiOperation({ summary: 'Get contact detail' })
  @ApiParam({ name: 'id', type: Number })
  async getContactDetail(@Param('id') id: string) {
    return this.odooApi.getContactDetail(parseInt(id, 10));
  }

  @Post('contacts')
  @ApiOperation({ summary: 'Create a new contact/partner' })
  async createContact(@Body() data: Record<string, unknown>) {
    const id = await this.odooApi.createPartner(data);
    return { id, success: true };
  }

  @Patch('contacts/:id')
  @ApiOperation({ summary: 'Update a contact/partner' })
  @ApiParam({ name: 'id', type: Number })
  async updateContact(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    await this.odooApi.updatePartner(parseInt(id, 10), data);
    return { success: true };
  }

  // --- Projects ---

  @Get('projects')
  @ApiOperation({ summary: 'List Odoo projects' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getProjects(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.odooApi.getProjects(limit ? parseInt(limit, 10) : 50, offset ? parseInt(offset, 10) : 0);
  }

  @Get('projects/:id')
  @ApiOperation({ summary: 'Get project detail' })
  @ApiParam({ name: 'id', type: Number })
  async getProjectDetail(@Param('id') id: string) {
    return this.odooApi.getProjectDetail(parseInt(id, 10));
  }

  @Patch('projects/:id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiParam({ name: 'id', type: Number })
  async updateProject(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    await this.odooApi.updateProject(parseInt(id, 10), data);
    return { success: true };
  }

  @Get('projects/:id/milestones')
  @ApiOperation({ summary: 'Get project milestones' })
  @ApiParam({ name: 'id', type: Number })
  async getProjectMilestones(@Param('id') id: string) {
    return this.odooApi.getProjectMilestones(parseInt(id, 10));
  }

  @Post('projects/:id/milestones')
  @ApiOperation({ summary: 'Add a milestone to a project' })
  @ApiParam({ name: 'id', type: Number })
  async createMilestone(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    const milestoneId = await this.odooApi.createMilestone(parseInt(id, 10), data);
    return { id: milestoneId, success: true };
  }

  @Patch('milestones/:id')
  @ApiOperation({ summary: 'Update a milestone' })
  @ApiParam({ name: 'id', type: Number })
  async updateMilestone(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    await this.odooApi.updateMilestone(parseInt(id, 10), data);
    return { success: true };
  }

  // --- Sales & Invoices ---

  @Get('sales/orders')
  @ApiOperation({ summary: 'List Odoo sales orders' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getSalesOrders(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.odooApi.getSalesOrders(limit ? parseInt(limit, 10) : 50, offset ? parseInt(offset, 10) : 0);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'List Odoo customer invoices' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getInvoices(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.odooApi.getInvoices(limit ? parseInt(limit, 10) : 50, offset ? parseInt(offset, 10) : 0);
  }

  // --- Sync & Health ---

  @Get('sync/state')
  @ApiOperation({ summary: 'Get Odoo sync state' })
  async getSyncState() {
    return this.odooSync.getState();
  }

  @Post('sync/trigger')
  @ApiOperation({ summary: 'Trigger a manual Odoo pull' })
  async triggerSync() {
    await this.odooSync.pullAll();
    return { success: true };
  }

  @Get('health')
  @ApiOperation({ summary: 'Check Odoo connection health' })
  async getHealth() {
    return this.odooApi.getHealth();
  }

  // --- Company Settings ---

  @Get('company/settings')
  @ApiOperation({ summary: 'Get Odoo company settings' })
  @ApiQuery({ name: 'companyId', required: false, type: Number })
  async getCompanySettings(@Query('companyId') companyId?: string) {
    return this.odooApi.getCompanySettings(companyId ? parseInt(companyId, 10) : undefined);
  }

  // --- Documents (MinIO <-> Odoo bridge) ---

  @Post('documents/:projectId')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file and link it to an Odoo project' })
  @ApiParam({ name: 'projectId', type: Number })
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
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
  ) {
    return this.odooDocument.uploadAndLink(file, parseInt(projectId, 10));
  }

  @Get('documents/:projectId')
  @ApiOperation({ summary: 'List documents linked to an Odoo project' })
  @ApiParam({ name: 'projectId', type: Number })
  async getProjectDocuments(@Param('projectId') projectId: string) {
    return this.odooDocument.getProjectDocuments(parseInt(projectId, 10));
  }

  @Get('documents/download/:id')
  @ApiOperation({ summary: 'Get signed download URL for a document' })
  @ApiParam({ name: 'id', type: String })
  async getDocumentDownloadUrl(@Param('id') id: string) {
    const url = await this.odooDocument.getSignedUrl(id);
    return { url };
  }

  @Delete('documents/:projectId/:id')
  @ApiOperation({ summary: 'Delete a document linked to an Odoo project' })
  @ApiParam({ name: 'projectId', type: Number })
  @ApiParam({ name: 'id', type: String })
  async deleteDocument(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ) {
    await this.odooDocument.deleteDocument(parseInt(projectId, 10), id);
    return { success: true };
  }
}
