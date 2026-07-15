import { Injectable, Logger } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { VectorService } from '../vector/vector.service';
import { Project } from '@hexastudio/types';

/**
 * LightingService generates AI‑driven lighting suggestions for a given project.
 * It uses the same embedding pipeline to find similar lighting setups from a
 * curated reference collection ("lighting_presets").
 */
@Injectable()
export class LightingService {
  private readonly logger = new Logger(LightingService.name);

  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly vectorService: VectorService,
  ) {}

  /**
   * Generate lighting recommendation for a project.
   * Returns the top 3 preset IDs with similarity scores.
   */
  async recommendLighting(project: Project, limit = 3): Promise<{ id: string; score: number }[]> {
    const text = `${project.title}\n${project.description}\n${(project.services || []).join(', ')}`;
    const queryVector = await this.embeddingService.generateEmbedding(text);
    const response = await this.vectorService.searchByVector('lighting_presets', queryVector, limit);
    return response.results.map(r => ({ id: r.id, score: r.score ?? 0 }));
  }
}
