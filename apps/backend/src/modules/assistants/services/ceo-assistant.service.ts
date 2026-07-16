import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { getEnv, Env } from '../../../config/env';

export interface AssistantResponse {
  content: string;
  confidence: number;
  actions?: string[];
  metadata?: Record<string, unknown>;
}

interface DashboardData {
  projects: {
    total: number;
    active: number;
    completed: number;
    atRisk: number;
  };
  revenue: {
    current: number;
    target: number;
    growth: number;
  };
  pipeline: {
    leads: number;
    qualified: number;
    proposals: number;
    conversion: number;
  };
  team: {
    utilization: number;
    capacity: number;
  };
}

@Injectable()
export class CEOAssistantService {
  private readonly logger = new Logger(CEOAssistantService.name);
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

  async getStrategicSummary(
    kpis: Record<string, number>,
    risks: string[],
    opportunities: string[],
  ): Promise<AssistantResponse> {
    if (!this.openai) {
      return this.fallbackSummary();
    }

    try {
      const prompt = `As the CEO Assistant for HexaStudio, provide a concise strategic summary.

KPIs: ${JSON.stringify(kpis, null, 2)}
Risks: ${risks.join(', ') || 'None identified'}
Opportunities: ${opportunities.join(', ') || 'None identified'}

Provide:
1. Executive summary (2-3 sentences)
2. Top 3 priorities
3. Immediate actions (if any)
4. Confidence score (0-1)

Return as JSON with: content, confidence, actions[], metadata`;

      const response = await this.openai!.chat.completions.create({
        model: this.env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: 'You are the CEO Assistant for HexaStudio, a high-end 3D architectural visualization studio. Provide strategic, concise, actionable insights.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('Empty response');

      return JSON.parse(content) as AssistantResponse;
    } catch (error) {
      this.logger.error(`CEO Assistant failed: ${error}`);
      return this.fallbackSummary();
    }
  }

  async getRiskAlert(risk: string, impact: 'low' | 'medium' | 'high', context: string): Promise<AssistantResponse> {
    if (!this.openai) {
      return { content: `Risk Alert: ${risk} (${impact}) - ${context}`, confidence: 0.5, actions: ['Review manually'] };
    }

    try {
      const response = await this.openai!.chat.completions.create({
        model: this.env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: 'You are the CEO Assistant. Provide concise risk alerts with actionable recommendations.' },
          { role: 'user', content: `Risk: ${risk}\nImpact: ${impact}\nContext: ${context}\n\nProvide: 1. Summary 2. Recommended actions 3. Escalation path 4. Confidence (0-1). Return JSON.` },
        ],
        temperature: 0.2,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      this.logger.error(`Risk alert failed: ${error}`);
      return { content: `Risk: ${risk}`, confidence: 0.5, actions: ['Review manually'] };
    }
  }

  async generateExecutiveSummary(
    dashboardData: DashboardData,
    period: string,
  ): Promise<AssistantResponse> {
    if (!this.openai) {
      return this.fallbackSummary();
    }

    try {
      const response = await this.openai!.chat.completions.create({
        model: this.env.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are the CEO Assistant for HexaStudio, a high-end architectural visualization studio.
Generate executive summaries with strategic insights, risk identification, and actionable recommendations.
Tone: Professional, concise, action-oriented.`,
          },
          {
            role: 'user',
            content: `Period: ${period}
Projects: ${JSON.stringify(dashboardData.projects)}
Revenue: ${JSON.stringify(dashboardData.revenue)}
Pipeline: ${JSON.stringify(dashboardData.pipeline)}
Team: ${JSON.stringify(dashboardData.team)}

Generate executive summary with key insights, risks, and recommendations.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1200,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      this.logger.error(`Executive summary failed: ${error}`);
      return this.fallbackSummary();
    }
  }

  async identifyStrategicRisks(
    data: {
      revenueTrend: number[];
      projectDelays: number;
      clientChurn: number;
      teamTurnover: number;
      marketSignals: string[];
    },
  ): Promise<AssistantResponse> {
    if (!this.openai) {
      return { content: 'Assistant unavailable', confidence: 0.3, actions: ['Configure OpenAI'] };
    }

    try {
      const response = await this.openai!.chat.completions.create({
        model: this.env.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: `Identify strategic risks for architectural visualization studio.
Return JSON: risks[] {risk, probability (0-1), impact (low/medium/high), mitigation}, overallRiskScore (0-1), confidence.`,
          },
          {
            role: 'user',
            content: `Revenue Trend: ${data.revenueTrend.join(', ')}
Project Delays: ${data.projectDelays}
Client Churn: ${data.clientChurn}%
Team Turnover: ${data.teamTurnover}%
Market: ${data.marketSignals.join(', ')}
Identify top 5 strategic risks.`,
          },
        ],
        temperature: 0.2,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content || '{}';
      return {
        content,
        confidence: 0.8,
        actions: ['Review risks'],
        metadata: { type: 'strategic-risks' }
      };
    } catch (error) {
      this.logger.error(`Strategic risk analysis failed: ${error}`);
      return { content: 'Risk analysis failed', confidence: 0.3, actions: ['Manual assessment'] };
    }
  }

  async generateBoardReport(
    quarter: string,
    kpis: Record<string, number>,
    initiatives: Array<{ name: string; status: string; progress: number }>,
  ): Promise<{
    executiveSummary: string;
    kpiAnalysis: Record<string, { value: number; trend: string; status: string }>;
    initiativeStatus: Array<{ name: string; status: string; risk: string }>;
    strategicPriorities: string[];
    confidence: number;
  }> {
    if (!this.openai) {
      return this.fallbackBoardReport();
    }

    try {
      const response = await this.openai!.chat.completions.create({
        model: this.env.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: `Generate board-ready quarterly report for HexaStudio CEO.
Tone: Executive, data-driven, forward-looking.
Return JSON with executiveSummary, kpiAnalysis, initiativeStatus, strategicPriorities, confidence.`,
          },
          {
            role: 'user',
            content: `Quarter: ${quarter}
KPIs: ${JSON.stringify(kpis)}
Initiatives: ${JSON.stringify(initiatives)}
Generate board report.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      this.logger.error(`Board report generation failed: ${error}`);
      return this.fallbackBoardReport();
    }
  }

  async answerStrategicQuestion(
    question: string,
    context: {
      dashboardData: Record<string, unknown>;
      recentDecisions: string[];
    },
  ): Promise<{
    answer: string;
    dataReferences: string[];
    confidence: number;
    followUpQuestions?: string[];
  }> {
    if (!this.openai) {
      return { answer: 'Assistant unavailable', dataReferences: [], confidence: 0.2 };
    }

    try {
      const response = await this.openai!.chat.completions.create({
        model: this.env.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are the CEO Assistant. Answer strategic questions using provided data.
Cite data sources. Be concise and actionable.
Return JSON: answer, dataReferences[], confidence, followUpQuestions?.`,
          },
          {
            role: 'user',
            content: `Question: ${question}
Context: ${JSON.stringify(context)}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      this.logger.error(`Strategic question failed: ${error}`);
      return { answer: 'Unable to answer', dataReferences: [], confidence: 0.2 };
    }
  }

  private fallbackSummary(): AssistantResponse {
    return {
      content: 'CEO Assistant unavailable',
      confidence: 0.2,
      actions: ['Configure OpenAI API key'],
      metadata: { fallback: true, timestamp: Date.now() },
    };
  }

  private fallbackBoardReport() {
    return {
      executiveSummary: 'Board report generation unavailable',
      kpiAnalysis: {},
      initiativeStatus: [],
      strategicPriorities: ['Configure OpenAI API key'],
      confidence: 0.2,
    };
  }
}