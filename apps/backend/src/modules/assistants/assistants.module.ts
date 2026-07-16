import { Module, forwardRef } from '@nestjs/common';
import { AIModule } from '../ai/ai.module';
import { ProjectsModule } from '../projects/projects.module';
import { VectorModule } from '../vector/vector.module';
import { AssistantsController } from './assistants.controller';
import { AssistantsService } from './assistants.service';
import { CEOAssistantService } from './services/ceo-assistant.service';
import { SalesAssistantService } from './services/sales-assistant.service';
import { PMAssistantService } from './services/pm-assistant.service';
import { LightingDesignerService } from './services/lighting-designer.service';
import { MaterialRecommenderService } from './services/material-recommender.service';
import { PredictiveAnalyticsService } from './services/predictive-analytics.service';

@Module({
  imports: [
    forwardRef(() => AIModule),
    forwardRef(() => ProjectsModule),
    forwardRef(() => VectorModule),
  ],
  controllers: [AssistantsController],
  providers: [
    AssistantsService,
    CEOAssistantService,
    SalesAssistantService,
    PMAssistantService,
    LightingDesignerService,
    MaterialRecommenderService,
    PredictiveAnalyticsService,
  ],
  exports: [
    AssistantsService,
    CEOAssistantService,
    SalesAssistantService,
    PMAssistantService,
    LightingDesignerService,
    MaterialRecommenderService,
    PredictiveAnalyticsService,
  ],
})
export class AssistantsModule {}