import { Injectable, Logger } from '@nestjs/common';
import { CEOAssistantService } from './services/ceo-assistant.service';
import { SalesAssistantService } from './services/sales-assistant.service';
import { PMAssistantService } from './services/pm-assistant.service';
import { LightingDesignerService } from './services/lighting-designer.service';
import { MaterialRecommenderService } from './services/material-recommender.service';
import { PredictiveAnalyticsService } from './services/predictive-analytics.service';

@Injectable()
export class AssistantsService {
  private readonly logger = new Logger(AssistantsService.name);

  constructor(
    private readonly ceoAssistant: CEOAssistantService,
    private readonly salesAssistant: SalesAssistantService,
    private readonly pmAssistant: PMAssistantService,
    private readonly lightingDesigner: LightingDesignerService,
    private readonly materialRecommender: MaterialRecommenderService,
    private readonly predictiveAnalytics: PredictiveAnalyticsService,
  ) {}

  async healthCheck(): Promise<Record<string, boolean>> {
    const checks = await Promise.allSettled([
      this.ceoAssistant.healthCheck(),
      this.salesAssistant.healthCheck(),
      this.pmAssistant.healthCheck(),
      this.lightingDesigner.healthCheck(),
      this.materialRecommender.healthCheck(),
      this.predictiveAnalytics.healthCheck(),
    ]);

    return {
      ceoAssistant: checks[0].status === 'fulfilled' && checks[0].value,
      salesAssistant: checks[1].status === 'fulfilled' && checks[1].value,
      pmAssistant: checks[2].status === 'fulfilled' && checks[2].value,
      lightingDesigner: checks[3].status === 'fulfilled' && checks[3].value,
      materialRecommender: checks[4].status === 'fulfilled' && checks[4].value,
      predictiveAnalytics: checks[5].status === 'fulfilled' && checks[5].value,
    };
  }
}