import {
  Body,
  Controller,
  Logger,
  Post,
  Res,
  UseGuards,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import {
  IsArray,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AiChatService } from './ai-chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class ChatMessageDto {
  @IsString()
  @IsIn(['system', 'user', 'assistant'])
  role!: 'system' | 'user' | 'assistant';

  @IsString()
  @MaxLength(200_000)
  content!: string;
}

class ChatResponseFormatDto {
  @IsIn(['json_object', 'text'])
  type!: 'json_object' | 'text';
}

class ChatRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages!: ChatMessageDto[];

  /** Explicit model override (e.g. "gemma-4-12b-it-qat"). Default: routed/configured. */
  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  temperature?: number;

  /** Max tokens — reasoning models need headroom (default 1200). */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(8192)
  maxTokens?: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ChatResponseFormatDto)
  responseFormat?: ChatResponseFormatDto;
}

function writeEvent(res: Response, event: string, payload: unknown): void {
  res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
}

/**
 * Generic chat completions over the configured LLM provider.
 *
 * - `POST /ai/chat`          → non-streaming JSON `{ content, model, provider }`
 * - `POST /ai/chat/stream`   → Server-Sent Events:
 *     `event: meta`     → `{ model, provider, maxTokens }` (sent immediately)
 *     `event: reasoning`→ `{ text }` thinking deltas (reasoning models)
 *     `event: delta`    → `{ text }` content chunks as they stream
 *     `event: done`     → `{}` (terminator)
 *     `event: error`    → `{ message }` (upstream failure)
 *
 * For the `local` provider, simple queries are routed to the fast model
 * (LM_STUDIO_FAST_MODEL) and complex ones to the main model (LM_STUDIO_MODEL).
 */
@ApiTags('AI Chat')
@Controller('ai/chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiChatController {
  private readonly logger = new Logger(AiChatController.name);

  constructor(private readonly aiChat: AiChatService) {}

  @Post()
  @Version(['1', VERSION_NEUTRAL])
  @ApiOperation({ summary: 'Non-streaming chat completion' })
  @ApiResponse({ status: 200, description: 'Completion returned' })
  async chat(@Body() dto: ChatRequestDto) {
    const routed = dto.model
      ? { model: dto.model, reasoning: 'explicit override' }
      : this.aiChat.selectModelFor(
          dto.messages[dto.messages.length - 1]?.content ?? '',
          { requiresStructuredOutput: dto.responseFormat?.type === 'json_object' },
        );

    this.logger.log(`Chat → ${routed.model} (${this.aiChat.provider})`);

    const result = await this.aiChat.complete({
      messages: dto.messages,
      model: routed.model,
      temperature: dto.temperature,
      maxTokens: dto.maxTokens,
      responseFormat: dto.responseFormat,
    });

    return { ...result, routing: routed };
  }

  @Post('stream')
  @Version(['1', VERSION_NEUTRAL])
  @ApiOperation({ summary: 'Streaming chat completion (Server-Sent Events)' })
  @ApiResponse({ status: 200, description: 'SSE stream (text/event-stream)' })
  async chatStream(@Body() dto: ChatRequestDto, @Res() res: Response) {
    const routed = dto.model
      ? { model: dto.model, reasoning: 'explicit override' }
      : this.aiChat.selectModelFor(
          dto.messages[dto.messages.length - 1]?.content ?? '',
          { requiresStructuredOutput: dto.responseFormat?.type === 'json_object' },
        );

    this.logger.log(`Chat stream → ${routed.model} (${this.aiChat.provider})`);

    // SSE plumbing — disable buffering/proxies/timeouts.
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();
    res.setTimeout(0);

    // Heartbeat keeps the connection alive while the model thinks
    // (12B on CPU can take 20-40s before the first token).
    const heartbeat = setInterval(() => {
      res.write(': ping\n\n');
    }, 10_000);

    const finish = () => {
      clearInterval(heartbeat);
      res.end();
    };

    try {
      for await (const event of this.aiChat.streamChat({
        messages: dto.messages,
        model: routed.model,
        temperature: dto.temperature,
        maxTokens: dto.maxTokens,
        responseFormat: dto.responseFormat,
      })) {
        if (event.type === 'meta') {
          writeEvent(res, 'meta', {
            model: event.model,
            provider: event.provider,
            maxTokens: event.maxTokens,
            routing: routed,
          });
        } else if (event.type === 'reasoning') {
          writeEvent(res, 'reasoning', { text: event.text });
        } else if (event.type === 'delta') {
          writeEvent(res, 'delta', { text: event.text });
        } else if (event.type === 'usage') {
          writeEvent(res, 'usage', {
            promptTokens: event.promptTokens,
            completionTokens: event.completionTokens,
          });
        } else if (event.type === 'error') {
          writeEvent(res, 'error', { message: event.message });
          break;
        }
      }

      writeEvent(res, 'done', {});
    } catch (error) {
      this.logger.error(`SSE stream failed: ${error}`);
      writeEvent(res, 'error', {
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      finish();
    }
  }
}
