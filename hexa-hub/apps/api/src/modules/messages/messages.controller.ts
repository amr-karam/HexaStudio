import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async send(@Request() req, @Body() body: { receiverId: string; content: string; type?: string; fileUrl?: string }) {
    return this.messagesService.sendMessage(req.user.id, body.receiverId, body.content, body.type, body.fileUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversation/:userId')
  async getChat(@Request() req, @Param('userId') userId: string) {
    return this.messagesService.getConversation(req.user.id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('inbox')
  async getInbox(@Request() req) {
    return this.messagesService.getInbox(req.user.id);
  }
}
