import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { getEnv, Env } from '../../../config/env';

export interface AssistantResponse {
  content: string;
  confidence: number;
  actions?: string[];
  metadata?: Record<string, unknown>;
}

export interface RiskFactor {
  risk: string;
  probability: number;
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}

@Injectable()
export class PredictiveAnalyticsService {
  private readonly logger = new Logger(PredictiveAnalyticsService.name);
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

  async forecastTimeline(
    projectType: string,
    complexity: number,
    teamSize: number,
    scopeItems: number,
    historicalVelocity: number,
  ): Promise<AssistantResponse & { estimateDays: number; confidenceInterval: [number, number] }> {
    if (!this.openai) {
      return this.fallbackForecast();
    }

    try {
      const response = await this.openai!.chat.completions.create({
        model: this.env.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a Predictive Analytics engine for architectural visualization projects.
Forecast project timelines based on historical data and current parameters.
Return JSON: estimateDays, confidenceInterval [min, max], riskFactors[], milestones[], confidence.`,
          },
          {
            role: 'user',
            content: `Project: ${projectType}
Complexity: ${complexity}/10
Team: ${teamSize} people
Scope: ${scopeItems} items
Velocity: ${historicalVelocity} pts/week

Forecast timeline with milestones.`,
          },
        ],
        temperature: 0.2,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      this.logger.error(`Timeline forecast failed: ${error}`);
      return this.fallbackForecast();
    }
  }

  async assessRisks(
    projectData: {
      timeline: string;
      team: number;
      complexity: number;
      budget: number;
      scopeChanges: number;
      dependencies: string[];
    },
  ): Promise<AssistantResponse & { risks: RiskFactor[] }> {
    if (!this.openai) {
      return { content: 'Risk assessment unavailable', confidence: 0.3, actions: ['Manual assessment'], risks: [] };
    }

    try {
      const response = await this.openai!.chat.completions.create({
        model: this.env.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: `Predict project risks for architectural visualization.
Return JSON: risks[] {risk, probability (0-1), impact (low/medium/high), mitigation}, overallRiskScore (0-1), confidence.`,
          },
          {
            role: 'user',
            content: `Project: ${JSON.stringify(projectData)}
Identify top 5 risks with mitigations.`,
          },
        ],
        temperature: 0.2,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      this.logger.error(`Risk assessment failed: ${error}`);
      return { content: 'Risk assessment failed', confidence: 0.3, actions: ['Manual assessment'], risks: [] };
    }
  }

  async optimizeResources(
    projects: Array<{ id: string; team: number; deadline: string; priority: number }>,
    availableTeam: number,
  ): Promise<AssistantResponse & { allocation: Record<string, number> }> {
    if (!this.openai) {
      return { content: 'Resource optimization unavailable', confidence: 0.3, actions: ['Manual allocation'], allocation: {} };
    }

    try {
      const response = await this.openai!.chat.completions.create({
        model: this.env.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: `Optimize team allocation across architectural visualization projects.
Return JSON: allocation {projectId: teamSize}, rationale, conflicts[], confidence.`,
          },
          {
            role: 'user',
            content: `Projects: ${JSON.stringify(projects)}
Available Team: ${availableTeam} people
Optimize allocation.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      this.logger.error(`Resource optimization failed: ${error}`);
      return { content: 'Optimization failed', confidence: 0.3, actions: ['Manual allocation'], allocation: {} };
    }
  }

  async forecastBudget(
    projectType: string,
    scopeItems: string[],
    timeline: string,
    teamRate: number,
  ): Promise<AssistantResponse & { estimate: number; breakdown: Record<string, number> }> {
    if (!this.openai) {
      return { content: 'Budget forecast unavailable', confidence: 0.3, actions: ['Manual estimate'], estimate: 0, breakdown: {} };
    }

    try {
      const response = await this.openai!.chat.completions.create({
        model: this.env.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: `Forecast project budget for architectural visualization.
Return JSON: estimate, breakdown {labor, compute, materials, contingency}, confidence.`,
          },
          {
            role: 'user',
            content: `Type: ${projectType}
Scope: ${scopeItems.join(', ')}
Timeline: ${timeline}
Rate: $${teamRate}/hr
Forecast budget.`,
          },
        ],
        temperature: 0.2,
        max_tokens: 600,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      this.logger.error(`Budget forecast failed: ${error}`);
      return { content: 'Budget forecast failed', confidence: 0.3, actions: ['Manual estimate'], estimate: 0, breakdown: {} };
    }
  }

  private fallbackForecast(): AssistantResponse & { estimateDays: number; confidenceInterval: [number, number] } {
    return {
      content: 'Timeline forecast unavailable',
      confidence: 0.3,
      actions: ['Manual estimation required'],
      estimateDays: 0,
      confidenceInterval: [0, 0],
    };
  }
}
