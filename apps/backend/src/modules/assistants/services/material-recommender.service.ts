import { Injectable, Logger } from '@nestjs/common';
import { AiChatService } from '../../ai/ai-chat.service';

export interface AssistantResponse {
  content: string;
  confidence: number;
  actions?: string[];
  metadata?: Record<string, unknown>;
}

@Injectable()
export class MaterialRecommenderService {
  private readonly logger = new Logger(MaterialRecommenderService.name);

  constructor(private readonly aiChat: AiChatService) {}

  async healthCheck(): Promise<boolean> {
    return this.aiChat.isAvailable;
  }

  async recommendMaterials(
    projectType: string,
    style: string,
    referenceImages: string[],
    sustainability: boolean,
  ): Promise<AssistantResponse> {
    if (!this.aiChat.isAvailable) {
      return this.fallbackMaterials();
    }

    try {
      const response = await this.aiChat.client!.chat.completions.create({
        model: this.aiChat.model,
        messages: [
          {
            role: 'system',
            content: `You are an AI Material Specialist. Recommend PBR materials for architectural visualization.
Return JSON: materials[] (name, type, baseColor, roughness, metalness, normalMap, displacementMap, sustainabilityScore), reasoning, confidence.`,
          },
          {
            role: 'user',
            content: `Project: ${projectType}\nStyle: ${style}\nReferences: ${referenceImages.length} images\nSustainability priority: ${sustainability}`,
          },
        ],
        temperature: 0.4,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      this.logger.error(`Material recommendation failed: ${error}`);
      return this.fallbackMaterials();
    }
  }

  async matchFromReference(
    referenceDescription: string,
    targetElement: string,
  ): Promise<AssistantResponse> {
    if (!this.aiChat.isAvailable) return this.fallbackMaterials();

    try {
      const response = await this.aiChat.client!.chat.completions.create({
        model: this.aiChat.model,
        messages: [
          { role: 'system', content: 'Match material from reference to target element.' },
          { role: 'user', content: `Reference: ${referenceDescription}\nTarget: ${targetElement}\nReturn matched material spec. JSON.` },
        ],
        temperature: 0.4,
        max_tokens: 600,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      this.logger.error(`Material matching failed: ${error}`);
      return this.fallbackMaterials();
    }
  }

  private fallbackMaterials(): AssistantResponse {
    return {
      content: 'Standard PBR material set',
      confidence: 0.4,
      actions: ['Manual material assignment required'],
      metadata: { fallback: true },
    };
  }
}
