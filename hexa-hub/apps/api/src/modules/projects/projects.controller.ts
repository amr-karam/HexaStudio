import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectsService } from './projects.service';

@Controller('odoo/projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
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
  async getStats() {
    return { data: await this.projectsService.getStats() };
  }

  @Get(':id')
  async getProject(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.projectsService.getProject(id) };
  }

  @Post()
  async createProject(@Body() body: Record<string, unknown>) {
    return { data: await this.projectsService.createProject(body) };
  }

  @Patch(':id')
  async updateProject(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {
    return { data: await this.projectsService.updateProject(id, body) };
  }

  @Delete(':id')
  async deleteProject(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.projectsService.deleteProject(id) };
  }

  // ─── Milestones ─────────────────────────────────────────────────────

  @Get(':id/milestones')
  async getMilestones(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.getMilestones(id);
  }

  @Post(':id/milestones')
  async createMilestone(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {
    return { data: await this.projectsService.createMilestone(id, body) };
  }

  @Patch('milestones/:milestoneId')
  async updateMilestone(@Param('milestoneId', ParseIntPipe) milestoneId: number, @Body() body: Record<string, unknown>) {
    return { data: await this.projectsService.updateMilestone(milestoneId, body) };
  }

  @Post('milestones/:milestoneId/complete')
  async completeMilestone(@Param('milestoneId', ParseIntPipe) milestoneId: number) {
    return { data: await this.projectsService.completeMilestone(milestoneId) };
  }
}
