import { Injectable, Logger } from '@nestjs/common';
import { AiChatService } from '../../ai/ai-chat.service';

export interface AssistantResponse {
  content: string;
  confidence: number;
  actions?: string[];
  metadata?: Record<string, unknown>;
}

@Injectable()
export class PMAssistantService {
  private readonly logger = new Logger(PMAssistantService.name);

  constructor(private readonly aiChat: AiChatService) {}

  async healthCheck(): Promise<boolean> {
    return this.aiChat.isAvailable;
  }

  async planSprint(
    teamCapacity: number,
    backlog: string[],
    dependencies: Record<string, string[]>,
    velocity: number,
  ): Promise<AssistantResponse> {
    if (!this.aiChat.isAvailable) {
      return { content: 'Sprint planning requires AI', confidence: 0.3, actions: ['Manual planning'] };
    }

    try {
      const response = await this.aiChat.client!.chat.completions.create({
        model: this.aiChat.model,
        messages: [
          { role: 'system', content: 'You are the PM Assistant. Plan sprints for a 3D visualization team.' },
          { role: 'user', content: `Capacity: ${teamCapacity}h\nVelocity: ${velocity} pts\nBacklog: ${backlog.join(', ')}\nDependencies: ${JSON.stringify(dependencies)}\n\nPlan: 1. Sprint goal 2. Committed items 3. Risks 3. Confidence. JSON.` },
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      this.logger.error(`Sprint planning failed: ${error}`);
      return { content: 'Planning failed', confidence: 0.3, actions: ['Manual planning'] };
    }
  }

  async predictRisk(
    projectData: { timeline: string; team: number; complexity: number; budget: number },
  ): Promise<AssistantResponse> {
    if (!this.aiChat.isAvailable) {
      return { content: 'Risk prediction unavailable', confidence: 0.3, actions: ['Manual assessment'] };
    }

    try {
      const response = await this.aiChat.client!.chat.completions.create({
        model: this.aiChat.model,
        messages: [
          { role: 'system', content: 'You are the PM Assistant. Predict project risks.' },
          { role: 'user', content: `Project: ${JSON.stringify(projectData)}\nPredict: 1. Top 3 risks 2. Probability 3. Impact 3. Mitigation 4. Confidence. JSON.` },
        ],
        temperature: 0.2,
        max_tokens: 600,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      this.logger.error(`Risk prediction failed: ${error}`);
      return { content: 'Risk prediction failed', confidence: 0.3, actions: ['Manual assessment'] };
    }
  }
}
