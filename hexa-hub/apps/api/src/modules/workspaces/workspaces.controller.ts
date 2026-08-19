import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';
import { Workspace } from './entities/workspace.entity';
import { Task } from './entities/task.entity';

@Controller('workspaces')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getAll() {
    return this.workspacesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getOne(@Param('id') id: string) {
    return this.workspacesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async create(@Body() body: Partial<Workspace>) {
    return this.workspacesService.create(body);
  }

  @Get(':id/tasks')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getTasks(@Param('id') id: string) {
    return this.workspacesService.getTasks(id);
  }

  @Patch('tasks/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async updateTask(@Param('id') id: string, @Body() body: Partial<Task>) {
    return this.workspacesService.updateTask(id, body);
  }
}
