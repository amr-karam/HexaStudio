import { Controller, Post, Body } from '@nestjs/common';
import { AgentsService } from './agents.service';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post('chat')
  async chat(@Body() body: { message: string }): Promise<{ response: string; toolCalls: number }> {
    return this.agentsService.chat(body.message);
  }
}
