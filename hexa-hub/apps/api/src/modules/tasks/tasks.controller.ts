import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TasksService } from './tasks.service';

@Controller('odoo/tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async getTasks(
    @Query('project_id') project_id?: string,
    @Query('state') state?: string,
    @Query('priority') priority?: string,
    @Query('user_id') user_id?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.tasksService.getTasks({
      project_id: project_id ? parseInt(project_id) : undefined,
      state, priority,
      user_id: user_id ? parseInt(user_id) : undefined,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 25,
    });
  }

  @Get(':id')
  async getTask(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.tasksService.getTask(id) };
  }

  @Post()
  async createTask(@Body() body: Record<string, unknown>) {
    return { data: await this.tasksService.createTask(body) };
  }

  @Patch(':id')
  async updateTask(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {
    return { data: await this.tasksService.updateTask(id, body) };
  }

  @Delete(':id')
  async deleteTask(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.tasksService.deleteTask(id) };
  }

  @Post(':id/complete')
  async completeTask(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.tasksService.completeTask(id) };
  }
}
