import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { getEnv, Env } from '../../../config/env';

export interface AssistantResponse {
  content: string;
  confidence: number;
  actions?: string[];
  metadata?: Record<string, unknown>;
}

@Injectable()
export class LightingDesignerService {
  private readonly logger = new Logger(LightingDesignerService.name);
  private openai: OpenAI | null = null;
  private env: Env;

  constructor() {
    this.env = getEnv();
    if (this.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: this.env.OPENAI_API_KEY });
    }
  }

  async healthCheck(): Promise<boolean> {
    return !!this.openai;
  }

  async designLighting(
    projectType: string,
    style: string,
    space: string,
    mood: string,
    timeOfDay: string,
    constraints: string[],
  ): Promise<AssistantResponse> {
    if (!this.openai) {
      return this.fallbackDesign();
    }

    try {
      const response = await this.openai!.chat.completions.create({
        model: this.env.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an AI Lighting Designer for HexaStudio. Design architectural lighting presets.
Return JSON with: presetName, description, keyLight (type, intensity, colorTemp, position), fillLights[], accentLights[], mood, renderSettings (exposure, gamma, toneMapping), confidence (0-1).`,
          },
          {
            role: 'user',
            content: `Project: ${projectType}
Style: ${style}
Space: ${space}
Mood: ${mood}
Time of Day: ${timeOfDay}
Constraints: ${constraints.join(', ') || 'None'}

Design a complete lighting preset.`,
          },
        ],
        temperature: 0.4,
        max_tokens: 1200,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      this.logger.error(`Lighting design failed: ${error}`);
      return this.fallbackDesign();
    }
  }

  async recommendFromReference(
    referenceImageDescription: string,
    targetSpace: string,
  ): Promise<AssistantResponse> {
    if (!this.openai) return this.fallbackDesign();

    try {
      const response = await this.openai!.chat.completions.create({
        model: this.env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: 'Adapt lighting from reference to target space.' },
          { role: 'user', content: `Reference: ${referenceImageDescription}\nTarget: ${targetSpace}\nReturn adapted lighting preset. JSON.` },
        ],
        temperature: 0.4,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      this.logger.error(`Reference lighting failed: ${error}`);
      return this.fallbackDesign();
    }
  }

  private fallbackDesign(): AssistantResponse {
    return {
      content: 'Default three-point lighting preset',
      confidence: 0.4,
      actions: ['Manual lighting setup required'],
      metadata: { fallback: true },
    };
  }
}