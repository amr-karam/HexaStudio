import { Controller, Get, Post, Body, VERSION_NEUTRAL } from '@nestjs/common';
import { AssistantsService } from './assistants.service';
import { CEOAssistantService } from './services/ceo-assistant.service';
import { SalesAssistantService } from './services/sales-assistant.service';
import { PMAssistantService } from './services/pm-assistant.service';
import { LightingDesignerService } from './services/lighting-designer.service';
import { MaterialRecommenderService } from './services/material-recommender.service';
import { PredictiveAnalyticsService } from './services/predictive-analytics.service';

@Controller({ path: 'assistants', version: VERSION_NEUTRAL })
export class AssistantsController {
  constructor(
    private readonly assistantsService: AssistantsService,
    private readonly ceoAssistant: CEOAssistantService,
    private readonly salesAssistant: SalesAssistantService,
    private readonly pmAssistant: PMAssistantService,
    private readonly lightingDesigner: LightingDesignerService,
    private readonly materialRecommender: MaterialRecommenderService,
    private readonly predictiveAnalytics: PredictiveAnalyticsService,
  ) {}

  @Get('health')
  async healthCheck() {
    return this.assistantsService.healthCheck();
  }

  // CEO Assistant endpoints
  @Post('ceo/strategic-summary')
  async getStrategicSummary(
    @Body() body: { kpis: Record<string, number>; risks: string[]; opportunities: string[] },
  ) {
    return this.ceoAssistant.getStrategicSummary(body.kpis, body.risks, body.opportunities);
  }

  @Post('ceo/risk-alert')
  async getRiskAlert(
    @Body() body: { risk: string; impact: 'low' | 'medium' | 'high'; context: string },
  ) {
    return this.ceoAssistant.getRiskAlert(body.risk, body.impact, body.context);
  }

  @Post('ceo/executive-summary')
  async getExecutiveSummary(
    @Body() body: { dashboardData: any; period: string },
  ) {
    return this.ceoAssistant.generateExecutiveSummary(body.dashboardData, body.period);
  }

  @Post('ceo/strategic-risks')
  async getStrategicRisks(@Body() body: any) {
    return this.ceoAssistant.identifyStrategicRisks(body);
  }

  @Post('ceo/board-report')
  async getBoardReport(@Body() body: { quarter: string; kpis: any; initiatives: any[] }) {
    return this.ceoAssistant.generateBoardReport(body.quarter, body.kpis, body.initiatives);
  }

  @Post('ceo/question')
  async askQuestion(@Body() body: { question: string; context: any }) {
    return this.ceoAssistant.answerStrategicQuestion(body.question, body.context);
  }

  // Sales Assistant endpoints
  @Post('sales/qualify-lead')
  async qualifyLead(@Body() body: any) {
    return this.salesAssistant.qualifyLead(body.company, body.contact, body.budget, body.timeline, body.requirements);
  }

  @Post('sales/generate-proposal')
  async generateProposal(@Body() body: any) {
    return this.salesAssistant.generateProposal(body.clientName, body.projectType, body.scope, body.timeline, body.budget);
  }

  // PM Assistant endpoints
  @Post('pm/plan-sprint')
  async planSprint(@Body() body: any) {
    return this.pmAssistant.planSprint(body.teamCapacity, body.backlog, body.dependencies, body.velocity);
  }

  @Post('pm/predict-risk')
  async predictRisk(@Body() body: any) {
    return this.pmAssistant.predictRisk(body.projectData);
  }

  // Generative Visualization endpoints
  @Post('visualization/lighting-design')
  async designLighting(@Body() body: any) {
    return this.lightingDesigner.designLighting(
      body.projectType,
      body.style,
      body.space,
      body.mood,
      body.timeOfDay,
      body.constraints || [],
    );
  }

  @Post('visualization/lighting-from-reference')
  async lightingFromReference(@Body() body: { referenceImageDescription: string; targetSpace: string }) {
    return this.lightingDesigner.recommendFromReference(body.referenceImageDescription, body.targetSpace);
  }

  @Post('visualization/material-recommendations')
  async recommendMaterials(@Body() body: any) {
    return this.materialRecommender.recommendMaterials(
      body.projectType,
      body.style,
      body.referenceImages || [],
      body.sustainability || false,
    );
  }

  @Post('visualization/material-from-reference')
  async materialFromReference(@Body() body: { referenceDescription: string; targetElement: string }) {
    return this.materialRecommender.matchFromReference(body.referenceDescription, body.targetElement);
  }

  // Predictive Analytics endpoints
  @Post('analytics/forecast-timeline')
  async forecastTimeline(@Body() body: any) {
    return this.predictiveAnalytics.forecastTimeline(
      body.projectType,
      body.complexity,
      body.teamSize,
      body.scopeItems,
      body.historicalVelocity,
    );
  }

  @Post('analytics/assess-risks')
  async assessRisks(@Body() body: any) {
    return this.predictiveAnalytics.assessRisks(body.projectData);
  }

  @Post('analytics/optimize-resources')
  async optimizeResources(@Body() body: any) {
    return this.predictiveAnalytics.optimizeResources(body.projects, body.availableTeam);
  }

  @Post('analytics/forecast-budget')
  async forecastBudget(@Body() body: any) {
    return this.predictiveAnalytics.forecastBudget(
      body.projectType,
      body.scopeItems,
      body.timeline,
      body.teamRate,
    );
  }

  // Health check for all assistants
  @Get('health')
  async getHealth() {
    return this.assistantsService.healthCheck();
  }
}