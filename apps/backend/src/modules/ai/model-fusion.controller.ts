import {
  Body,
  Controller,
  Logger,
  Post,
  UseGuards,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ModelFusionService, FusionRequest, FusionResponse } from './model-fusion.service';

class FusionMessageDto {
  @IsString()
  @IsIn(['system', 'user', 'assistant'])
  role!: 'system' | 'user' | 'assistant';

  @IsString()
  @MaxLength(200_000)
  content!: string;
}

class FusionResponseFormatDto {
  @IsIn(['json_object', 'text'])
  type!: 'json_object' | 'text';
}

class ModelFusionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FusionMessageDto)
  messages!: FusionMessageDto[];

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
  @Type(() => FusionResponseFormatDto)
  responseFormat?: FusionResponseFormatDto;
}

@ApiTags('Model Fusion')
@Controller('ai/fusion')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ModelFusionController {
  private readonly logger = new Logger(ModelFusionController.name);

  constructor(private readonly fusion: ModelFusionService) {}

  @Post()
  @Version(['1', VERSION_NEUTRAL])
  @ApiOperation({ summary: 'Run multi-model fusion analysis' })
  @ApiResponse({ status: 200, description: 'Fused result returned' })
  async fuse(@Body() dto: ModelFusionDto): Promise<FusionResponse> {
    this.logger.log(`Fusion request: mode=${dto.mode ?? 'best'}, models=${dto.models?.join(',') ?? 'default'}`);
    return this.fusion.fuse({
      messages: dto.messages,
      models: dto.models,
      mode: dto.mode,
      temperature: dto.temperature,
      maxTokens: dto.maxTokens,
      responseFormat: dto.responseFormat,
    });
  }
}
