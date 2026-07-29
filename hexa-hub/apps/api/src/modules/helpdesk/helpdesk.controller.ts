import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HelpdeskService } from './helpdesk.service';

@ApiTags('Helpdesk')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('odoo/helpdesk')
export class HelpdeskController {
  constructor(private readonly service: HelpdeskService) {}

  @Get('tickets')
  @ApiOperation({ summary: 'List support tickets' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'state', required: false })
  @ApiQuery({ name: 'priority', required: false })
  @ApiQuery({ name: 'search', required: false })
  getTickets(@Query('page') page?: string, @Query('limit') limit?: string, @Query('state') state?: string, @Query('priority') priority?: string, @Query('search') search?: string) {
    return this.service.getTickets({ page: page ? +page : undefined, limit: limit ? +limit : undefined, state, priority, search });
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Get ticket by ID' })
  getTicket(@Param('id', ParseIntPipe) id: number) {
    return this.service.getTicket(id);
  }

  @Post('tickets')
  @ApiOperation({ summary: 'Create support ticket' })
  createTicket(@Body() body: Record<string, unknown>) {
    return this.service.createTicket(body);
  }

  @Patch('tickets/:id')
  @ApiOperation({ summary: 'Update support ticket' })
  updateTicket(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {
    return this.service.updateTicket(id, body);
  }
}
