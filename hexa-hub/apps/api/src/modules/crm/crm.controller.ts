import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';
import { CrmService } from './crm.service';

@Controller('odoo/crm')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get('pipeline')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getPipeline() {
    return { data: await this.crmService.getPipeline() };
  }

  @Get('leads')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getLeads(
    @Query('stage') stage?: string,
    @Query('source') source?: string,
    @Query('service') service?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.crmService.getLeads({
      stage, source, service, search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 25,
    });
  }

  @Get('leads/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getLead(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.crmService.getLead(id) };
  }

  @Post('leads')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async createLead(@Body() body: Record<string, unknown>) {
    return { data: await this.crmService.createLead(body) };
  }

  @Patch('leads/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async updateLead(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {
    return { data: await this.crmService.updateLead(id, body) };
  }

  @Delete('leads/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async deleteLead(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.crmService.deleteLead(id) };
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getStats() {
    return { data: await this.crmService.getStats() };
  }
}
