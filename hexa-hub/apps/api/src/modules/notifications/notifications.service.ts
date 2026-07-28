import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from './notifications.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repo: Repository<NotificationEntity>,
  ) {}

  async getNotifications(userId: string, query: { unread?: boolean; channel?: string; page?: number; limit?: number }) {
    const where: Record<string, unknown> = { userId };
    if (query.unread !== undefined) where.read = !query.unread;
    if (query.channel) where.channel = query.channel;

    const limit = query.limit || 25;
    const page = query.page || 1;

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, meta: { total, page, limit } };
  }

  async markAsRead(id: string) {
    const notification = await this.repo.findOne({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');

    notification.read = true;
    await this.repo.save(notification);
    return { id, read: true };
  }

  async markAllAsRead(userId: string) {
    await this.repo.update({ userId, read: false }, { read: true });
    return { updated: true };
  }

  async getUnreadCount(userId: string) {
    const count = await this.repo.count({ where: { userId, read: false } });
    return { count };
  }

  async createNotification(data: { userId: string; title: string; body: string; channel?: string; actionUrl?: string; metadata?: Record<string, unknown> }) {
    const notification = this.repo.create(data);
    return this.repo.save(notification);
  }

  async deleteNotification(id: string) {
    await this.repo.delete(id);
    return { id, deleted: true };
  }
}
