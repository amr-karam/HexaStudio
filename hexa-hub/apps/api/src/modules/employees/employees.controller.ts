import { Controller, Get, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmployeesService } from './employees.service';

@ApiTags('Employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('odoo/employees')
export class EmployeesController {
  constructor(private readonly service: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'List employees' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'search', required: false })
  getEmployees(@Query('page') p?: string, @Query('limit') l?: string, @Query('department') d?: string, @Query('search') s?: string) {
    return this.service.getEmployees({ page: p ? +p : undefined, limit: l ? +l : undefined, department: d, search: s });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  getEmployee(@Param('id', ParseIntPipe) id: number) { return this.service.getEmployee(id); }
}
