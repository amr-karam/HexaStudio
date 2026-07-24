import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Content, GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { Env } from '../../config/env';

/**
 * Zod schemas for structured AI outputs
 */

// CEO Assistant Response Schema
export const CEOAssistantResponseSchema = z.object({
  content: z.string().min(10).max(2000),
  confidence: z.number().min(0).max(1),
  actions: z.array(z.string()).max(10),
  metadata: z.record(z.unknown()).optional(),
});

export type CEOAssistantResponse = z.infer<typeof CEOAssistantResponseSchema>;

// Strategic Analysis Schema
export const StrategicAnalysisSchema = z.object({
  executiveSummary: z.string().min(50).max(500),
  topPriorities: z.array(z.string().min(5).max(100)).max(5),
  immediateActions: z.array(z.string().min(10).max(200)).max(3),
  riskLevel: z.enum(['low', 'medium', 'high']),
  opportunities: z.array(z.string().min(10).max(150)).max(3),
});

export type StrategicAnalysis = z.infer<typeof StrategicAnalysisSchema>;

// Risk Assessment Schema
export const RiskAssessmentSchema = z.object({
  risks: z.array(z.object({
    risk: z.string().min(10).max(200),
    probability: z.number().min(0).max(1),
    impact: z.enum(['low', 'medium', 'high']),
    mitigation: z.string().min(20).max(300),
  })).max(5),
  overallRiskScore: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
});

export type RiskAssessment = z.infer<typeof RiskAssessmentSchema>;

// Design Recommendation Schema
export const DesignRecommendationSchema = z.object({
  recommendations: z.array(z.object({
    category: z.string().min(3).max(50),
    suggestion: z.string().min(20).max(300),
    priority: z.enum(['low', 'medium', 'high']),
    estimatedImpact: z.string().min(10).max(100),
  })).max(5),
  technicalFeasibility: z.number().min(0).max(1),
  implementationComplexity: z.enum(['low', 'medium', 'high']),
  confidence: z.number().min(0).max(1),
});

export type DesignRecommendation = z.infer<typeof DesignRecommendationSchema>;

// Material Analysis Schema
export const MaterialAnalysisSchema = z.object({
  materialType: z.string().min(3).max(50),
  properties: z.array(z.string().min(5).max(100)).max(5),
  sustainabilityScore: z.number().min(0).max(1),
  applications: z.array(z.string().min(10).max(100)).max(3),
  maintenance: z.string().min(20).max(300),
  costEstimate: z.enum(['low', 'medium', 'high', 'variable']),
});

export type MaterialAnalysis = z.infer<typeof MaterialAnalysisSchema>;

@Injectable()
export class StructuredOutputService {
  private readonly logger = new Logger(StructuredOutputService.name);
  private client: GoogleGenAI | null = null;

  constructor(private configService: ConfigService<Env>) {
    const apiKey = this.configService.get('GEMINI_API_KEY');
    if (apiKey) {
      this.client = new GoogleGenAI({ apiKey });
    }
  }

  get isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * Generate structured output with Zod validation
   */
  async generateStructuredOutput<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      retries?: number;
    } = {}
  ): Promise<T> {
    if (!this.client) {
      throw new Error('Gemini API is unavailable');
    }

    const {
      model = this.configService.get('GEMINI_MODEL') ?? 'gemini-3.5-flash',
      temperature = 0.3,
      maxTokens = 1000,
      retries = 2
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.client.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${prompt}\n\nReturn the response as valid JSON that conforms to this schema:\n${JSON.stringify(('shape' in schema ? (schema as unknown as { shape: unknown }).shape : schema), null, 2)}`
                }
              ]
            }
          ] as Content[],
          config: {
            temperature,
            maxOutputTokens: maxTokens,
            responseMimeType: 'application/json'
          }
        });

        const text = response.text ?? '';
        const parsed = JSON.parse(text);
        
        // Validate against Zod schema
        const validated = schema.parse(parsed);
        
        return validated;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < retries) {
          this.logger.warn(`Structured output generation attempt ${attempt + 1} failed, retrying...`);
          await this.delay(1000 * (attempt + 1)); // Exponential backoff
        }
      }
    }

    this.logger.error(`Structured output generation failed after ${retries + 1} attempts: ${lastError?.message}`);
    throw new Error(`Failed to generate valid structured output: ${lastError?.message}`);
  }

  /**
   * Generate CEO assistant response with validation
   */
  async generateCEOResponse(
    query: string,
    context: Record<string, unknown>
  ): Promise<CEOAssistantResponse> {
    const prompt = `As the CEO Assistant for HexaStudio, provide a strategic response to: "${query}"

Context: ${JSON.stringify(context, null, 2)}

Provide:
- A concise, professional response (10-2000 characters)
- Confidence score (0-1)
- 0-10 actionable items
- Optional metadata`;

    return this.generateStructuredOutput(
      prompt,
      CEOAssistantResponseSchema,
      { temperature: 0.3, maxTokens: 800 }
    );
  }

  /**
   * Generate strategic analysis with validation
   */
  async generateStrategicAnalysis(
    kpis: Record<string, number>,
    risks: string[],
    opportunities: string[]
  ): Promise<StrategicAnalysis> {
    const prompt = `As the CEO Assistant, provide a strategic analysis:

KPIs: ${JSON.stringify(kpis, null, 2)}
Risks: ${risks.join(', ') || 'None identified'}
Opportunities: ${opportunities.join(', ') || 'None identified'}

Provide:
- Executive summary (50-500 characters)
- Top 3-5 priorities
- 0-3 immediate actions
- Risk level assessment
- 0-3 key opportunities`;

    return this.generateStructuredOutput(
      prompt,
      StrategicAnalysisSchema,
      { temperature: 0.3, maxTokens: 1000 }
    );
  }

  /**
   * Generate risk assessment with validation
   */
  async generateRiskAssessment(
    data: {
      revenueTrend: number[];
      projectDelays: number;
      clientChurn: number;
      teamTurnover: number;
      marketSignals: string[];
    }
  ): Promise<RiskAssessment> {
    const prompt = `Identify strategic risks for architectural visualization studio:

Revenue Trend: ${data.revenueTrend.join(', ')}
Project Delays: ${data.projectDelays}
Client Churn: ${data.clientChurn}%
Team Turnover: ${data.teamTurnover}%
Market: ${data.marketSignals.join(', ')}

Identify top 5 strategic risks with probability, impact, and mitigation strategies.
Provide overall risk score (0-1) and confidence (0-1).`;

    return this.generateStructuredOutput(
      prompt,
      RiskAssessmentSchema,
      { temperature: 0.2, maxTokens: 1200 }
    );
  }

  /**
   * Generate design recommendations with validation
   */
  async generateDesignRecommendations(
    projectDescription: string,
    constraints: string[],
    goals: string[]
  ): Promise<DesignRecommendation> {
    const prompt = `Provide design recommendations for architectural project:

Project: ${projectDescription}
Constraints: ${constraints.join(', ') || 'None specified'}
Goals: ${goals.join(', ') || 'None specified'}

Provide 0-5 design recommendations with category, suggestion, priority, and estimated impact.
Assess technical feasibility (0-1), implementation complexity, and confidence (0-1).`;

    return this.generateStructuredOutput(
      prompt,
      DesignRecommendationSchema,
      { temperature: 0.4, maxTokens: 1500 }
    );
  }

  /**
   * Generate material analysis with validation
   */
  async generateMaterialAnalysis(
    materialDescription: string,
    applicationContext: string
  ): Promise<MaterialAnalysis> {
    const prompt = `Analyze architectural material:

Material: ${materialDescription}
Application: ${applicationContext}

Provide:
- Material type
- 0-5 key properties
- Sustainability score (0-1)
- 0-3 suitable applications
- Maintenance considerations
- Cost estimate level`;

    return this.generateStructuredOutput(
      prompt,
      MaterialAnalysisSchema,
      { temperature: 0.3, maxTokens: 800 }
    );
  }

  /**
   * Validate existing data against schema
   */
  validateData<T>(data: unknown, schema: z.ZodSchema<T>): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.logger.error(`Validation failed: ${JSON.stringify(error.errors, null, 2)}`);
        throw new Error(`Data validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  /**
   * Helper method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate JSON schema from Zod schema for API documentation
   */
  getJsonSchema<T>(schema: z.ZodSchema<T>): Record<string, unknown> {
    if ('shape' in schema) {
      return (schema as unknown as { shape: Record<string, unknown> }).shape;
    }
    return {};
  }
}
