import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { AiService } from './services/ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Post('summarize')
  async summarize(@Body() body: { tasks: any[] }) {
    return { summary: await this.aiService.generateProjectSummary(body.tasks) };
  }

  @UseGuards(JwtAuthGuard)
  @Get('suggest/:taskId')
  async suggest(@Param('taskId') taskId: string, @Body() body: { task: any }) {
    return { suggestion: await this.aiService.suggestNextAction(body.task) };
  }
}
