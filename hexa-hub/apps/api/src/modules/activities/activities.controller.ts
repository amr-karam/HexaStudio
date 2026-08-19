import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';
import { ActivitiesService } from './activities.service';

@Controller('odoo/activities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getActivities(
    @Query('res_model') res_model?: string,
    @Query('res_id') res_id?: string,
    @Query('user_id') user_id?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.activitiesService.getActivities({
      res_model,
      res_id: res_id ? parseInt(res_id) : undefined,
      user_id: user_id ? parseInt(user_id) : undefined,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 25,
    });
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async createActivity(@Body() body: Record<string, unknown>) {
    return { data: await this.activitiesService.createActivity(body) };
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async updateActivity(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {
    return { data: await this.activitiesService.updateActivity(id, body) };
  }

  @Post(':id/complete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async completeActivity(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.activitiesService.completeActivity(id) };
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async deleteActivity(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.activitiesService.deleteActivity(id) };
  }
}
