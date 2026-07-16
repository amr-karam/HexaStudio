import { Controller, Post, Body, UseGuards, HttpException, HttpStatus, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { AgentsService } from './agents.service';
import { GeminiService } from '../ai/gemini.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class ChatDto {
  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsOptional()
  @IsString()
  @IsIn(['openai', 'gemini'])
  provider?: string;

  @IsOptional()
  @IsString()
  previousInteractionId?: string;
}

@ApiTags('Agents')
@Controller({ path: 'agents', version: VERSION_NEUTRAL })
export class AgentsController {
  constructor(
    private readonly agentsService: AgentsService,
    private readonly geminiService: GeminiService,
  ) {}

  @Post('chat')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chat with AI agent (authenticated)' })
  async chat(@Body() body: ChatDto) {
    const provider = body.provider || 'openai';

    if (provider === 'gemini') {
      if (!this.geminiService.isAvailable) {
        throw new HttpException(
          'Gemini AI is not configured (missing GEMINI_API_KEY)',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      return this.geminiService.chat(body.message, body.previousInteractionId);
    }

    return this.agentsService.chat(body.message);
  }

  @Post('deep-research')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deep research via Gemini (authenticated)' })
  async deepResearch(@Body() body: { query: string }) {
    if (!this.geminiService.isAvailable) {
      throw new HttpException(
        'Gemini AI is not configured (missing GEMINI_API_KEY)',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    return this.geminiService.chat(body.query);
  }
}
