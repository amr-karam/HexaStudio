import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.projectsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: any) {
    return this.projectsService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/sync')
  async sync(@Param('id') id: string) {
    await this.projectsService.syncWithOdoo(id);
    return { status: 'syncing' };
  }
}
