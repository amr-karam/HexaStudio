import { Module, Global, forwardRef } from '@nestjs/common';
import { AIModule } from '../ai/ai.module';
import { ProjectsModule } from '../projects/projects.module';
import { VectorService } from './vector.service';
import { VectorSyncService } from './vector-sync.service';
import { RecommendationService } from './recommendation.service';
import { VectorController } from './vector.controller';

@Global()
@Module({
  imports: [forwardRef(() => AIModule), forwardRef(() => ProjectsModule)],
  controllers: [VectorController],
  providers: [VectorService, VectorSyncService, RecommendationService],
  exports: [VectorService, VectorSyncService, RecommendationService],
})
export class VectorModule {}
