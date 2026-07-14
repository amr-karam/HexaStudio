import { Injectable, Logger } from '@nestjs/common';
import { EmbeddingService } from '../ai/embedding.service';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class VectorSyncService {
  private readonly logger = new Logger(VectorSyncService.name);

  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly projectsService: ProjectsService,
  ) {}

  async syncProject(slug: string): Promise<void> {
    try {
      this.logger.log(`Syncing vector for project: ${slug}`);
      const project = await this.projectsService.getProjectBySlug(slug);
      await this.embeddingService.embedProject(project);
    } catch (error) {
      this.logger.error(`Failed to sync vector for project ${slug}: ${error}`);
      throw error;
    }
  }

  async syncAllProjects(): Promise<void> {
    try {
      this.logger.log('Starting full vector re-index...');
      const { projects } = await this.projectsService.getAllProjects();
      
      const results = await Promise.allSettled(
        projects.map(p => this.embeddingService.embedProject(p))
      );

      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      this.logger.log(`Re-index complete. Succeeded: ${succeeded}, Failed: ${failed}`);
    } catch (error) {
      this.logger.error(`Critical error during full re-index: ${error}`);
      throw error;
    }
  }
}
