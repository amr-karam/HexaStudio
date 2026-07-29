import {
  Controller, Get, Post, Query, Body, UseGuards, VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TimesheetsService } from './timesheets.service';

@ApiTags('Timesheets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'odoo/timesheets', version: ['1', VERSION_NEUTRAL] })
export class TimesheetsController {
  constructor(private readonly timesheetsService: TimesheetsService) {}

  @Get()
  @ApiOperation({ summary: 'List timesheet entries with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20, max: 100)' })
  @ApiQuery({ name: 'employeeId', required: false, type: Number, description: 'Filter by employee ID' })
  @ApiQuery({ name: 'projectId', required: false, type: Number, description: 'Filter by project ID' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, description: 'Filter entries from date (ISO format)' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, description: 'Filter entries up to date (ISO format)' })
  @ApiResponse({ status: 200, description: 'Paginated list of timesheet entries' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTimesheets(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('employeeId') employeeId?: string,
    @Query('projectId') projectId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.timesheetsService.getTimesheets({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      employeeId: employeeId ? parseInt(employeeId, 10) : undefined,
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      dateFrom,
      dateTo,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new timesheet entry' })
  @ApiBody({ description: 'Timesheet entry data', type: Object })
  @ApiResponse({ status: 201, description: 'Timesheet entry created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createTimesheet(@Body() data: Record<string, unknown>) {
    const id = await this.timesheetsService.createTimesheet(data);
    return { id, success: true };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get aggregated timesheet statistics' })
  @ApiResponse({ status: 200, description: 'Timesheet statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStats() {
    return this.timesheetsService.getStats();
  }
}
