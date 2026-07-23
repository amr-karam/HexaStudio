import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from '../../config/env';

interface ModelCapabilities {
  maxTokens: number;
  reasoningAbility: 'low' | 'medium' | 'high';
  speed: 'fast' | 'medium' | 'slow';
  costPer1KTokens: number;
  supportsMultimodal: boolean;
  supportsFunctionCalling: boolean;
  supportsStructuredOutput: boolean;
}

interface QueryComplexity {
  score: number; // 0-100
  factors: {
    textLength: number;
    hasComplexLogic: boolean;
    requiresReasoning: boolean;
    hasMultimodal: boolean;
    requiresFunctionCalling: boolean;
    requiresStructuredOutput: boolean;
  };
}

interface ModelRecommendation {
  model: string;
  provider: 'openai' | 'gemini' | 'freetheai';
  confidence: number;
  reasoning: string;
}

// Model capabilities database
const MODEL_CAPABILITIES: Record<string, ModelCapabilities> = {
  // Gemini models
  'gemini-3.1-flash-lite-preview': {
    maxTokens: 65000,
    reasoningAbility: 'low',
    speed: 'fast',
    costPer1KTokens: 0.0001,
    supportsMultimodal: true,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true,
  },
  'gemini-3.5-flash': {
    maxTokens: 1000000,
    reasoningAbility: 'medium',
    speed: 'fast',
    costPer1KTokens: 0.000375,
    supportsMultimodal: true,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true,
  },
  'gemini-3.1-pro-preview': {
    maxTokens: 1000000,
    reasoningAbility: 'high',
    speed: 'medium',
    costPer1KTokens: 0.001,
    supportsMultimodal: true,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true,
  },
  // OpenAI models
  'gpt-4o-mini': {
    maxTokens: 128000,
    reasoningAbility: 'medium',
    speed: 'fast',
    costPer1KTokens: 0.000375,
    supportsMultimodal: true,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true,
  },
  'gpt-4o': {
    maxTokens: 128000,
    reasoningAbility: 'high',
    speed: 'medium',
    costPer1KTokens: 0.01,
    supportsMultimodal: true,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true,
  },
  // FreeTheAI gateway
  'bbl/gemini-3.5-flash': {
    maxTokens: 1000000,
    reasoningAbility: 'medium',
    speed: 'fast',
    costPer1KTokens: 0.000125,
    supportsMultimodal: true,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true,
  },
};

@Injectable()
export class ModelRouterService {
  private readonly logger = new Logger(ModelRouterService.name);
  private routingRules: Array<{
    condition: (complexity: QueryComplexity) => boolean;
    recommendation: string;
    priority: number;
  }> = [];

  constructor(private configService: ConfigService<Env>) {
    this.initializeRoutingRules();
  }

  /**
   * Initialize default routing rules
   */
  private initializeRoutingRules(): void {
    this.routingRules = [
      // High complexity queries get the best models
      {
        condition: (c) => c.score > 70 || c.factors.requiresReasoning,
        recommendation: 'gemini-3.1-pro-preview',
        priority: 100,
      },
      {
        condition: (c) => c.score > 60 && c.factors.requiresStructuredOutput,
        recommendation: 'gpt-4o',
        priority: 90,
      },
      // Medium complexity queries
      {
        condition: (c) => c.score > 40 || c.factors.requiresFunctionCalling,
        recommendation: 'gemini-3.5-flash',
        priority: 80,
      },
      {
        condition: (c) => c.score > 30 && c.factors.hasMultimodal,
        recommendation: 'gemini-3.5-flash',
        priority: 70,
      },
      // Low complexity queries get cheapest capable models
      {
        condition: (c) => c.score <= 30 && !c.factors.requiresFunctionCalling,
        recommendation: 'gemini-3.1-flash-lite-preview',
        priority: 50,
      },
      {
        condition: (c) => c.score <= 20,
        recommendation: 'bbl/gemini-3.5-flash',
        priority: 40,
      },
      // Default fallback
      {
        condition: () => true,
        recommendation: 'gemini-3.5-flash',
        priority: 10,
      },
    ];
  }

  /**
   * Analyze query complexity
   */
  analyzeQuery(query: string, options: {
    hasImages?: boolean;
    requiresFunctionCalling?: boolean;
    requiresStructuredOutput?: boolean;
    requiresReasoning?: boolean;
  } = {}): QueryComplexity {
    const factors = {
      textLength: Math.min(query.length / 1000, 100), // Normalize to 0-100
      hasComplexLogic: this.detectComplexLogic(query),
      requiresReasoning: options.requiresReasoning || this.detectReasoningRequirements(query),
      hasMultimodal: options.hasImages || false,
      requiresFunctionCalling: options.requiresFunctionCalling || false,
      requiresStructuredOutput: options.requiresStructuredOutput || false,
    };

    // Calculate overall complexity score
    const score = 
      (factors.textLength * 0.2) +
      (factors.hasComplexLogic ? 20 : 0) +
      (factors.requiresReasoning ? 30 : 0) +
      (factors.hasMultimodal ? 15 : 0) +
      (factors.requiresFunctionCalling ? 15 : 0) +
      (factors.requiresStructuredOutput ? 10 : 0);

    return {
      score: Math.min(score, 100),
      factors,
    };
  }

  /**
   * Detect complex logic in query
   */
  private detectComplexLogic(query: string): boolean {
    const complexPatterns = [
      /\b(analyze|compare|evaluate|assess|recommend|optimize)\b/i,
      /\b(if|then|else|unless|otherwise|however|although)\b/i,
      /\b(because|therefore|consequently|as a result)\b/i,
      /\b(step|phase|stage|process|workflow)\b/i,
      /\b(strategy|plan|roadmap|implementation)\b/i,
    ];

    return complexPatterns.some(pattern => pattern.test(query));
  }

  /**
   * Detect reasoning requirements
   */
  private detectReasoningRequirements(query: string): boolean {
    const reasoningPatterns = [
      /\b(why|how|what if|explain|justify|critique)\b/i,
      /\b(advantages|disadvantages|pros|cons|trade-offs)\b/i,
      /\b(implications|consequences|impact|effect)\b/i,
      /\b(scenario|hypothesis|assumption)\b/i,
      /\b(best practice|optimal|efficient|effective)\b/i,
    ];

    return reasoningPatterns.some(pattern => pattern.test(query));
  }

  /**
   * Recommend best model for query
   */
  recommendModel(query: string, options: {
    hasImages?: boolean;
    requiresFunctionCalling?: boolean;
    requiresStructuredOutput?: boolean;
    requiresReasoning?: boolean;
    preferredProvider?: 'openai' | 'gemini' | 'freetheai';
  } = {}): ModelRecommendation {
    const complexity = this.analyzeQuery(query, options);

    // Find matching routing rule
    const matchingRule = this.routingRules
      .filter(rule => rule.condition(complexity))
      .sort((a, b) => b.priority - a.priority)[0];

    let recommendedModel = matchingRule?.recommendation || 'gemini-3.5-flash';
    let provider = this.inferProvider(recommendedModel);

    // Apply provider preference if specified
    if (options.preferredProvider) {
      const alternativeModel = this.findAlternativeModel(
        recommendedModel,
        options.preferredProvider,
        complexity
      );
      if (alternativeModel) {
        recommendedModel = alternativeModel;
        provider = options.preferredProvider;
      }
    }

    // Verify model capabilities match requirements
    const capabilities = MODEL_CAPABILITIES[recommendedModel];
    if (!capabilities) {
      this.logger.warn(`Unknown model: ${recommendedModel}, falling back to gemini-3.5-flash`);
      recommendedModel = 'gemini-3.5-flash';
      provider = 'gemini';
    } else {
      // Check if model supports required features
      if (options.hasImages && !capabilities.supportsMultimodal) {
        const multimodalAlternative = this.findModelWithCapability('supportsMultimodal', provider);
        if (multimodalAlternative) {
          recommendedModel = multimodalAlternative;
        }
      }
      if (options.requiresFunctionCalling && !capabilities.supportsFunctionCalling) {
        const fcAlternative = this.findModelWithCapability('supportsFunctionCalling', provider);
        if (fcAlternative) {
          recommendedModel = fcAlternative;
        }
      }
      if (options.requiresStructuredOutput && !capabilities.supportsStructuredOutput) {
        const soAlternative = this.findModelWithCapability('supportsStructuredOutput', provider);
        if (soAlternative) {
          recommendedModel = soAlternative;
        }
      }
    }

    const confidence = this.calculateRecommendationConfidence(complexity, recommendedModel);

    return {
      model: recommendedModel,
      provider,
      confidence,
      reasoning: this.generateReasoning(complexity, recommendedModel),
    };
  }

  /**
   * Infer provider from model name
   */
  private inferProvider(model: string): 'openai' | 'gemini' | 'freetheai' {
    if (model.startsWith('gpt-')) return 'openai';
    if (model.startsWith('bbl/')) return 'freetheai';
    return 'gemini';
  }

  /**
   * Find alternative model for preferred provider
   */
  private findAlternativeModel(
    currentModel: string,
    preferredProvider: 'openai' | 'gemini' | 'freetheai',
    complexity: QueryComplexity
  ): string | null {
    const currentCapabilities = MODEL_CAPABILITIES[currentModel];
    if (!currentCapabilities) return null;

    // Find models from preferred provider with similar capabilities
    const alternatives = Object.entries(MODEL_CAPABILITIES)
      .filter(([model, caps]) => {
        const provider = this.inferProvider(model);
        if (provider !== preferredProvider) return false;

        // Check capability compatibility
        if (complexity.factors.hasMultimodal && !caps.supportsMultimodal) return false;
        if (complexity.factors.requiresFunctionCalling && !caps.supportsFunctionCalling) return false;
        if (complexity.factors.requiresStructuredOutput && !caps.supportsStructuredOutput) return false;

        return true;
      })
      .sort((a, b) => {
        // Prefer models with similar reasoning ability
        const reasoningMatch = Math.abs(
          this.getReasoningScore(a[1].reasoningAbility) - 
          this.getReasoningScore(currentCapabilities.reasoningAbility)
        );
        const bReasoningMatch = Math.abs(
          this.getReasoningScore(b[1].reasoningAbility) - 
          this.getReasoningScore(currentCapabilities.reasoningAbility)
        );

        if (reasoningMatch !== bReasoningMatch) {
          return reasoningMatch - bReasoningMatch;
        }

        // Then prefer cheaper
        return a[1].costPer1KTokens - b[1].costPer1KTokens;
      });

    return alternatives.length > 0 ? alternatives[0][0] : null;
  }

  /**
   * Find model with specific capability
   */
  private findModelWithCapability(
    capability: keyof ModelCapabilities,
    provider: 'openai' | 'gemini' | 'freetheai'
  ): string | null {
    const models = Object.entries(MODEL_CAPABILITIES)
      .filter(([model, caps]) => {
        return caps[capability] && this.inferProvider(model) === provider;
      })
      .sort((a, b) => a[1].costPer1KTokens - b[1].costPer1KTokens);

    return models.length > 0 ? models[0][0] : null;
  }

  /**
   * Get numerical score for reasoning ability
   */
  private getReasoningScore(ability: string): number {
    switch (ability) {
      case 'low': return 1;
      case 'medium': return 2;
      case 'high': return 3;
      default: return 0;
    }
  }

  /**
   * Calculate recommendation confidence
   */
  private calculateRecommendationConfidence(
    complexity: QueryComplexity,
    model: string
  ): number {
    const capabilities = MODEL_CAPABILITIES[model];
    if (!capabilities) return 0.5;

    let confidence = 0.8; // Base confidence

    // Adjust based on complexity match
    if (complexity.score > 70 && capabilities.reasoningAbility === 'high') {
      confidence += 0.1;
    } else if (complexity.score > 70 && capabilities.reasoningAbility !== 'high') {
      confidence -= 0.2;
    }

    if (complexity.score < 30 && capabilities.reasoningAbility === 'low') {
      confidence += 0.1;
    } else if (complexity.score < 30 && capabilities.reasoningAbility === 'high') {
      confidence -= 0.1; // Overkill but still works
    }

    // Adjust based on capability requirements
    if (complexity.factors.hasMultimodal && !capabilities.supportsMultimodal) {
      confidence -= 0.3;
    }
    if (complexity.factors.requiresFunctionCalling && !capabilities.supportsFunctionCalling) {
      confidence -= 0.3;
    }
    if (complexity.factors.requiresStructuredOutput && !capabilities.supportsStructuredOutput) {
      confidence -= 0.3;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Generate reasoning for recommendation
   */
  private generateReasoning(complexity: QueryComplexity, model: string): string {
    const capabilities = MODEL_CAPABILITIES[model];
    if (!capabilities) return `Fallback to ${model}`;

    const reasons: string[] = [];

    if (complexity.score > 70) {
      reasons.push('High complexity query requires advanced reasoning');
    } else if (complexity.score < 30) {
      reasons.push('Low complexity query can use efficient model');
    }

    if (complexity.factors.hasMultimodal) {
      reasons.push('Multimodal capabilities required');
    }
    if (complexity.factors.requiresFunctionCalling) {
      reasons.push('Function calling support needed');
    }
    if (complexity.factors.requiresStructuredOutput) {
      reasons.push('Structured output capability required');
    }

    if (capabilities.reasoningAbility === 'high') {
      reasons.push('Selected for advanced reasoning capabilities');
    } else if (capabilities.reasoningAbility === 'low') {
      reasons.push('Selected for cost efficiency on simple queries');
    }

    if (capabilities.speed === 'fast') {
      reasons.push('Fast response time for better UX');
    }

    return reasons.join('; ') || `Selected ${model} based on query analysis`;
  }

  /**
   * Get model capabilities
   */
  getModelCapabilities(model: string): ModelCapabilities | null {
    return MODEL_CAPABILITIES[model] || null;
  }

  /**
   * Get all available models
   */
  getAvailableModels(): Array<{ model: string; capabilities: ModelCapabilities }> {
    return Object.entries(MODEL_CAPABILITIES).map(([model, capabilities]) => ({
      model,
      capabilities,
    }));
  }

  /**
   * Add custom routing rule
   */
  addRoutingRule(rule: {
    condition: (complexity: QueryComplexity) => boolean;
    recommendation: string;
    priority: number;
  }): void {
    this.routingRules.push(rule);
    this.routingRules.sort((a, b) => b.priority - a.priority);
    this.logger.log(`Added routing rule for ${rule.recommendation} with priority ${rule.priority}`);
  }

  /**
   * Remove routing rule
   */
  removeRoutingRule(recommendation: string): void {
    const initialLength = this.routingRules.length;
    this.routingRules = this.routingRules.filter(rule => rule.recommendation !== recommendation);
    
    if (this.routingRules.length < initialLength) {
      this.logger.log(`Removed routing rule for ${recommendation}`);
    }
  }

  /**
   * Get routing statistics
   */
  async getRoutingStats(): Promise<{
    totalRules: number;
    rulesByPriority: Record<number, number>;
    availableModels: number;
  }> {
    const rulesByPriority: Record<number, number> = {};
    
    for (const rule of this.routingRules) {
      rulesByPriority[rule.priority] = (rulesByPriority[rule.priority] || 0) + 1;
    }

    return {
      totalRules: this.routingRules.length,
      rulesByPriority,
      availableModels: Object.keys(MODEL_CAPABILITIES).length,
    };
  }

  /**
   * Validate model availability
   */
  async validateModelAvailability(model: string): Promise<boolean> {
    const capabilities = MODEL_CAPABILITIES[model];
    if (!capabilities) {
      this.logger.warn(`Model ${model} not found in capabilities database`);
      return false;
    }

    // Check if provider is configured
    const provider = this.inferProvider(model);
    const apiKey = this.getProviderApiKey(provider);
    
    if (!apiKey) {
      this.logger.warn(`No API key configured for provider: ${provider}`);
      return false;
    }

    return true;
  }

  /**
   * Get API key for provider
   */
  private getProviderApiKey(provider: 'openai' | 'gemini' | 'freetheai'): string | null {
    switch (provider) {
      case 'openai':
        return this.configService.get('OPENAI_API_KEY') || null;
      case 'gemini':
        return this.configService.get('GEMINI_API_KEY') || null;
      case 'freetheai':
        return this.configService.get('FREETHEAI_API_KEY') || null;
      default:
        return null;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    availableModels: number;
    routingRules: number;
    configuredProviders: string[];
  }> {
    const providers = ['openai', 'gemini', 'freetheai'] as const;
    const configuredProviders = providers.filter(provider => 
      this.getProviderApiKey(provider) !== null
    );

    return {
      availableModels: Object.keys(MODEL_CAPABILITIES).length,
      routingRules: this.routingRules.length,
      configuredProviders,
    };
  }
}
