import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { AddChannelMemberDto } from './dto/add-channel-member.dto';
import { Channel } from './entities/channel.entity';
import { ChannelMessage } from './entities/channel-message.entity';
import { ChannelMember } from './entities/channel-member.entity';

interface RequestWithUser {
  user: { id: string };
}

@UseGuards(JwtAuthGuard)
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Post()
  async create(
    @Body() createDto: CreateChannelDto,
    @Request() req: RequestWithUser,
  ): Promise<Channel> {
    return this.channelsService.create(createDto, req.user.id);
  }

  @Get()
  async findAll(@Request() req: RequestWithUser): Promise<Channel[]> {
    return this.channelsService.findAll(undefined, req.user.id);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: RequestWithUser,
  ): Promise<Channel> {
    return this.channelsService.findOne(id, req.user.id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateChannelDto,
    @Request() req: RequestWithUser,
  ): Promise<Channel> {
    return this.channelsService.update(id, updateDto, req.user.id);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: RequestWithUser,
  ): Promise<{ id: string; deleted: boolean }> {
    return this.channelsService.remove(id, req.user.id);
  }

  @Post(':channelId/members')
  async addMember(
    @Param('channelId', ParseUUIDPipe) channelId: string,
    @Body() addMemberDto: AddChannelMemberDto,
    @Request() req: RequestWithUser,
  ): Promise<ChannelMember> {
    return this.channelsService.addMember(
      channelId,
      addMemberDto.userId,
      addMemberDto.role,
      req.user.id,
    );
  }

  @Get(':channelId/members')
  async getMembers(
    @Param('channelId', ParseUUIDPipe) channelId: string,
    @Request() req: RequestWithUser,
  ): Promise<ChannelMember[]> {
    return this.channelsService.getMembers(channelId, req.user.id);
  }

  @Post(':channelId/messages')
  async sendMessage(
    @Param('channelId', ParseUUIDPipe) channelId: string,
    @Body() body: { content: string; type?: string; replyTo?: string },
    @Request() req: RequestWithUser,
  ): Promise<ChannelMessage> {
    return this.channelsService.sendMessage(
      channelId,
      req.user.id,
      body.content,
      (body.type as ChannelMessage['type']) || 'text',
      undefined,
      body.replyTo,
    );
  }

  @Get(':channelId/messages')
  async getMessages(
    @Param('channelId', ParseUUIDPipe) channelId: string,
    @Request() req: RequestWithUser,
  ): Promise<ChannelMessage[]> {
    return this.channelsService.getMessages(channelId, undefined, req.user.id);
  }

  // ─── Thread Endpoints ───────────────────────────────────────────────────

  @Get(':channelId/messages/threaded')
  async getThreadedMessages(
    @Param('channelId', ParseUUIDPipe) channelId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.channelsService.getThreadedMessages(channelId, req.user.id);
  }

  @Get(':channelId/messages/:messageId/thread')
  async getThreadContext(
    @Param('channelId', ParseUUIDPipe) _channelId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.channelsService.getThreadContext(messageId, req.user.id);
  }

  @Get(':channelId/messages/:messageId/replies')
  async getThreadReplies(
    @Param('channelId', ParseUUIDPipe) _channelId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.channelsService.getThreadReplies(messageId, req.user.id);
  }

  @Post(':channelId/messages/:messageId/reply')
  async replyToMessage(
    @Param('channelId', ParseUUIDPipe) channelId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Body() body: { content: string; type?: string },
    @Request() req: RequestWithUser,
  ) {
    return this.channelsService.replyToMessage(
      channelId,
      req.user.id,
      messageId,
      body.content,
      (body.type as 'text' | 'image' | 'file' | 'system') || 'text',
    );
  }
}