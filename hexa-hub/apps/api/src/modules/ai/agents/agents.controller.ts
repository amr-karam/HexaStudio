import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Sse,
  MessageEvent,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AgentOrchestrator } from './agents.service';
import { z } from 'zod';

// ─── DTOs ───────────────────────────────────────────────────────────────────

const ChatRequestSchema = z.object({
  query: z.string().min(1),
  agentName: z.string().optional(),
  context: z.record(z.string(), z.unknown()).optional(),
  stream: z.boolean().optional().default(false),
});

type ChatRequest = z.infer<typeof ChatRequestSchema>;

// ─── Controller ─────────────────────────────────────────────────────────────

@UseGuards(JwtAuthGuard)
@Controller('ai/agents')
export class AgentsController {
  constructor(private readonly orchestrator: AgentOrchestrator) {}

  /**
   * POST /ai/agents/chat
   * Non-streaming chat — returns full response + metadata.
   */
  @Post('chat')
  async chat(@Req() req: unknown, @Body() body: ChatRequest) {
    ChatRequestSchema.parse(body);
    const userId = (req as { user: { id: string } }).user.id;
    const sessionId = `session_${userId}`;

    const { query, agentName, context } = body;

    if (agentName) {
      return this.orchestrator.runAgent(
        agentName,
        query,
        userId,
        sessionId,
        context,
      );
    }

    return this.orchestrator.chat(
      query,
      userId,
      sessionId,
      context,
    );
  }

  /**
   * GET /ai/agents/stream?query=hello&agentName=erp-analyst
   * Streaming chat via SSE — returns real-time agent events.
   */
  @Sse('stream')
  async *streamChat(
    @Req() req: unknown,
    @Query('query') query: string,
    @Query('agentName') agentName?: string,
  ): AsyncGenerator<MessageEvent> {
    const userId = (req as { user: { id: string } }).user.id;
    const sessionId = `session_${userId}`;

    if (!query) {
      yield {
        data: JSON.stringify({
          type: 'error',
          error: 'Query parameter is required',
        }),
      };
      return;
    }

    try {
      for await (const chunk of this.orchestrator.streamChat(
        query,
        userId,
        sessionId,
        undefined,
        (evt) => {
          // Events are emitted via the generator; the frontend picks up chunks
        },
      )) {
        yield {
          data: JSON.stringify({
            type: 'message.chunk',
            agentName: agentName ?? 'auto',
            content: chunk,
          }),
        };
      }
    } catch (error) {
      yield {
        data: JSON.stringify({
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
      };
    }
  }

  /**
   * GET /ai/agents/list
   * Returns all available agents with their personas.
   */
  @Get('list')
  getAgentList() {
    return { agents: this.orchestrator.getAgentPersonas() };
  }

  /**
   * GET /ai/agents/memory/session-stats
   * Returns session memory statistics.
   */
  @Get('memory/session-stats')
  getSessionStats(@Req() req: unknown) {
    const userId = (req as { user: { id: string } }).user.id;
    const sessionId = `session_${userId}`;
    return this.orchestrator.getSessionStats(sessionId);
  }

  /**
   * POST /ai/agents/memory/clear
   * Clears the session memory.
   */
  @Post('memory/clear')
  clearMemory(@Req() req: unknown) {
    const userId = (req as { user: { id: string } }).user.id;
    const sessionId = `session_${userId}`;
    this.orchestrator.clearSession(sessionId);
    return { success: true };
  }
}
