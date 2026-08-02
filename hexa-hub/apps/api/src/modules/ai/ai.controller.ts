import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { AiService } from './services/ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Task } from '@hexa-hub/types';

interface ChatMessageDto {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Post('chat')
  async chat(@Body() body: { messages: ChatMessageDto[] }) {
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const response = await this.aiService.generateChat(
      messages.length ? messages : [{ role: 'user', content: 'Hello' }],
    );
    return { response };
  }

  @UseGuards(JwtAuthGuard)
  @Post('summarize')
  async summarize(@Body() body: { tasks: Task[] }) {
    return { summary: await this.aiService.generateProjectSummary(body.tasks) };
  }

  @UseGuards(JwtAuthGuard)
  @Get('suggest/:taskId')
  async suggest(@Param('taskId') taskId: string, @Body() body: { task: Task }) {
    return { suggestion: await this.aiService.suggestNextAction(body.task) };
  }
}
