import { Injectable, Logger } from '@nestjs/common';
import { AiChatService, ChatCompletionResult } from './ai-chat.service';
import { TokenUsageService } from './token-usage.service';

export interface FusionCandidate {
  provider: string;
  model: string;
  result: ChatCompletionResult;
  score: number;
  rank: number;
  latencyMs: number;
  failure?: boolean;
  error?: string;
}

export type FusionMode = 'best' | 'merge';

export interface FusionRequest {
  messages: Array<{ role: string; content: string }>;
  models?: string[];
  mode?: FusionMode;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: 'json_object' } | { type: 'text' };
  weights?: {
    quality?: number;
    latency?: number;
    structure?: number;
  };
}

export interface FusionResponse {
  fused: {
    content: string;
    model: string;
    provider: string;
    mode: FusionMode;
  };
  candidates: FusionCandidate[];
  winnerScore: number;
  telemetry: {
    totalCandidates: number;
    successfulCandidates: number;
    failedCandidates: number;
    totalLatencyMs: number;
    winnerLatencyMs: number;
  };
}

@Injectable()
export class ModelFusionService {
  private readonly logger = new Logger(ModelFusionService.name);
  private readonly defaultWeights = { quality: 1, latency: 1, structure: 1 };

  constructor(
    private readonly aiChat: AiChatService,
    private readonly tokenUsage: TokenUsageService,
  ) {}

  async fuse(request: FusionRequest): Promise<FusionResponse> {
    const mode = request.mode ?? 'best';
    const models = request.models ?? this.resolveDefaultModels();
    const weights = { ...this.defaultWeights, ...request.weights };
    const candidates: FusionCandidate[] = [];
    const started = Date.now();

    this.logger.log(`Model fusion start: mode=${mode}, candidates=${models.join(', ')}`);

    const results = await Promise.allSettled(
      models.map(model => this.runCandidate(request, model)),
    );

    for (let i = 0; i < results.length; i++) {
      const settled = results[i];
      const model = models[i];

      if (settled.status === 'fulfilled') {
        candidates.push(settled.value);
      } else {
        const reason = settled.reason instanceof Error ? settled.reason.message : String(settled.reason);
        candidates.push({
          provider: 'unknown',
          model,
          result: { content: '', model, provider: 'unknown' },
          score: 0,
          rank: 0,
          latencyMs: 0,
          failure: true,
          error: reason,
        });
        this.logger.warn(`Fusion candidate failed: ${model} — ${reason}`);
      }
    }

    const successful = candidates.filter(c => !c.failure);
    const scored = successful.map(candidate => ({
      ...candidate,
      score: this.scoreCandidate(candidate, weights),
    }));

    scored.sort((a, b) => b.score - a.score);
    for (let i = 0; i < scored.length; i++) scored[i].rank = i + 1;

    const winner = scored[0] ?? candidates[0];
    const fusedContent = mode === 'merge' ? this.mergeCandidates(scored) : winner.result.content;
    const totalLatencyMs = Date.now() - started;

    await this.recordFusionTelemetry({
      mode,
      models,
      candidates,
      winner,
      totalLatencyMs,
      weights,
    });

    return {
      fused: {
        content: fusedContent,
        model: winner.result.model,
        provider: winner.result.provider,
        mode,
      },
      candidates: [...candidates].sort((a, b) => a.rank - b.rank || a.model.localeCompare(b.model)),
      winnerScore: scored[0]?.score ?? 0,
      telemetry: {
        totalCandidates: models.length,
        successfulCandidates: successful.length,
        failedCandidates: candidates.filter(c => c.failure).length,
        totalLatencyMs,
        winnerLatencyMs: winner.latencyMs,
      },
    };
  }

  private async runCandidate(request: FusionRequest, model: string): Promise<FusionCandidate> {
    const started = Date.now();
    const result = await this.aiChat.complete({
      messages: request.messages,
      model,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
      responseFormat: request.responseFormat,
    });

    return {
      provider: result.provider,
      model: result.model,
      result,
      score: 0,
      rank: 0,
      latencyMs: Date.now() - started,
      failure: false,
    };
  }

  private scoreCandidate(candidate: FusionCandidate, weights: FusionRequest['weights']): number {
    const text = candidate.result.content;
    const w = weights ?? this.defaultWeights;
    const lengthScore = Math.min(text.length / 400, 20) * (w.quality ?? 1);
    const latencyScore = Math.max(0, 20 - candidate.latencyMs / 1000) * (w.latency ?? 1);
    const structureScore = this.estimateStructureQuality(text) * (w.structure ?? 1);
    const nonEmptyScore = text.trim().length > 0 ? 40 : 0;

    return Number((lengthScore + latencyScore + structureScore + nonEmptyScore).toFixed(2));
  }

  private estimateStructureQuality(text: string): number {
    if (!text.trim()) return 0;
    const lines = text.split(/\n+/).filter(line => line.trim().length > 0);
    const listRatio = lines.filter(line => /^[-*\u2022\u00b7]/.test(line.trim()) || /^\d+\./.test(line.trim())).length / Math.max(lines.length, 1);
    const paragraphRatio = lines.filter(line => line.trim().length > 80).length / Math.max(lines.length, 1);

    return Number((listRatio * 10 + paragraphRatio * 10).toFixed(2));
  }

  private mergeCandidates(candidates: Array<{ result: ChatCompletionResult; score: number }>): string {
    if (!candidates.length) return '';
    const unique = new Map<string, { content: string; score: number }>();

    for (const candidate of candidates) {
      const key = candidate.result.content.trim();
      if (!key) continue;
      const existing = unique.get(key);
      if (!existing || candidate.score > existing.score) {
        unique.set(key, { content: candidate.result.content, score: candidate.score });
      }
    }

    const deduped = Array.from(unique.values()).sort((a, b) => b.score - a.score);
    if (!deduped.length) return candidates[0]?.result.content ?? '';

    if (deduped.length === 1) return deduped[0].content;

    const merged = [
      `Fused result from ${deduped.length} candidate outputs.`,
      '## Best candidate',
      deduped[0].content.trim(),
    ];

    if (deduped[1]?.content.trim()) {
      merged.push('## Alternative', deduped[1].content.trim());
    }

    return merged.join('\n\n');
  }

  private resolveDefaultModels(): string[] {
    const preferred = this.aiChat.selectModelFor('fuse multi-model analysis', {});
    const fallback = 'gpt-4o-mini';
    const models = [preferred.model];

    if (preferred.model !== fallback) {
      models.push(fallback);
    }

    return models;
  }

  private async recordFusionTelemetry(context: {
    mode: FusionMode;
    models: string[];
    candidates: FusionCandidate[];
    winner: FusionCandidate;
    totalLatencyMs: number;
    weights: FusionRequest['weights'];
  }): Promise<void> {
    try {
      const successful = context.candidates.filter(c => !c.failure);
      const failed = context.candidates.filter(c => c.failure);

      for (const candidate of successful) {
        const usage = candidate.result.usage ?? {};
        const totalTokens = (usage.promptTokens ?? 0) + (usage.completionTokens ?? 0);
        await this.tokenUsage.recordUsage({
          provider: candidate.provider as any,
          model: candidate.model,
          method: 'fusion',
          promptTokens: usage.promptTokens ?? 0,
          completionTokens: usage.completionTokens ?? 0,
          totalTokens,
        });
      }

      this.logger.log(
        `Fusion telemetry: mode=${context.mode}, total=${context.candidates.length}, success=${successful.length}, fail=${failed.length}, latencyMs=${context.totalLatencyMs}, winner=${context.winner.model}`
      );
    } catch (error) {
      this.logger.warn(`Fusion telemetry recording failed: ${error}`);
    }
  }
}
