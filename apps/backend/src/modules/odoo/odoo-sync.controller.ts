import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  UseGuards,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OdooSyncService, SyncMetricEntry } from './odoo-sync.service';
import { ConflictResolutionService, ConflictAuditEntry } from './conflict-resolution.service';
import { DeltaSyncService } from './delta-sync.service';
import type {
  ResolveConflictDto,
  TriggerSyncDto,
  SyncConflict,
  SyncOperationResult,
  SyncStatusResponse,
} from '@hexastudio/types';

/**
 * Sync Engine management endpoints.
 *
 * Provides manual sync triggers, status monitoring, conflict inspection,
 * and conflict resolution capabilities.
 *
 * All endpoints are admin-only (`JwtAuthGuard` + `RolesGuard`).
 */
@ApiTags('Odoo Sync Engine')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller({ path: 'odoo/sync', version: ['1', VERSION_NEUTRAL] })
export class OdooSyncController {
  private readonly logger = new Logger(OdooSyncController.name);

  constructor(
    private readonly odooSyncService: OdooSyncService,
    private readonly conflictResolutionService: ConflictResolutionService,
    private readonly deltaSyncService: DeltaSyncService,
  ) {}

  // ──────────────────────────────────────────────────────────────────────────
  //  POST /odoo/sync/trigger
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Manually trigger a sync operation.
   *
   * - Without `entityType`: syncs all entity types.
   * - With `entityType`: syncs only that specific entity.
   * - With `fullSync: true`: forces a full sync instead of delta.
   */
  @Post('trigger')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Trigger a manual sync',
    description:
      'Runs a delta (incremental) sync for all entity types, or a specific entity. ' +
      'Set `fullSync: true` to force a full pull from Odoo.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        entityType: {
          type: 'string',
          description: 'Odoo model to sync (e.g. `crm.lead`). Omit to sync all.',
          enum: ['crm.lead', 'project.project', 'account.move', 'project.task', 'res.partner'],
        },
        fullSync: {
          type: 'boolean',
          description: 'Force a full sync instead of delta.',
          default: false,
        },
      },
    },
  })
  async triggerSync(@Body() dto: TriggerSyncDto): Promise<{
    success: boolean;
    results: SyncOperationResult[];
  }> {
    this.logger.log(`Manual sync trigger received: ${JSON.stringify(dto)}`);
    const results = await this.odooSyncService.triggerSync(dto);

    return {
      success: results.every((r) => r.success),
      results,
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  GET /odoo/sync/status
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Get comprehensive sync engine status.
   *
   * Returns delta cursors, metrics, circuit breaker state, and pending
   * conflict count for every managed entity type.
   */
  @Get('status')
  @ApiOperation({
    summary: 'Get sync engine status',
    description:
      'Returns per-entity sync metrics, circuit breaker state, ' +
      'cursor positions, and unresolved conflict count.',
  })
  async getSyncStatus(): Promise<SyncStatusResponse> {
    return this.odooSyncService.getSyncStatus();
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  GET /odoo/sync/metrics
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Get recent sync operation metrics (timing, success/failure).
   */
  @Get('metrics')
  @ApiOperation({
    summary: 'Get recent sync operation metrics',
    description: 'Returns the most recent sync operation entries including timing and success/failure.',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max entries (default 50)' })
  async getMetrics(@Query('limit') limit?: string): Promise<SyncMetricEntry[]> {
    return this.odooSyncService.getMetrics(limit ? parseInt(limit, 10) : 50);
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  GET /odoo/sync/conflicts
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * List all unresolved sync conflicts.
   *
   * Conflicts are created when both Odoo and HEXA Hub modify the same
   * record between sync cycles.
   */
  @Get('conflicts')
  @ApiOperation({
    summary: 'List unresolved sync conflicts',
    description:
      'Returns all conflicts that have not yet been resolved. Each conflict ' +
      'includes both the Odoo and HEXA Hub versions of the record.',
  })
  async getConflicts(): Promise<SyncConflict[]> {
    return this.odooSyncService.getConflicts();
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  GET /odoo/sync/conflicts/all
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * List all conflicts (resolved and unresolved).
   */
  @Get('conflicts/all')
  @ApiOperation({
    summary: 'List all sync conflicts (resolved and unresolved)',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllConflicts(@Query('limit') limit?: string) {
    const all = await this.conflictResolutionService.getAllConflicts();
    const max = limit ? parseInt(limit, 10) : 100;
    return all.slice(0, max);
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  GET /odoo/sync/conflicts/audit
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Retrieve the conflict resolution audit log.
   */
  @Get('conflicts/audit')
  @ApiOperation({
    summary: 'Get conflict resolution audit log',
    description: 'Returns recent conflict resolution entries for compliance and debugging.',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getConflictAuditLog(@Query('limit') limit?: string): Promise<ConflictAuditEntry[]> {
    return this.conflictResolutionService.getAuditLog(limit ? parseInt(limit, 10) : 50);
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  POST /odoo/sync/conflicts/:id/resolve
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Manually resolve a sync conflict.
   *
   * Strategies:
   * - `odoo-wins` — Accept the Odoo version
   * - `hexa-wins` — Accept the HEXA Hub version
   * - `merged` — Apply the provided merged values
   */
  @Post('conflicts/:id/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Manually resolve a sync conflict',
    description:
      'Resolves a pending conflict using the specified strategy. ' +
      'For `merged`, include `mergedValues` with the field values to apply.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Conflict UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['strategy', 'resolvedBy'],
      properties: {
        strategy: {
          type: 'string',
          enum: ['odoo-wins', 'hexa-wins', 'merged'],
          description: 'Resolution strategy',
        },
        resolvedBy: {
          type: 'string',
          description: 'User ID or `system`',
        },
        mergedValues: {
          type: 'object',
          description: 'Merged field values (required when strategy is `merged`)',
        },
      },
    },
  })
  async resolveConflict(
    @Param('id') conflictId: string,
    @Body() dto: ResolveConflictDto,
  ): Promise<{ success: boolean; conflict: SyncConflict }> {
    this.logger.log(
      `Manual conflict resolution: ${conflictId} → ${dto.strategy} by ${dto.resolvedBy}`,
    );

    const conflict = await this.odooSyncService.resolveConflict(
      conflictId,
      dto.strategy,
      dto.resolvedBy,
      dto.mergedValues,
    );

    return { success: true, conflict };
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  GET /odoo/sync/cursors
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Get all delta sync cursors.
   *
   * Each cursor tracks the last sync timestamp and record ID per entity,
   * used by the delta sync service to fetch only modified records.
   */
  @Get('cursors')
  @ApiOperation({
    summary: 'Get all sync cursors',
    description: 'Returns the delta sync cursor for each entity type.',
  })
  async getCursors() {
    return this.deltaSyncService.getAllCursors();
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  POST /odoo/sync/cursors/:entityType/reset
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Reset the cursor for a specific entity type, forcing a full sync
   * on the next cycle.
   */
  @Post('cursors/:entityType/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset an entity sync cursor',
    description:
      'Forces a full sync on the next cycle for the specified entity type ' +
      'by clearing its delta cursor.',
  })
  @ApiParam({ name: 'entityType', type: String, description: 'Odoo model name' })
  async resetCursor(@Param('entityType') entityType: string) {
    await this.deltaSyncService.resetCursor(entityType);
    return { success: true, message: `Cursor reset for ${entityType}` };
  }
}
