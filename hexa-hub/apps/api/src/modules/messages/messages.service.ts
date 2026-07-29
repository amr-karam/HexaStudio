import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  async sendMessage(senderId: string, receiverId: string, content: string, type: 'text' | 'file' | 'system' = 'text', fileUrl?: string) {
    const message = this.messageRepo.create({
      senderId,
      receiverId,
      content,
      type,
      fileUrl,
    });
    return this.messageRepo.save(message);
  }

  async getConversation(userA: string, userB: string) {
    return this.messageRepo.find({
      where: [
        { senderId: userA, receiverId: userB },
        { senderId: userB, receiverId: userA },
      ],
      order: { createdAt: 'ASC' },
    });
  }

  async getInbox(userId: string) {
    // Simplified: returns last message from each conversation
    return this.messageRepo.find({
      where: { receiverId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(messageId: string) {
    await this.messageRepo.update(messageId, { isRead: true });
  }

  async getThreadContext(messageId: string) {
    const parent = await this.messageRepo.findOne({ where: { id: messageId } });
    if (!parent) return null;
    const replies = await this.messageRepo.find({
      where: { replyTo: messageId },
      order: { createdAt: 'ASC' },
    });
    return { parent, replies };
  }

  async replyToMessage(senderId: string, receiverId: string, replyTo: string, content: string, type: 'text' | 'file' | 'system' = 'text') {
    const message = this.messageRepo.create({
      senderId,
      receiverId,
      content,
      type,
      replyTo,
    });
    return this.messageRepo.save(message);
  }
}
