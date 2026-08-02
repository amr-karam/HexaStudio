import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { SpatialBrief, SpatialBriefSchema } from './spatial-brief.schema';
import { StructuredOutputService } from './structured-output.service';
import { VoiceService } from './voice.service';

/**
 * SpatialSynthesisService
 *
 * Synthesizes luxury architectural spatial design briefs (atmosphere, lighting,
 * material, color palette, design rationale) from either a text prompt or a
 * voice recording. Structured output is produced via
 * StructuredOutputService (Gemini + Zod validation); audio is transcribed with
 * VoiceService before synthesis.
 */
@Injectable()
export class SpatialSynthesisService {
  private readonly logger = new Logger(SpatialSynthesisService.name);

  constructor(
    private readonly structuredOutputService: StructuredOutputService,
    private readonly voiceService: VoiceService
  ) {}

  /**
   * Build a spatial synthesis prompt for a given design concept and delegate to
   * StructuredOutputService for a validated, deterministic brief.
   */
  async synthesizeFromPrompt(prompt: string): Promise<SpatialBrief> {
    const synthesisPrompt = `You are a luxury architectural spatial designer. Synthesize a complete spatial design brief for the following concept:

"${prompt}"

Return a structured brief with:
- atmosphere: a short, evocative description of the spatial mood (1-2 sentences)
- recommendedLighting: one of 'daylight' | 'golden_hour' | 'cyberpunk' | 'gallery'
- recommendedMaterial: one of 'obsidian_marble' | 'warm_oak' | 'brushed_titanium' | 'raw_concrete'
- colorPalette: an array of 3-5 hex color strings (#RRGGBB) curated for the scene
- designRationale: a concise explanation of how the chosen lighting, material, and palette achieve optimal depth, material contrast, and spatial luxury`;

    this.logger.debug(`Synthesizing spatial brief from prompt (${prompt.length} chars)`);

    return this.structuredOutputService.generateStructuredOutput(
      synthesisPrompt,
      SpatialBriefSchema,
      { temperature: 0.4, maxTokens: 800 }
    );
  }

  /**
   * Transcribe a voice recording and synthesize a spatial brief from the
   * resulting transcription.
   *
   * @throws ServiceUnavailableException when the voice service is not available
   */
  async synthesizeFromAudio(audioData: string, mimeType: string): Promise<SpatialBrief> {
    if (!this.voiceService.isAvailable) {
      this.logger.error('Voice service is unavailable — cannot synthesize from audio');
      throw new ServiceUnavailableException(
        'Voice transcription is unavailable — no AI provider configured'
      );
    }

    const transcription = await this.voiceService.transcribeAudio(audioData, mimeType);
    this.logger.debug(`Audio transcribed (${transcription.length} chars) — synthesizing brief`);

    return this.synthesizeFromPrompt(transcription);
  }
}
