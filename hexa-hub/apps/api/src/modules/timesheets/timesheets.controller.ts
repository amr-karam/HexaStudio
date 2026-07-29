import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TimesheetsService } from './timesheets.service';

@ApiTags('Timesheets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('odoo/timesheets')
export class TimesheetsController {
  constructor(private readonly service: TimesheetsService) {}

  @Get()
  @ApiOperation({ summary: 'List timesheet entries' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'projectId', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  getTimesheets(@Query('page') p?: string, @Query('limit') l?: string, @Query('employeeId') e?: string, @Query('projectId') pr?: string, @Query('dateFrom') df?: string, @Query('dateTo') dt?: string) {
    return this.service.getTimesheets({ page: p ? +p : undefined, limit: l ? +l : undefined, employeeId: e ? +e : undefined, projectId: pr ? +pr : undefined, dateFrom: df, dateTo: dt });
  }

  @Post()
  @ApiOperation({ summary: 'Log timesheet entry' })
  createTimesheet(@Body() body: Record<string, unknown>) { return this.service.createTimesheet(body); }

  @Get('stats')
  @ApiOperation({ summary: 'Timesheet statistics' })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  getStats(@Query('dateFrom') df?: string, @Query('dateTo') dt?: string) { return this.service.getStats({ dateFrom: df, dateTo: dt }); }
}
