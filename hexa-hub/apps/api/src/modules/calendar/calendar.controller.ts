import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CalendarService } from './calendar.service';

@ApiTags('Calendar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('odoo/calendar')
export class CalendarController {
  constructor(private readonly service: CalendarService) {}

  @Get('events')
  @ApiOperation({ summary: 'List calendar events' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  getEvents(@Query('page') p?: string, @Query('limit') l?: string, @Query('dateFrom') df?: string, @Query('dateTo') dt?: string) {
    return this.service.getEvents({ page: p ? +p : undefined, limit: l ? +l : undefined, dateFrom: df, dateTo: dt });
  }

  @Get('events/:id')
  @ApiOperation({ summary: 'Get event by ID' })
  getEvent(@Param('id', ParseIntPipe) id: number) { return this.service.getEvent(id); }

  @Post('events')
  @ApiOperation({ summary: 'Create event' })
  createEvent(@Body() body: Record<string, unknown>) { return this.service.createEvent(body); }

  @Patch('events/:id')
  @ApiOperation({ summary: 'Update event' })
  updateEvent(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) { return this.service.updateEvent(id, body); }

  @Delete('events/:id')
  @ApiOperation({ summary: 'Delete event' })
  deleteEvent(@Param('id', ParseIntPipe) id: number) { return this.service.deleteEvent(id); }
}
