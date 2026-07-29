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

@UseGuards(JwtAuthGuard)
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Post()
  async create(
    @Body() createDto: CreateChannelDto,
    @Request() req: { user: { id: string } },
  ): Promise<Channel> {
    return this.channelsService.create(createDto, req.user.id);
  }

  @Get()
  async findAll(): Promise<Channel[]> {
    return this.channelsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Channel> {
    return this.channelsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateChannelDto,
  ): Promise<Channel> {
    return this.channelsService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ id: string; deleted: boolean }> {
    return this.channelsService.remove(id);
  }

  @Post(':channelId/members')
  async addMember(
    @Param('channelId', ParseUUIDPipe) channelId: string,
    @Body() addMemberDto: AddChannelMemberDto,
  ): Promise<ChannelMember> {
    return this.channelsService.addMember(
      channelId,
      addMemberDto.userId,
      addMemberDto.role,
    );
  }

  @Get(':channelId/members')
  async getMembers(
    @Param('channelId', ParseUUIDPipe) channelId: string,
  ): Promise<ChannelMember[]> {
    return this.channelsService.getMembers(channelId);
  }

  @Post(':channelId/messages')
  async sendMessage(
    @Param('channelId', ParseUUIDPipe) channelId: string,
    @Body() body: { content: string; type?: string; replyTo?: string },
    @Request() req: { user: { id: string } },
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
  ): Promise<ChannelMessage[]> {
    return this.channelsService.getMessages(channelId);
  }

  // ─── Thread Endpoints ───────────────────────────────────────────────────

  @Get(':channelId/messages/threaded')
  async getThreadedMessages(
    @Param('channelId', ParseUUIDPipe) channelId: string,
  ) {
    return this.channelsService.getThreadedMessages(channelId);
  }

  @Get(':channelId/messages/:messageId/thread')
  async getThreadContext(
    @Param('channelId', ParseUUIDPipe) _channelId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
  ) {
    return this.channelsService.getThreadContext(messageId);
  }

  @Get(':channelId/messages/:messageId/replies')
  async getThreadReplies(
    @Param('channelId', ParseUUIDPipe) _channelId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
  ) {
    return this.channelsService.getThreadReplies(messageId);
  }

  @Post(':channelId/messages/:messageId/reply')
  async replyToMessage(
    @Param('channelId', ParseUUIDPipe) channelId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Body() body: { content: string; type?: string },
    @Request() req: { user: { id: string } },
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