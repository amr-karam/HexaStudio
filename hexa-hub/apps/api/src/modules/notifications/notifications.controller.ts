import { Controller, Get, Patch, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getNotifications(
    @Query('userId') userId: string,
    @Query('unread') unread?: string,
    @Query('channel') channel?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.getNotifications(userId || 'me', {
      unread: unread !== undefined ? unread === 'true' : undefined,
      channel,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 25,
    });
  }

  @Patch(':id/read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('read-all')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async markAllAsRead(@Query('userId') userId: string) {
    return this.notificationsService.markAllAsRead(userId || 'me');
  }

  @Get('unread-count')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getUnreadCount(@Query('userId') userId: string) {
    return this.notificationsService.getUnreadCount(userId || 'me');
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async deleteNotification(@Param('id') id: string) {
    return this.notificationsService.deleteNotification(id);
  }
}
