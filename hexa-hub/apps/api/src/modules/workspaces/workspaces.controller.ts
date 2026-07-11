import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.workspacesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.workspacesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: any) {
    return this.workspacesService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/tasks')
  async getTasks(@Param('id') id: string) {
    return this.workspacesService.getTasks(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('tasks/:id')
  async updateTask(@Param('id') id: string, @Body() body: any) {
    return this.workspacesService.updateTask(id, body);
  }
}
