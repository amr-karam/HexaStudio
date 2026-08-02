import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { VoiceService } from './voice.service';
import { StructuredOutputService } from './structured-output.service';

export const Transform3DSchema = z.object({
  targetId: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }),
  rotation: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }).optional(),
});

export type Transform3D = z.infer<typeof Transform3DSchema>;

@Injectable()
export class TransformReasoningService {
  private readonly logger = new Logger(TransformReasoningService.name);

  constructor(
    private readonly voiceService: VoiceService,
    private readonly structuredOutputService: StructuredOutputService
  ) {}

  async transformVoiceTo3D(audioData: string, mimeType: string, projectId: string): Promise<Transform3D> {
    this.logger.log(`Transcribing and reasoning for project ${projectId}...`);
    
    const transcription = await this.voiceService.transcribeAudio(audioData, mimeType);
    this.logger.debug(`Transcription: ${transcription}`);

    const prompt = `Based on the following instruction, generate a 3D transform JSON: "${transcription}"
    
    The output must strictly follow the schema:
    {
      "targetId": string, // ID of the object to move
      "position": { "x": number, "y": number, "z": number },
      "rotation": { "x": number, "y": number, "z": number } // Optional
    }`;

    return this.structuredOutputService.generateStructuredOutput(
      prompt,
      Transform3DSchema,
      { temperature: 0.1, maxTokens: 500 }
    );
  }
}
