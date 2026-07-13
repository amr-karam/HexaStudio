import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';
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
  constructor(private readonly messagesService: MessagesService) {}

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
}
