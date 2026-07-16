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
export class SalesAssistantService {
  private readonly logger = new Logger(SalesAssistantService.name);
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

  async qualifyLead(
    company: string,
    contact: string,
    budget: string,
    timeline: string,
    requirements: string,
  ): Promise<AssistantResponse> {
    if (!this.openai) {
      return this.fallbackQualification(company);
    }

    try {
      const response = await this.openai!.chat.completions.create({
        model: this.env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: 'You are the Sales Assistant for HexaStudio. Qualify architectural visualization leads.' },
          { role: 'user', content: `Lead: ${company} (${contact})
Budget: ${budget}
Timeline: ${timeline}
Requirements: ${requirements}

Provide: 1. Qualification score (0-100) 2. Fit assessment 3. Recommended approach 4. Confidence (0-1). Return JSON.` },
        ],
        temperature: 0.3,
        max_tokens: 600,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      this.logger.error(`Sales qualification failed: ${error}`);
      return this.fallbackQualification(company);
    }
  }

  async generateProposal(
    clientName: string,
    projectType: string,
    scope: string[],
    timeline: string,
    budget: string,
  ): Promise<AssistantResponse> {
    if (!this.openai) {
      return { content: `Proposal draft for ${clientName}`, confidence: 0.5, actions: ['Review manually'] };
    }

    try {
      const response = await this.openai!.chat.completions.create({
        model: this.env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: 'You are the Sales Assistant. Generate professional architectural visualization proposals.' },
          { role: 'user', content: `Client: ${clientName}\nType: ${projectType}\nScope: ${scope.join(', ')}\nTimeline: ${timeline}\nBudget: ${budget}\n\nGenerate: 1. Executive summary 2. Scope breakdown 3. Timeline 4. Investment 5. Next steps. Return JSON.` },
        ],
        temperature: 0.4,
        max_tokens: 1200,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      this.logger.error(`Proposal generation failed: ${error}`);
      return { content: 'Proposal generation failed', confidence: 0.3, actions: ['Manual creation required'] };
    }
  }

  private fallbackQualification(company: string): AssistantResponse {
    return {
      content: `Lead: ${company} - Manual qualification required`,
      confidence: 0.4,
      actions: ['Manual review', 'Schedule discovery call'],
    };
  }
}