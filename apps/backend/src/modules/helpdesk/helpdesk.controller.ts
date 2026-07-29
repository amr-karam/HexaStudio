import {
  Controller, Get, Post, Patch, Param, Query, Body, UseGuards, VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HelpdeskService } from './helpdesk.service';

@ApiTags('Helpdesk')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'odoo/helpdesk', version: ['1', VERSION_NEUTRAL] })
export class HelpdeskController {
  constructor(private readonly helpdeskService: HelpdeskService) {}

  @Get('tickets')
  @ApiOperation({ summary: 'List helpdesk tickets with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20, max: 100)' })
  @ApiQuery({ name: 'state', required: false, type: String, description: 'Filter by ticket state' })
  @ApiQuery({ name: 'priority', required: false, type: String, description: 'Filter by priority (0-3)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in name and description' })
  @ApiResponse({ status: 200, description: 'Paginated list of helpdesk tickets' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTickets(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('state') state?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string,
  ) {
    return this.helpdeskService.getTickets({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      state,
      priority,
      search,
    });
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Get a single helpdesk ticket by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Ticket found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getTicket(@Param('id') id: string) {
    return this.helpdeskService.getTicket(parseInt(id, 10));
  }

  @Post('tickets')
  @ApiOperation({ summary: 'Create a new helpdesk ticket' })
  @ApiBody({ description: 'Ticket data', type: Object })
  @ApiResponse({ status: 201, description: 'Ticket created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createTicket(@Body() data: Record<string, unknown>) {
    const id = await this.helpdeskService.createTicket(data);
    return { id, success: true };
  }

  @Patch('tickets/:id')
  @ApiOperation({ summary: 'Update an existing helpdesk ticket' })
  @ApiParam({ name: 'id', type: Number, description: 'Ticket ID' })
  @ApiBody({ description: 'Fields to update', type: Object })
  @ApiResponse({ status: 200, description: 'Ticket updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async updateTicket(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    await this.helpdeskService.updateTicket(parseInt(id, 10), data);
    return { success: true };
  }
}
