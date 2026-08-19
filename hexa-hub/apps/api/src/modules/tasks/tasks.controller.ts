import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';
import { TasksService } from './tasks.service';

@Controller('odoo/tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getTask(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.tasksService.getTask(id) };
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async createTask(@Body() body: Record<string, unknown>) {
    return { data: await this.tasksService.createTask(body) };
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async updateTask(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {
    return { data: await this.tasksService.updateTask(id, body) };
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async deleteTask(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.tasksService.deleteTask(id) };
  }

  @Post(':id/complete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async completeTask(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.tasksService.completeTask(id) };
  }
}
