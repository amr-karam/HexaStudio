import {
  Controller, Get, Param, Query, UseGuards, VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmployeesService } from './employees.service';

@ApiTags('Employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'odoo/employees', version: ['1', VERSION_NEUTRAL] })
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'List employees with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20, max: 100)' })
  @ApiQuery({ name: 'department', required: false, type: String, description: 'Filter by department name' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in name and email' })
  @ApiResponse({ status: 200, description: 'Paginated list of employees' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getEmployees(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('department') department?: string,
    @Query('search') search?: string,
  ) {
    return this.employeesService.getEmployees({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      department,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single employee by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Employee ID' })
  @ApiResponse({ status: 200, description: 'Employee found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async getEmployee(@Param('id') id: string) {
    return this.employeesService.getEmployee(parseInt(id, 10));
  }
}
