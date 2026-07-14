import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { VectorService } from '../vector/vector.service';
import { Project } from '@hexastudio/types';


@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);

  constructor(
    @Inject(forwardRef(() => VectorService))
    private readonly vectorService: VectorService
  ) {}

  async embedProject(project: Project): Promise<void> {
    try {
      const text = `${project.title}\n${project.description}\n${(project.services || []).join(', ')}`;
      // In real implementation, call embedding API (OpenAI/Azure)
      // For MVP, we store the raw payload and a placeholder vector
      const vector = this.generatePlaceholderVector(text);
      await this.vectorService.upsert('projects', [
        {
          id: project.id,
          vector,
          payload: {
            slug: project.slug,
            title: project.title,
            category: project.category?.name,
            text,
          },
        },
      ]);
      this.logger.log(`Embedded project ${project.slug}`);
    } catch (error) {
      this.logger.error(`Failed to embed project ${project.slug}: ${error}`);
    }
  }

  private generatePlaceholderVector(text: string): number[] {
    // Deterministic pseudo-embedding for MVP (real impl uses model)
    const vector = new Array(1536).fill(0);
    for (let i = 0; i < text.length; i++) {
      vector[i % 1536] += text.charCodeAt(i);
    }
    return vector;
  }
}
