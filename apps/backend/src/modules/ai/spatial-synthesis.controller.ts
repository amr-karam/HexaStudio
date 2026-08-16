import {
  Body,
  Controller,
  Post,
  ServiceUnavailableException,
  UseGuards,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { SpatialSynthesisService } from './spatial-synthesis.service';
import { SpatialBrief } from './spatial-brief.schema';
import { VoiceService } from './voice.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class SpatialSynthesisPromptDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(8000)
  prompt!: string;
}

class SpatialSynthesisVoiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(15_000_000)
  audioData!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  mimeType!: string;
}

/**
 * AI Spatial Synthesis
 *
 * Synthesizes luxury architectural spatial design briefs (atmosphere, lighting,
 * material, color palette, rationale) from a text prompt or a voice recording.
 *
 * - `POST /ai/spatial-synthesis`        → `{ brief }` from a text prompt
 * - `POST /ai/spatial-synthesis/voice`  → `{ transcription, brief }` from audio
 */
@ApiTags('AI Spatial Synthesis')
@Controller('ai/spatial-synthesis')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SpatialSynthesisController {
  constructor(
    private readonly spatialSynthesisService: SpatialSynthesisService,
    private readonly voiceService: VoiceService
  ) {}

  @Post()
  @Version(['1', VERSION_NEUTRAL])
  @ApiOperation({ summary: 'Synthesize a spatial design brief from a text prompt' })
  @ApiResponse({ status: 200, description: 'Spatial brief synthesized' })
  async synthesize(@Body() dto: SpatialSynthesisPromptDto): Promise<{ brief: SpatialBrief }> {
    const brief = await this.spatialSynthesisService.synthesizeFromPrompt(dto.prompt);
    return { brief };
  }

  @Post('voice')
  @Version(['1', VERSION_NEUTRAL])
  @ApiOperation({ summary: 'Transcribe a voice recording and synthesize a spatial design brief' })
  @ApiResponse({ status: 200, description: 'Transcription and spatial brief synthesized' })
  async synthesizeFromVoice(
    @Body() dto: SpatialSynthesisVoiceDto
  ): Promise<{ transcription: string; brief: SpatialBrief }> {
    if (!this.voiceService.isAvailable) {
      throw new ServiceUnavailableException(
        'Voice transcription is unavailable — no AI provider configured'
      );
    }

    // Transcribe here so the endpoint can surface the transcription alongside
    // the synthesized brief (SpatialSynthesisService.synthesizeFromAudio keeps
    // the transcription internal).
    const transcription = await this.voiceService.transcribeAudio(
      dto.audioData,
      dto.mimeType
    );
    const brief = await this.spatialSynthesisService.synthesizeFromPrompt(transcription);

    return { transcription, brief };
  }
}
