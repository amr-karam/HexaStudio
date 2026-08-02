/**
 * HEXA Hub — Workflow Controller
 *
 * REST endpoints for managing workflow definitions and executions.
 * All endpoints require JWT authentication.
 *
 * @module workflow
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkflowEngineService } from './workflow-engine.service';
import {
  CreateWorkflowDto,
  UpdateWorkflowDto,
  ExecuteWorkflowDto,
  WorkflowDefinition,
  WorkflowExecution,
} from './workflow.types';

@ApiTags('Workflow Engine')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'workflows', version: ['1', VERSION_NEUTRAL] })
export class WorkflowController {
  constructor(private readonly engine: WorkflowEngineService) {}

  // ─── Workflow Definition Endpoints ──────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create a new workflow definition' })
  @ApiBody({ type: Object, description: 'Workflow definition payload' })
  @ApiResponse({ status: 201, description: 'Workflow created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid workflow definition' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createWorkflow(@Body() dto: CreateWorkflowDto): Promise<WorkflowDefinition> {
    return this.engine.createWorkflow(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all workflow definitions' })
  @ApiResponse({ status: 200, description: 'List of workflows' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listWorkflows(): Promise<WorkflowDefinition[]> {
    return this.engine.listWorkflows();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a workflow definition by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Workflow ID' })
  @ApiResponse({ status: 200, description: 'Workflow found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  async getWorkflow(@Param('id') id: string): Promise<WorkflowDefinition> {
    return this.engine.getWorkflow(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a workflow definition' })
  @ApiParam({ name: 'id', type: String, description: 'Workflow ID' })
  @ApiBody({ type: Object, description: 'Fields to update' })
  @ApiResponse({ status: 200, description: 'Workflow updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid update payload' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  async updateWorkflow(
    @Param('id') id: string,
    @Body() dto: UpdateWorkflowDto,
  ): Promise<WorkflowDefinition> {
    return this.engine.updateWorkflow(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a workflow definition' })
  @ApiParam({ name: 'id', type: String, description: 'Workflow ID' })
  @ApiResponse({ status: 200, description: 'Workflow deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  async deleteWorkflow(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.engine.deleteWorkflow(id);
    return { success: true };
  }

  // ─── Execution Endpoints ────────────────────────────────────────────────

  @Post(':id/execute')
  @ApiOperation({ summary: 'Manually execute a workflow' })
  @ApiParam({ name: 'id', type: String, description: 'Workflow ID' })
  @ApiBody({ type: Object, description: 'Optional initial context' })
  @ApiResponse({ status: 201, description: 'Workflow execution completed' })
  @ApiResponse({ status: 400, description: 'Workflow is disabled or invalid' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  async executeWorkflow(
    @Param('id') id: string,
    @Body() dto: ExecuteWorkflowDto,
  ): Promise<WorkflowExecution> {
    return this.engine.executeWorkflow(id, {}, dto.context);
  }

  @Get('executions')
  @ApiOperation({ summary: 'List workflow executions' })
  @ApiQuery({ name: 'workflowId', required: false, type: String, description: 'Filter by workflow ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max records (default 50)' })
  @ApiResponse({ status: 200, description: 'List of executions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listExecutions(
    @Query('workflowId') workflowId?: string,
    @Query('limit') limit?: string,
  ): Promise<WorkflowExecution[]> {
    return this.engine.listExecutions(
      workflowId,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Get('executions/:id')
  @ApiOperation({ summary: 'Get execution details' })
  @ApiParam({ name: 'id', type: String, description: 'Execution ID' })
  @ApiResponse({ status: 200, description: 'Execution found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Execution not found' })
  async getExecution(@Param('id') id: string): Promise<WorkflowExecution> {
    return this.engine.getExecution(id);
  }
}
