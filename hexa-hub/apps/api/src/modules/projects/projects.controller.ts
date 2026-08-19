import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';
import { ProjectsService } from './projects.service';

@Controller('odoo/projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getProjects(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('partner_id') partner_id?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.projectsService.getProjects({
      type, status,
      partner_id: partner_id ? parseInt(partner_id) : undefined,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 25,
    });
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getStats() {
    return { data: await this.projectsService.getStats() };
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getProject(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.projectsService.getProject(id) };
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async createProject(@Body() body: Record<string, unknown>) {
    return { data: await this.projectsService.createProject(body) };
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async updateProject(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {
    return { data: await this.projectsService.updateProject(id, body) };
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async deleteProject(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.projectsService.deleteProject(id) };
  }

  // ─── Milestones ─────────────────────────────────────────────────────

  @Get(':id/milestones')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getMilestones(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.getMilestones(id);
  }

  @Post(':id/milestones')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async createMilestone(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {
    return { data: await this.projectsService.createMilestone(id, body) };
  }

  @Patch('milestones/:milestoneId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async updateMilestone(@Param('milestoneId', ParseIntPipe) milestoneId: number, @Body() body: Record<string, unknown>) {
    return { data: await this.projectsService.updateMilestone(milestoneId, body) };
  }

  @Post('milestones/:milestoneId/complete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async completeMilestone(@Param('milestoneId', ParseIntPipe) milestoneId: number) {
    return { data: await this.projectsService.completeMilestone(milestoneId) };
  }
}
