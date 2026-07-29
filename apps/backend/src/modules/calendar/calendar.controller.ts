import {
  Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CalendarService } from './calendar.service';

@ApiTags('Calendar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'odoo/calendar', version: ['1', VERSION_NEUTRAL] })
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('events')
  @ApiOperation({ summary: 'List calendar events with pagination and date filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20, max: 100)' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, description: 'Filter events starting from (ISO date)' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, description: 'Filter events ending before (ISO date)' })
  @ApiResponse({ status: 200, description: 'Paginated list of calendar events' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getEvents(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.calendarService.getEvents({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      dateFrom,
      dateTo,
    });
  }

  @Get('events/:id')
  @ApiOperation({ summary: 'Get a single calendar event by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async getEvent(@Param('id') id: string) {
    return this.calendarService.getEvent(parseInt(id, 10));
  }

  @Post('events')
  @ApiOperation({ summary: 'Create a new calendar event' })
  @ApiBody({ description: 'Event data', type: Object })
  @ApiResponse({ status: 201, description: 'Event created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createEvent(@Body() data: Record<string, unknown>) {
    const id = await this.calendarService.createEvent(data);
    return { id, success: true };
  }

  @Patch('events/:id')
  @ApiOperation({ summary: 'Update an existing calendar event' })
  @ApiParam({ name: 'id', type: Number, description: 'Event ID' })
  @ApiBody({ description: 'Fields to update', type: Object })
  @ApiResponse({ status: 200, description: 'Event updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async updateEvent(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    await this.calendarService.updateEvent(parseInt(id, 10), data);
    return { success: true };
  }

  @Delete('events/:id')
  @ApiOperation({ summary: 'Delete a calendar event (soft-delete via active=false)' })
  @ApiParam({ name: 'id', type: Number, description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async deleteEvent(@Param('id') id: string) {
    await this.calendarService.deleteEvent(parseInt(id, 10));
    return { success: true };
  }
}
