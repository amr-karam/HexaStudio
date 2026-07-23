import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { Env } from '../../config/env';

interface TokenUsageRecord {
  provider: 'openai' | 'gemini' | 'freetheai';
  model: string;
  method: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  timestamp: number;
  cost: number;
}

interface TokenUsageStats {
  totalTokens: number;
  totalCost: number;
  requestCount: number;
  averageTokensPerRequest: number;
  byProvider: Record<string, { tokens: number; cost: number; requests: number }>;
  byModel: Record<string, { tokens: number; cost: number; requests: number }>;
  byMethod: Record<string, { tokens: number; cost: number; requests: number }>;
}

// Token pricing (approximate USD per 1K tokens)
const TOKEN_PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gemini-3.5-flash': { input: 0.000075, output: 0.0003 },
  'gemini-3.1-pro-preview': { input: 0.0005, output: 0.0015 },
  'gemini-3.1-flash-lite-preview': { input: 0.00002, output: 0.00008 },
  'bbl/gemini-3.5-flash': { input: 0.00005, output: 0.0002 }, // FreeTheAI pricing
};

@Injectable()
export class TokenUsageService {
  private readonly logger = new Logger(TokenUsageService.name);
  private redis: Redis | null = null;
  private localUsage: TokenUsageRecord[] = [];
  private readonly maxLocalRecords = 1000;
  private readonly useLocalTracking = true;

  constructor(private configService: ConfigService<Env>) {
    try {
      this.redis = new Redis({
        host: this.configService.get('REDIS_HOST', 'redis'),
        port: this.configService.get('REDIS_PORT', 6379),
        password: this.configService.get('REDIS_PASSWORD'),
        db: 3, // Use separate DB for token tracking
        retryStrategy: (times) => {
          if (times > 3) {
            this.logger.error('Redis connection failed after 3 retries, using local tracking');
            return null;
          }
          return Math.min(times * 100, 3000);
        },
      });

      this.redis.on('error', (error) => {
        this.logger.warn(`Redis error, falling back to local tracking: ${error.message}`);
        this.redis = null;
      });

      this.redis.on('connect', () => {
        this.logger.log('Redis connected for token usage tracking');
      });
    } catch (error) {
      this.logger.warn(`Redis initialization failed, using local tracking: ${error}`);
      this.redis = null;
    }
  }

  /**
   * Record token usage for an AI request
   */
  async recordUsage(record: Omit<TokenUsageRecord, 'timestamp' | 'cost'>): Promise<void> {
    const pricing = TOKEN_PRICING[record.model] || { input: 0.0001, output: 0.0001 };
    const cost = (record.promptTokens / 1000) * pricing.input + 
                 (record.completionTokens / 1000) * pricing.output;

    const fullRecord: TokenUsageRecord = {
      ...record,
      timestamp: Date.now(),
      cost,
    };

    try {
      if (this.redis) {
        const key = `token-usage:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
        await this.redis.set(key, JSON.stringify(fullRecord), 'EX', 2592000); // 30 days TTL
        this.logger.debug(`Recorded token usage: ${record.totalTokens} tokens for ${record.model}`);
      } else if (this.useLocalTracking) {
        this.localUsage.push(fullRecord);
        // Maintain max records
        if (this.localUsage.length > this.maxLocalRecords) {
          this.localUsage = this.localUsage.slice(-this.maxLocalRecords);
        }
        this.logger.debug(`Recorded local token usage: ${record.totalTokens} tokens for ${record.model}`);
      }
    } catch (error) {
      this.logger.error(`Failed to record token usage: ${error}`);
    }
  }

  /**
   * Get token usage statistics for a time period
   */
  async getStats(hours: number = 24): Promise<TokenUsageStats> {
    const since = Date.now() - (hours * 60 * 60 * 1000);
    let records: TokenUsageRecord[] = [];

    try {
      if (this.redis) {
        const pattern = 'token-usage:*';
        const keys = await this.redis.keys(pattern);
        
        if (keys.length > 0) {
          const values = await this.redis.mget(...keys);
          records = values
            .filter((v): v is string => v !== null)
            .map(v => JSON.parse(v) as TokenUsageRecord)
            .filter(r => r.timestamp >= since);
        }
      } else if (this.useLocalTracking) {
        records = this.localUsage.filter(r => r.timestamp >= since);
      }
    } catch (error) {
      this.logger.error(`Failed to get token usage stats: ${error}`);
      return this.getEmptyStats();
    }

    return this.calculateStats(records);
  }

  /**
   * Calculate statistics from records
   */
  private calculateStats(records: TokenUsageRecord[]): TokenUsageStats {
    const stats: TokenUsageStats = {
      totalTokens: 0,
      totalCost: 0,
      requestCount: records.length,
      averageTokensPerRequest: 0,
      byProvider: {},
      byModel: {},
      byMethod: {},
    };

    for (const record of records) {
      stats.totalTokens += record.totalTokens;
      stats.totalCost += record.cost;

      // By provider
      if (!stats.byProvider[record.provider]) {
        stats.byProvider[record.provider] = { tokens: 0, cost: 0, requests: 0 };
      }
      stats.byProvider[record.provider].tokens += record.totalTokens;
      stats.byProvider[record.provider].cost += record.cost;
      stats.byProvider[record.provider].requests++;

      // By model
      if (!stats.byModel[record.model]) {
        stats.byModel[record.model] = { tokens: 0, cost: 0, requests: 0 };
      }
      stats.byModel[record.model].tokens += record.totalTokens;
      stats.byModel[record.model].cost += record.cost;
      stats.byModel[record.model].requests++;

      // By method
      if (!stats.byMethod[record.method]) {
        stats.byMethod[record.method] = { tokens: 0, cost: 0, requests: 0 };
      }
      stats.byMethod[record.method].tokens += record.totalTokens;
      stats.byMethod[record.method].cost += record.cost;
      stats.byMethod[record.method].requests++;
    }

    if (stats.requestCount > 0) {
      stats.averageTokensPerRequest = stats.totalTokens / stats.requestCount;
    }

    return stats;
  }

  /**
   * Get empty stats structure
   */
  private getEmptyStats(): TokenUsageStats {
    return {
      totalTokens: 0,
      totalCost: 0,
      requestCount: 0,
      averageTokensPerRequest: 0,
      byProvider: {},
      byModel: {},
      byMethod: {},
    };
  }

  /**
   * Get cost optimization recommendations
   */
  async getOptimizationRecommendations(): Promise<Array<{
    type: 'model-switch' | 'caching' | 'batching' | 'prompt-optimization';
    description: string;
    potentialSavings: number;
    priority: 'high' | 'medium' | 'low';
  }>> {
    const stats = await this.getStats(168); // Last 7 days
    const recommendations: Array<{
      type: 'model-switch' | 'caching' | 'batching' | 'prompt-optimization';
      description: string;
      potentialSavings: number;
      priority: 'high' | 'medium' | 'low';
    }> = [];

    // Check for expensive model usage
    for (const [model, data] of Object.entries(stats.byModel)) {
      const pricing = TOKEN_PRICING[model];
      if (pricing && (pricing.input > 0.001 || pricing.output > 0.001)) {
        const cheaperAlternative = this.findCheaperAlternative(model);
        if (cheaperAlternative) {
          const potentialSavings = this.calculatePotentialSavings(
            model,
            cheaperAlternative,
            data.tokens,
          );
          recommendations.push({
            type: 'model-switch',
            description: `Consider switching ${model} to ${cheaperAlternative} for ${data.requests} requests`,
            potentialSavings,
            priority: potentialSavings > 10 ? 'high' : 'medium',
          });
        }
      }
    }

    // Check for high-usage methods that could benefit from caching
    for (const [method, data] of Object.entries(stats.byMethod)) {
      if (data.requests > 100) {
        const potentialSavings = data.cost * 0.7; // Assume 70% cache hit rate
        recommendations.push({
          type: 'caching',
          description: `Implement caching for ${method} (${data.requests} requests)`,
          potentialSavings,
          priority: potentialSavings > 5 ? 'high' : 'medium',
        });
      }
    }

    // Check for methods with high token usage
    for (const [method, data] of Object.entries(stats.byMethod)) {
      if (data.averageTokensPerRequest > 1000) {
        const potentialSavings = (data.averageTokensPerRequest - 500) * 0.0001 * data.requests;
        recommendations.push({
          type: 'prompt-optimization',
          description: `Optimize prompts for ${method} (avg ${Math.round(data.averageTokensPerRequest)} tokens/request)`,
          potentialSavings,
          priority: 'medium',
        });
      }
    }

    return recommendations.sort((a, b) => b.potentialSavings - a.potentialSavings);
  }

  /**
   * Find cheaper alternative model
   */
  private findCheaperAlternative(currentModel: string): string | null {
    const currentPricing = TOKEN_PRICING[currentModel];
    if (!currentPricing) return null;

    const alternatives = Object.entries(TOKEN_PRICING)
      .filter(([model, pricing]) => 
        model !== currentModel && 
        pricing.input < currentPricing.input &&
        pricing.output < currentPricing.output
      )
      .sort((a, b) => (a[1].input + a[1].output) - (b[1].input + b[1].output));

    return alternatives.length > 0 ? alternatives[0][0] : null;
  }

  /**
   * Calculate potential savings from model switch
   */
  private calculatePotentialSavings(
    currentModel: string,
    newModel: string,
    tokens: number,
  ): number {
    const currentPricing = TOKEN_PRICING[currentModel];
    const newPricing = TOKEN_PRICING[newModel];

    if (!currentPricing || !newPricing) return 0;

    const currentCost = (tokens / 1000) * ((currentPricing.input + currentPricing.output) / 2);
    const newCost = (tokens / 1000) * ((newPricing.input + newPricing.output) / 2);

    return currentCost - newCost;
  }

  /**
   * Set budget alerts
   */
  async setBudgetAlert(dailyBudgetUSD: number): Promise<void> {
    const stats = await this.getStats(24);
    
    if (stats.totalCost >= dailyBudgetUSD) {
      this.logger.warn(`Daily budget exceeded: $${stats.totalCost.toFixed(2)} / $${dailyBudgetUSD.toFixed(2)}`);
      // Here you could send alerts via email, Slack, etc.
    }
  }

  /**
   * Get usage trends over time
   */
  async getTrends(days: number = 7): Promise<Array<{
    date: string;
    tokens: number;
    cost: number;
    requests: number;
  }>> {
    const trends: Array<{ date: string; tokens: number; cost: number; requests: number }> = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayStart = new Date(dateStr).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      
      let dayRecords: TokenUsageRecord[] = [];
      
      try {
        if (this.redis) {
          const pattern = 'token-usage:*';
          const keys = await this.redis.keys(pattern);
          
          if (keys.length > 0) {
            const values = await this.redis.mget(...keys);
            dayRecords = values
              .filter((v): v is string => v !== null)
              .map(v => JSON.parse(v) as TokenUsageRecord)
              .filter(r => r.timestamp >= dayStart && r.timestamp < dayEnd);
          }
        } else if (this.useLocalTracking) {
          dayRecords = this.localUsage.filter(r => r.timestamp >= dayStart && r.timestamp < dayEnd);
        }
      } catch (error) {
        this.logger.error(`Failed to get trends for ${dateStr}: ${error}`);
      }

      const dayStats = this.calculateStats(dayRecords);
      trends.push({
        date: dateStr,
        tokens: dayStats.totalTokens,
        cost: dayStats.totalCost,
        requests: dayStats.requestCount,
      });
    }

    return trends;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ redis: boolean; localTracking: boolean; recordsCount: number }> {
    return {
      redis: this.redis !== null,
      localTracking: this.useLocalTracking,
      recordsCount: this.localUsage.length,
    };
  }

  /**
   * Cleanup old records
   */
  async cleanup(daysToKeep: number = 30): Promise<void> {
    const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

    try {
      if (this.redis) {
        const pattern = 'token-usage:*';
        const keys = await this.redis.keys(pattern);
        
        for (const key of keys) {
          const value = await this.redis.get(key);
          if (value) {
            const record = JSON.parse(value) as TokenUsageRecord;
            if (record.timestamp < cutoff) {
              await this.redis.del(key);
            }
          }
        }
        
        this.logger.log('Cleaned up old token usage records from Redis');
      } else if (this.useLocalTracking) {
        const beforeCount = this.localUsage.length;
        this.localUsage = this.localUsage.filter(r => r.timestamp >= cutoff);
        const cleaned = beforeCount - this.localUsage.length;
        this.logger.log(`Cleaned up ${cleaned} old local token usage records`);
      }
    } catch (error) {
      this.logger.error(`Failed to cleanup token usage records: ${error}`);
    }
  }

  /**
   * Export usage data for analysis
   */
  async exportData(startDate: Date, endDate: Date): Promise<TokenUsageRecord[]> {
    const start = startDate.getTime();
    const end = endDate.getTime();
    let records: TokenUsageRecord[] = [];

    try {
      if (this.redis) {
        const pattern = 'token-usage:*';
        const keys = await this.redis.keys(pattern);
        
        if (keys.length > 0) {
          const values = await this.redis.mget(...keys);
          records = values
            .filter((v): v is string => v !== null)
            .map(v => JSON.parse(v) as TokenUsageRecord)
            .filter(r => r.timestamp >= start && r.timestamp <= end);
        }
      } else if (this.useLocalTracking) {
        records = this.localUsage.filter(r => r.timestamp >= start && r.timestamp <= end);
      }
    } catch (error) {
      this.logger.error(`Failed to export token usage data: ${error}`);
    }

    return records;
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.logger.log('Redis connection closed for token tracking');
    }
  }
}
