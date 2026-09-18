import { Injectable, Logger } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class OperationalTriggerService {
  private readonly logger = new Logger(OperationalTriggerService.name);

  constructor(
    private readonly agentsService: AgentsService,
    private readonly projectsService: ProjectsService,
  ) {}

  /**
   * Handles operational events from external systems (Odoo, Strapi, Git)
   * and triggers proactive AI workflows.
   */
  async handleOperationalEvent(event: { type: string; payload: Record<string, unknown> }) {
    this.logger.log(`Operational event received: ${event.type}`);

    switch (event.type) {
      case 'PROJECT_CREATED':
        return this.triggerInitialResearch(event.payload);
      case 'DESIGN_ASSET_PUSHED':
        return this.triggerDesignAudit(event.payload);
      case 'CLIENT_PREFERENCE_UPDATED':
        return this.syncClientContext(event.payload);
      default:
        this.logger.debug(`No proactive workflow defined for event type: ${event.type}`);
    }
  }

  private async triggerInitialResearch(payload: Record<string, unknown>) {
    const projectSlug = payload.slug as string;
    this.logger.log(`Triggering proactive research for new project: ${projectSlug}`);

    // We invoke the agent as a background task to create the "Market Context Brief"
    // This is an autonomous 'fire-and-forget' loop that updates Redis memory
    try {
      await this.agentsService.chat(
        `A new project "${projectSlug}" has been created. 
        Please research the current architectural trends for its location and category, 
        and save the key findings as durable facts in your memory for this project.`,
        'researcher',
        `proj-res-${projectSlug}`,
      );
      this.logger.log(`Proactive research completed for ${projectSlug}`);
    } catch (err) {
      this.logger.error(`Proactive research failed for ${projectSlug}: ${err}`);
    }
  }

  private async triggerDesignAudit(payload: Record<string, unknown>) {
    const assetPath = payload.path as string;
    this.logger.log(`Triggering proactive design audit for asset: ${assetPath}`);

    try {
      await this.agentsService.chat(
        `A new 3D asset was pushed to ${assetPath}. 
        Audit this asset against the Absolute Zero luxury standards 
        defined in DESIGN_SYSTEM.md and report any deviations.`,
        'director',
        `audit-${assetPath}`,
      );
      this.logger.log(`Design audit completed for ${assetPath}`);
    } catch (err) {
      this.logger.error(`Design audit failed for ${assetPath}: ${err}`);
    }
  }

  private async syncClientContext(payload: Record<string, unknown>) {
    const clientId = payload.clientId as string;
    const preferences = payload.preferences as Record<string, unknown>;
    this.logger.log(`Syncing client preferences for ${clientId}`);

    // Directly update the semantic memory to ensure the 'Fact-First' recall is current
    // This bypasses the chat loop for direct state synchronization
    try {
      // We use a specialized session ID for client-wide preferences
      const sessionId = `client-prefs-${clientId}`;
      await this.agentsService.clearMemory('general', sessionId);
      
      // In a real implementation, we would call a dedicated 'setFact' method in AgentMemoryService
      // For now, we simulate it via a prompt to ensure the agent 'learns' the new preferences
      await this.agentsService.chat(
        `UPDATE CLIENT CONTEXT: Client ${clientId} now prefers ${JSON.stringify(preferences)}. 
        Commit this to your durable memory.`,
        'general',
        sessionId,
      );
    } catch (err) {
      this.logger.error(`Client context sync failed for ${clientId}: ${err}`);
    }
  }
}
