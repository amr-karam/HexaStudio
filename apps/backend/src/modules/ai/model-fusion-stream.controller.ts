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
import { ModelFusionService } from './model-fusion.service';
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

class FusionRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages!: ChatMessageDto[];

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  models?: string[];

  @IsOptional()
  @IsIn(['best', 'merge'])
  mode?: 'best' | 'merge';

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  temperature?: number;

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
 * Streaming model fusion over Server-Sent Events.
 *
 * Events:
 *  - `meta`         → `{ mode, models, weights }`
 *  - `candidate_start` → `{ model, index }`
 *  - `candidate_meta` → `{ model, provider, maxTokens }`
 *  - `candidate_reasoning` → `{ model, text }`
 *  - `candidate_delta` → `{ model, text }`
 *  - `candidate_done` → `{ model, provider, content, latencyMs, usage }`
 *  - `candidate_error` → `{ model, error }`
 *  - `result` → `{ fused, winnerScore, telemetry }`
 *  - `error` → `{ message }`
 */
@ApiTags('AI Fusion')
@Controller('ai/fusion')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ModelFusionStreamController {
  private readonly logger = new Logger(ModelFusionStreamController.name);

  constructor(private readonly modelFusion: ModelFusionService) {}

  @Post('stream')
  @Version(['1', VERSION_NEUTRAL])
  @ApiOperation({ summary: 'Streaming multi-model fusion (Server-Sent Events)' })
  @ApiResponse({ status: 200, description: 'SSE stream (text/event-stream)' })
  async stream(@Body() dto: FusionRequestDto, @Res() res: Response) {
    this.logger.log(`Fusion stream start: mode=${dto.mode ?? 'best'}, models=${(dto.models ?? []).join(', ') || 'default'}`);

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();
    res.setTimeout(0);

    const heartbeat = setInterval(() => {
      res.write(': ping\n\n');
    }, 10_000);

    const finish = () => {
      clearInterval(heartbeat);
      res.end();
    };

    try {
      for await (const event of this.modelFusion.streamFusion({
        messages: dto.messages,
        models: dto.models,
        mode: dto.mode,
        temperature: dto.temperature,
        maxTokens: dto.maxTokens,
        responseFormat: dto.responseFormat,
      })) {
        writeEvent(res, event.type, event.payload);
      }

      writeEvent(res, 'done', {});
    } catch (error) {
      this.logger.error(`Fusion stream failed: ${error instanceof Error ? error.stack : String(error)}`);
      writeEvent(res, 'error', { message: 'Fusion stream failed' });
    } finally {
      finish();
    }
  }
}
