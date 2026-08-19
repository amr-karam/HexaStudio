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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';
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

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async create(
    @Body() createDto: CreateChannelDto,
    @Request() req: RequestWithUser,
  ): Promise<Channel> {
    return this.channelsService.create(createDto, req.user.id);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async findAll(@Request() req: RequestWithUser): Promise<Channel[]> {
    return this.channelsService.findAll(undefined, req.user.id);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: RequestWithUser,
  ): Promise<Channel> {
    return this.channelsService.findOne(id, req.user.id);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateChannelDto,
    @Request() req: RequestWithUser,
  ): Promise<Channel> {
    return this.channelsService.update(id, updateDto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: RequestWithUser,
  ): Promise<{ id: string; deleted: boolean }> {
    return this.channelsService.remove(id, req.user.id);
  }

  @Post(':channelId/members')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getMembers(
    @Param('channelId', ParseUUIDPipe) channelId: string,
    @Request() req: RequestWithUser,
  ): Promise<ChannelMember[]> {
    return this.channelsService.getMembers(channelId, req.user.id);
  }

  @Post(':channelId/messages')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getMessages(
    @Param('channelId', ParseUUIDPipe) channelId: string,
    @Request() req: RequestWithUser,
  ): Promise<ChannelMessage[]> {
    return this.channelsService.getMessages(channelId, undefined, req.user.id);
  }

  // ─── Thread Endpoints ───────────────────────────────────────────────────

  @Get(':channelId/messages/threaded')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getThreadedMessages(
    @Param('channelId', ParseUUIDPipe) channelId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.channelsService.getThreadedMessages(channelId, req.user.id);
  }

  @Get(':channelId/messages/:messageId/thread')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getThreadContext(
    @Param('channelId', ParseUUIDPipe) _channelId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.channelsService.getThreadContext(messageId, req.user.id);
  }

  @Get(':channelId/messages/:messageId/replies')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async getThreadReplies(
    @Param('channelId', ParseUUIDPipe) _channelId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.channelsService.getThreadReplies(messageId, req.user.id);
  }

  @Post(':channelId/messages/:messageId/reply')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
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
