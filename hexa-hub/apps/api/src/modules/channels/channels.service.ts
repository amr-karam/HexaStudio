import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from './entities/channel.entity';
import { ChannelMember } from './entities/channel-member.entity';
import { ChannelMessage } from './entities/channel-message.entity';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepo: Repository<Channel>,
    @InjectRepository(ChannelMember)
    private readonly memberRepo: Repository<ChannelMember>,
    @InjectRepository(ChannelMessage)
    private readonly messageRepo: Repository<ChannelMessage>,
  ) {}

  async findAll(workspaceId?: string) {
    const where = workspaceId ? { workspace: { id: workspaceId } } : {};
    return this.channelRepo.find({
      where,
      relations: ['createdBy', 'workspace', 'members'],
    });
  }

  async findByMember(userId: string) {
    // Get channels where the user is a member
    const memberships = await this.memberRepo.find({
      where: { user: { id: userId } },
      relations: ['channel', 'channel.createdBy', 'channel.members'],
    });
    return memberships.map((m) => m.channel);
  }

  async findOne(id: string) {
    const channel = await this.channelRepo.findOne({
      where: { id },
      relations: ['workspace', 'createdBy', 'members', 'messages'],
    });
    if (!channel) throw new NotFoundException('Channel not found');
    return channel;
  }

  async create(data: Partial<Channel>, createdById: string) {
    const channel = this.channelRepo.create({
      ...data,
      createdBy: { id: createdById } as unknown as Channel['createdBy'],
    });
    return this.channelRepo.save(channel);
  }

  async update(id: string, data: Partial<Channel>) {
    await this.channelRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    const result = await this.channelRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Channel not found');
    return { id, deleted: true };
  }

  async addMember(channelId: string, userId: string, role: string = 'member') {
    const member = this.memberRepo.create({
      channel: { id: channelId } as unknown as ChannelMember['channel'],
      user: { id: userId } as unknown as ChannelMember['user'],
      role: role as ChannelMember['role'],
    });
    return this.memberRepo.save(member);
  }

  async getMembers(channelId: string) {
    return this.memberRepo.find({
      where: { channel: { id: channelId } },
      relations: ['user'],
    });
  }

  async sendMessage(
    channelId: string,
    senderId: string,
    content: string,
    type: 'text' | 'image' | 'file' | 'system' = 'text',
    fileUrl?: string,
    replyTo?: string,
  ) {
    const message = this.messageRepo.create({
      content,
      type,
      fileUrl,
      replyTo,
      channel: { id: channelId } as unknown as ChannelMessage['channel'],
      sender: { id: senderId } as unknown as ChannelMessage['sender'],
    });
    return this.messageRepo.save(message);
  }

  async getMessages(channelId: string, limit?: number) {
    return this.messageRepo.find({
      where: { channel: { id: channelId } },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /** Returns only messages that are top-level (no parent) */
  async getThreadedMessages(channelId: string) {
    const messages = await this.messageRepo.find({
      where: { channel: { id: channelId } },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
    });
    return messages.filter((m) => !m.replyTo);
  }

  /** Returns a single message plus its thread replies */
  async getThreadContext(messageId: string) {
    const parent = await this.messageRepo.findOne({
      where: { id: messageId },
      relations: ['sender'],
    });
    if (!parent) return [];
    const replies = await this.messageRepo.find({
      where: { replyTo: messageId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
    return [parent, ...replies];
  }

  /** Returns only replies for a given thread parent */
  async getThreadReplies(messageId: string) {
    return this.messageRepo.find({
      where: { replyTo: messageId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  /** Creates a reply to an existing message */
  async replyToMessage(
    channelId: string,
    senderId: string,
    parentMessageId: string,
    content: string,
    type: 'text' | 'image' | 'file' | 'system' = 'text',
  ) {
    const message = this.messageRepo.create({
      content,
      type,
      replyTo: parentMessageId,
      channel: { id: channelId } as unknown as ChannelMessage['channel'],
      sender: { id: senderId } as unknown as ChannelMessage['sender'],
    });
    return this.messageRepo.save(message);
  }
}