import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { AiService } from './services/ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Task } from '@hexa-hub/types';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

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
