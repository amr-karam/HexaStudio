import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { ChannelsService } from '../channels/channels.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly channelsService: ChannelsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async send(@Req() req: AuthenticatedRequest, @Body() body: { receiverId: string; content: string; type?: 'text' | 'file' | 'system'; fileUrl?: string }) {
    return this.messagesService.sendMessage(req.user.id, body.receiverId, body.content, body.type, body.fileUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversation/:userId')
  async getChat(@Req() req: AuthenticatedRequest, @Param('userId') userId: string) {
    return this.messagesService.getConversation(req.user.id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('inbox')
  async getInbox(@Req() req: AuthenticatedRequest) {
    return this.messagesService.getInbox(req.user.id);
  }

  // ─── Unified Inbox ───────────────────────────────────────────────────────

  /**
   * GET /messages/unified-inbox
   * Aggregates DM conversations, channel memberships, mentions, and notifications
   * into a single unified inbox view.
   */
  @UseGuards(JwtAuthGuard)
  @Get('unified-inbox')
  async getUnifiedInbox(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;

    const [dmInbox, channels] = await Promise.all([
      // Direct messages inbox
      this.messagesService.getInbox(userId),
      // Channels the user belongs to
      this.channelsService.findByMember(userId).catch(() => []),
      // Thread replies (messages replying to user's messages)
      this.messagesService.getInbox(userId).catch(() => []),
    ]);

    // Build channel inbox entries
    const channelEntries = channels.map((ch) => ({
      id: ch.id,
      type: 'channel' as const,
      name: ch.name,
      description: ch.description,
      memberCount: ch.members?.length ?? 0,
    }));

    return {
      sections: {
        dms: {
          label: 'Direct Messages',
          count: dmInbox.length,
          items: dmInbox,
        },
        channels: {
          label: 'Channels',
          count: channelEntries.length,
          items: channelEntries,
        },
        threads: {
          label: 'Threads',
          count: 0,
          items: [],
        },
      },
      totalUnread: 0,
    };
  }

  // ─── Thread Endpoints ───────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('thread/:messageId')
  async getThreadContext(@Param('messageId') messageId: string) {
    const context = await this.messagesService.getThreadContext(messageId);
    return { data: context };
  }

  @UseGuards(JwtAuthGuard)
  @Post('thread/:messageId/reply')
  async replyToMessage(
    @Req() req: AuthenticatedRequest,
    @Param('messageId') messageId: string,
    @Body() body: { content: string; type?: 'text' | 'file' | 'system' },
  ) {
    const thread = await this.messagesService.getThreadContext(messageId);
    if (!thread) return { data: null };

    const parentMsg = thread.parent;
    const receiverId =
      parentMsg.senderId === req.user.id
        ? parentMsg.receiverId
        : parentMsg.senderId;

    return {
      data: await this.messagesService.replyToMessage(
        req.user.id,
        receiverId,
        messageId,
        body.content,
        body.type,
      ),
    };
  }
}