import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from './entities/channel.entity';
import { ChannelMember } from './entities/channel-member.entity';
import { ChannelMemberRole } from './entities/channel-member.entity';
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

  /**
   * Returns true when the user is a member of the channel (any role).
   */
  private async isMember(channelId: string, userId: string): Promise<boolean> {
    const membership = await this.memberRepo.findOne({
      where: { channel: { id: channelId }, user: { id: userId } },
    });
    return membership !== null;
  }

  /**
   * Returns the user's role in the channel, or null when not a member.
   */
  private async getMemberRole(
    channelId: string,
    userId: string,
  ): Promise<ChannelMemberRole | null> {
    const membership = await this.memberRepo.findOne({
      where: { channel: { id: channelId }, user: { id: userId } },
    });
    return membership?.role ?? null;
  }

  /**
   * Throws ForbiddenException unless the user is a member of the channel
   * OR the user is the channel creator.
   */
  private async assertMemberOrCreator(
    channelId: string,
    userId: string,
  ): Promise<void> {
    if (await this.isMember(channelId, userId)) return;
    const channel = await this.channelRepo.findOne({
      where: { id: channelId },
      relations: ['createdBy'],
    });
    if (channel?.createdBy?.id === userId) return;
    throw new ForbiddenException('You are not a member of this channel');
  }

  /**
   * Throws ForbiddenException unless the user can manage the channel
   * (creator or OWNER/ADMIN member).
   */
  private async assertCanManage(
    channelId: string,
    userId: string,
  ): Promise<void> {
    const channel = await this.channelRepo.findOne({
      where: { id: channelId },
      relations: ['createdBy'],
    });
    if (channel?.createdBy?.id === userId) return;
    const role = await this.getMemberRole(channelId, userId);
    if (role === ChannelMemberRole.OWNER || role === ChannelMemberRole.ADMIN) return;
    throw new ForbiddenException('You do not have permission to manage this channel');
  }

  async findAll(workspaceId?: string, userId?: string) {
    const where = workspaceId ? { workspace: { id: workspaceId } } : {};
    const channels = await this.channelRepo.find({
      where,
      relations: ['createdBy', 'workspace', 'members', 'members.user'],
    });
    // When a user is provided, only expose channels they belong to or created.
    if (userId) {
      return channels.filter(
        (c: Channel) =>
          c.createdBy?.id === userId ||
          c.members?.some((m: ChannelMember) => m.user?.id === userId),
      );
    }
    return channels;
  }

  async findByMember(userId: string) {
    // Get channels where the user is a member
    const memberships = await this.memberRepo.find({
      where: { user: { id: userId } },
      relations: ['channel', 'channel.createdBy', 'channel.members'],
    });
    return memberships.map((m: ChannelMember) => m.channel);
  }

  async findOne(id: string, userId?: string) {
    const channel = await this.channelRepo.findOne({
      where: { id },
      relations: ['workspace', 'createdBy', 'members', 'messages'],
    });
    if (!channel) throw new NotFoundException('Channel not found');
    if (userId) await this.assertMemberOrCreator(id, userId);
    return channel;
  }

  async create(data: Partial<Channel>, createdById: string) {
    const channel = this.channelRepo.create({
      ...data,
      createdBy: { id: createdById } as unknown as Channel['createdBy'],
    });
    const saved = await this.channelRepo.save(channel);
    // Creator automatically becomes the OWNER member.
    await this.addMember(saved.id, createdById, ChannelMemberRole.OWNER);
    return this.findOne(saved.id);
  }

  async update(id: string, data: Partial<Channel>, userId?: string) {
    if (userId) await this.assertCanManage(id, userId);
    await this.channelRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string, userId?: string) {
    if (userId) await this.assertCanManage(id, userId);
    const result = await this.channelRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Channel not found');
    return { id, deleted: true };
  }

  async addMember(
    channelId: string,
    userId: string,
    role: string = 'member',
    requesterId?: string,
  ) {
    if (requesterId) await this.assertCanManage(channelId, requesterId);
    const member = this.memberRepo.create({
      channel: { id: channelId } as unknown as ChannelMember['channel'],
      user: { id: userId } as unknown as ChannelMember['user'],
      role: role as ChannelMember['role'],
    });
    return this.memberRepo.save(member);
  }

  async getMembers(channelId: string, requesterId?: string) {
    if (requesterId) await this.assertMemberOrCreator(channelId, requesterId);
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
    await this.assertMemberOrCreator(channelId, senderId);
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

  async getMessages(channelId: string, limit?: number, requesterId?: string) {
    if (requesterId) await this.assertMemberOrCreator(channelId, requesterId);
    return this.messageRepo.find({
      where: { channel: { id: channelId } },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /** Returns only messages that are top-level (no parent) */
  async getThreadedMessages(channelId: string, requesterId?: string) {
    if (requesterId) await this.assertMemberOrCreator(channelId, requesterId);
    const messages = await this.messageRepo.find({
      where: { channel: { id: channelId } },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
    });
    return messages.filter((m: ChannelMessage) => !m.replyTo);
  }

  /** Returns a single message plus its thread replies */
  async getThreadContext(messageId: string, requesterId?: string) {
    const parent = await this.messageRepo.findOne({
      where: { id: messageId },
      relations: ['sender', 'channel'],
    });
    if (!parent) return [];
    if (requesterId && parent.channel?.id) {
      await this.assertMemberOrCreator(parent.channel.id, requesterId);
    }
    const replies = await this.messageRepo.find({
      where: { replyTo: messageId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
    return [parent, ...replies];
  }

  /** Returns only replies for a given thread parent */
  async getThreadReplies(messageId: string, requesterId?: string) {
    const parent = await this.messageRepo.findOne({
      where: { id: messageId },
      relations: ['channel'],
    });
    if (requesterId && parent?.channel?.id) {
      await this.assertMemberOrCreator(parent.channel.id, requesterId);
    }
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
    await this.assertMemberOrCreator(channelId, senderId);
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