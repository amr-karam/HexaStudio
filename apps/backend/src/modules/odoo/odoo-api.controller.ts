import { Controller, Get, Query, Post, Patch, Delete, Param, Body, UploadedFile, UseInterceptors, UseGuards, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, VERSION_NEUTRAL } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { OdooApiService } from './odoo-api.service';
import { OdooDocumentService } from './odoo-document.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@ApiTags('Odoo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller({ path: 'odoo', version: ['1', VERSION_NEUTRAL] })
export class OdooApiController {
  constructor(
    private readonly odooApi: OdooApiService,
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
  async createLead(@Body() data: CreateLeadDto) {
    const id = await this.odooApi.createLead(data as unknown as Record<string, unknown>);
    return { id, success: true };
  }

  @Patch('crm/leads/:id')
  @ApiOperation({ summary: 'Update a CRM lead' })
  @ApiParam({ name: 'id', type: Number })
  async updateLead(@Param('id') id: string, @Body() data: UpdateLeadDto) {
    await this.odooApi.updateLead(parseInt(id, 10), data as unknown as Record<string, unknown>);
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
  async createContact(@Body() data: CreateContactDto) {
    const id = await this.odooApi.createPartner(data as unknown as Record<string, unknown>);
    return { id, success: true };
  }

  @Patch('contacts/:id')
  @ApiOperation({ summary: 'Update a contact/partner' })
  @ApiParam({ name: 'id', type: Number })
  async updateContact(@Param('id') id: string, @Body() data: UpdateContactDto) {
    await this.odooApi.updatePartner(parseInt(id, 10), data as unknown as Record<string, unknown>);
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

  // --- Health ---

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

  // --- Tasks ---

  @Get('tasks')
  @ApiOperation({ summary: 'List project tasks' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'projectId', required: false, type: Number })
  async getTasks(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.odooApi.getTasks(
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Get('tasks/:id')
  @ApiOperation({ summary: 'Get task detail' })
  @ApiParam({ name: 'id', type: Number })
  async getTaskDetail(@Param('id') id: string) {
    return this.odooApi.getTaskDetail(parseInt(id, 10));
  }

  @Post('tasks')
  @ApiOperation({ summary: 'Create a new project task' })
  async createTask(@Body() data: Record<string, unknown>) {
    const id = await this.odooApi.createTask(data);
    return { id, success: true };
  }

  @Patch('tasks/:id')
  @ApiOperation({ summary: 'Update a project task' })
  @ApiParam({ name: 'id', type: Number })
  async updateTask(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    await this.odooApi.updateTask(parseInt(id, 10), data);
    return { success: true };
  }

  // --- Quotations ---

  @Get('quotations')
  @ApiOperation({ summary: 'List sales quotations' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'state', required: false, type: String, description: 'Filter by state: draft, sent, sale, done, cancel' })
  async getQuotations(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('state') state?: string,
  ) {
    return this.odooApi.getQuotations(
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
      state,
    );
  }

  @Get('quotations/:id')
  @ApiOperation({ summary: 'Get quotation detail' })
  @ApiParam({ name: 'id', type: Number })
  async getQuotationDetail(@Param('id') id: string) {
    return this.odooApi.getQuotationDetail(parseInt(id, 10));
  }

  @Get('quotations/:id/lines')
  @ApiOperation({ summary: 'Get quotation line items' })
  @ApiParam({ name: 'id', type: Number })
  async getQuotationLines(@Param('id') id: string) {
    return this.odooApi.getQuotationLines(parseInt(id, 10));
  }

  @Post('quotations')
  @ApiOperation({ summary: 'Create a new quotation' })
  async createQuotation(@Body() data: Record<string, unknown>) {
    const id = await this.odooApi.createQuotation(data);
    return { id, success: true };
  }

  @Patch('quotations/:id')
  @ApiOperation({ summary: 'Update a quotation' })
  @ApiParam({ name: 'id', type: Number })
  async updateQuotation(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    await this.odooApi.updateQuotation(parseInt(id, 10), data);
    return { success: true };
  }

  // --- Activities ---

  @Get('activities')
  @ApiOperation({ summary: 'List activities (mail.activity)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'resModel', required: false, type: String, description: 'Filter by resource model (e.g., project.project, crm.lead)' })
  @ApiQuery({ name: 'resId', required: false, type: Number, description: 'Filter by resource ID' })
  async getActivities(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('resModel') resModel?: string,
    @Query('resId') resId?: string,
  ) {
    return this.odooApi.getActivities(
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
      resModel,
      resId ? parseInt(resId, 10) : undefined,
    );
  }

  @Post('activities')
  @ApiOperation({ summary: 'Create a new activity' })
  async createActivity(@Body() data: Record<string, unknown>) {
    const id = await this.odooApi.createActivity(data);
    return { id, success: true };
  }

  @Patch('activities/:id')
  @ApiOperation({ summary: 'Update an activity' })
  @ApiParam({ name: 'id', type: Number })
  async updateActivity(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    await this.odooApi.updateActivity(parseInt(id, 10), data);
    return { success: true };
  }

  @Post('activities/:id/complete')
  @ApiOperation({ summary: 'Mark an activity as completed' })
  @ApiParam({ name: 'id', type: Number })
  async completeActivity(@Param('id') id: string) {
    await this.odooApi.completeActivity(parseInt(id, 10));
    return { success: true };
  }

  // --- Helpdesk Tickets ---

  @Get('helpdesk/tickets')
  @ApiOperation({ summary: 'List Helpdesk tickets' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getHelpdeskTickets(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.odooApi.getHelpdeskTickets(limit ? parseInt(limit, 10) : 50, offset ? parseInt(offset, 10) : 0);
  }

  @Get('helpdesk/tickets/:id')
  @ApiOperation({ summary: 'Get Helpdesk ticket detail' })
  @ApiParam({ name: 'id', type: Number })
  async getHelpdeskTicketDetail(@Param('id') id: string) {
    return this.odooApi.getHelpdeskTicketDetail(parseInt(id, 10));
  }

  @Post('helpdesk/tickets')
  @ApiOperation({ summary: 'Create a Helpdesk ticket' })
  async createHelpdeskTicket(@Body() data: Record<string, unknown>) {
    const id = await this.odooApi.createHelpdeskTicket(data);
    return { id, success: true };
  }

  @Patch('helpdesk/tickets/:id')
  @ApiOperation({ summary: 'Update a Helpdesk ticket' })
  @ApiParam({ name: 'id', type: Number })
  async updateHelpdeskTicket(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    await this.odooApi.updateHelpdeskTicket(parseInt(id, 10), data);
    return { success: true };
  }

  // --- Helpdesk Teams ---

  @Get('helpdesk/teams')
  @ApiOperation({ summary: 'List all Helpdesk / Support teams' })
  async getHelpdeskTeams() {
    return this.odooApi.getHelpdeskTeams();
  }

  @Get('helpdesk/teams/:id')
  @ApiOperation({ summary: 'Get Helpdesk team detail with recent tickets' })
  @ApiParam({ name: 'id', type: Number })
  async getHelpdeskTeamDetail(@Param('id') id: string) {
    return this.odooApi.getHelpdeskTeamDetail(parseInt(id, 10));
  }

  // --- Employees / HR ---

  @Get('employees')
  @ApiOperation({ summary: 'List employees (hr.employee)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getEmployees(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.odooApi.getEmployees(limit ? parseInt(limit, 10) : 50, offset ? parseInt(offset, 10) : 0);
  }

  @Get('employees/:id')
  @ApiOperation({ summary: 'Get employee detail' })
  @ApiParam({ name: 'id', type: Number })
  async getEmployeeDetail(@Param('id') id: string) {
    return this.odooApi.getEmployeeDetail(parseInt(id, 10));
  }

  // --- Timesheets ---

  @Get('timesheets')
  @ApiOperation({ summary: 'List project timesheets (account.analytic.line)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'projectId', required: false, type: Number })
  async getTimesheets(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.odooApi.getTimesheets(
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Post('timesheets')
  @ApiOperation({ summary: 'Create a timesheet entry' })
  async createTimesheet(@Body() data: Record<string, unknown>) {
    const id = await this.odooApi.createTimesheet(data);
    return { id, success: true };
  }

  // --- Knowledge Articles ---

  @Get('knowledge/articles')
  @ApiOperation({ summary: 'List knowledge articles (knowledge.article)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getKnowledgeArticles(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.odooApi.getKnowledgeArticles(limit ? parseInt(limit, 10) : 50, offset ? parseInt(offset, 10) : 0);
  }

  @Get('knowledge/articles/:id')
  @ApiOperation({ summary: 'Get knowledge article detail' })
  @ApiParam({ name: 'id', type: Number })
  async getKnowledgeArticleDetail(@Param('id') id: string) {
    return this.odooApi.getKnowledgeArticleDetail(parseInt(id, 10));
  }

  @Get('knowledge/categories')
  @ApiOperation({ summary: 'List knowledge categories with article counts' })
  async getKnowledgeCategories() {
    return this.odooApi.getKnowledgeCategories();
  }

  // --- Calendar Events ---

  @Get('calendar/events')
  @ApiOperation({ summary: 'List calendar events (calendar.event)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getCalendarEvents(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.odooApi.getCalendarEvents(limit ? parseInt(limit, 10) : 50, offset ? parseInt(offset, 10) : 0);
  }

  @Post('calendar/events')
  @ApiOperation({ summary: 'Create a calendar event' })
  async createCalendarEvent(@Body() data: Record<string, unknown>) {
    const id = await this.odooApi.createCalendarEvent(data);
    return { id, success: true };
  }

  // --- Mail Messages ---

  @Get('messages')
  @ApiOperation({ summary: 'List mail messages (mail.message)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'resModel', required: false, type: String })
  @ApiQuery({ name: 'resId', required: false, type: Number })
  async getMailMessages(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('resModel') resModel?: string,
    @Query('resId') resId?: string,
  ) {
    return this.odooApi.getMailMessages(
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
      resModel,
      resId ? parseInt(resId, 10) : undefined,
    );
  }

  @Post('messages')
  @ApiOperation({ summary: 'Post a mail message' })
  async postMailMessage(@Body() data: Record<string, unknown>) {
    const id = await this.odooApi.postMailMessage(data);
    return { id, success: true };
  }

  // --- Sales Teams (crm.team) ---

  @Get('sales-teams')
  @ApiOperation({ summary: 'List sales teams with members and pipeline summary' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter teams by user membership' })
  async getSalesTeams(@Query('userId') userId?: string) {
    return this.odooApi.getSalesTeams(userId);
  }

  @Get('sales-teams/:id')
  @ApiOperation({ summary: 'Get detailed sales team view with recent activity' })
  @ApiParam({ name: 'id', type: Number })
  async getSalesTeamDetails(@Param('id') id: string) {
    return this.odooApi.getSalesTeamDetails(parseInt(id, 10));
  }

  // --- HR Departments (hr.department) ---

  @Get('departments')
  @ApiOperation({ summary: 'List all HR departments with employee counts' })
  async getDepartments() {
    return this.odooApi.getDepartments();
  }

  @Get('departments/:id')
  @ApiOperation({ summary: 'Get department details with employee roster' })
  @ApiParam({ name: 'id', type: Number })
  async getDepartmentDetails(@Param('id') id: string) {
    return this.odooApi.getDepartmentDetails(parseInt(id, 10));
  }

  // --- Finance / Accounting (Read-Only) ---

  @Get('accounting/journal-entries')
  @ApiOperation({ summary: 'Fetch journal entries with optional date range' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getAccountJournalEntries(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.odooApi.getAccountJournalEntries(
      dateFrom,
      dateTo,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('accounting/payments')
  @ApiOperation({ summary: 'Fetch payments (customer/vendor) with optional date range' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getAccountPayments(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.odooApi.getAccountPayments(
      dateFrom,
      dateTo,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('accounting/invoices')
  @ApiOperation({ summary: 'List invoices (customer/vendor) with optional status filter' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by state: draft, posted, cancelled' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getAccountInvoices(
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.odooApi.getAccountInvoices(
      status,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('accounting/invoices/:id/lines')
  @ApiOperation({ summary: 'List invoice line items for a specific invoice' })
  @ApiParam({ name: 'id', type: Number })
  async getInvoiceLines(@Param('id') id: string) {
    return this.odooApi.getInvoiceLines(parseInt(id, 10));
  }

  @Get('accounting/banks')
  @ApiOperation({ summary: 'List bank accounts with balances' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getAccountBanks(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.odooApi.getAccountBanks(
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('accounting/journals')
  @ApiOperation({ summary: 'List accounting journals' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getAccountJournals(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.odooApi.getAccountJournals(
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('accounting/bank-statements')
  @ApiOperation({ summary: 'List bank statements' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getBankStatements(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.odooApi.getBankStatements(
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  // --- Knowledge Write Operations (knowledge.article) ---

  @Post('knowledge')
  @ApiOperation({ summary: 'Create a new knowledge article' })
  async createKnowledgeArticle(@Body() data: { name: string; body?: string; category_id?: number }) {
    const id = await this.odooApi.createKnowledgeArticle(data);
    return { id, success: true };
  }

  @Patch('knowledge/:id')
  @ApiOperation({ summary: 'Update a knowledge article' })
  @ApiParam({ name: 'id', type: Number })
  async updateKnowledgeArticle(
    @Param('id') id: string,
    @Body() data: { name?: string; body?: string; category_id?: number },
  ) {
    await this.odooApi.updateKnowledgeArticle(parseInt(id, 10), data);
    return { success: true };
  }

  @Delete('knowledge/:id')
  @ApiOperation({ summary: 'Archive (soft-delete) a knowledge article' })
  @ApiParam({ name: 'id', type: Number })
  async deleteKnowledgeArticle(@Param('id') id: string) {
    await this.odooApi.deleteKnowledgeArticle(parseInt(id, 10));
    return { success: true };
  }

  // --- Email Integration (mail.mail) ---

  @Get('emails')
  @ApiOperation({ summary: 'List emails with optional filter' })
  @ApiQuery({ name: 'filter', required: false, type: String, description: 'Filter: inbox, sent, or all (default: all)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getEmails(
    @Query('filter') filter?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.odooApi.getEmails(
      (filter as 'inbox' | 'sent' | 'all') ?? 'all',
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('emails/:id')
  @ApiOperation({ summary: 'Get email details with full body' })
  @ApiParam({ name: 'id', type: Number })
  async getEmailDetails(@Param('id') id: string) {
    return this.odooApi.getEmailDetails(parseInt(id, 10));
  }

  @Post('emails')
  @ApiOperation({ summary: 'Send an email via Odoo mail system' })
  async sendEmail(@Body() data: { to: string; subject: string; body: string; partnerIds?: number[] }) {
    const id = await this.odooApi.sendEmail(data);
    return { id, success: true };
  }

  // --- Notifications ---

  @Get('notifications')
  @ApiOperation({ summary: 'List mail notifications for partners' })
  @ApiQuery({ name: 'partnerId', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getMailNotifications(
    @Query('partnerId') partnerId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.odooApi.getMailNotifications(
      partnerId ? parseInt(partnerId, 10) : undefined,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  // --- Executive Hub Dashboard Aggregator ---

  @Get('dashboard/executive')
  @ApiOperation({ summary: 'Get Executive Hub Dashboard metrics (aggregated cross-module SOT payload)' })
  async getExecutiveDashboard() {
    return this.odooApi.getExecutiveDashboard();
  }
}
