import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export interface CursorPosition {
  x: number;
  y: number;
  userName: string;
  userRole?: string;
}

@WebSocketGateway({
  namespace: '/portal-ws',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
})
export class ClientPortalGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ClientPortalGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to portal socket: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from portal socket: ${client.id}`);
  }

  @SubscribeMessage('join_project')
  handleJoinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { projectId: string; userName: string },
  ) {
    const room = `project_${payload.projectId}`;
    client.join(room);
    this.logger.log(`User ${payload.userName} (${client.id}) joined room ${room}`);
    client.to(room).emit('user_joined', { userName: payload.userName, socketId: client.id });
    return { status: 'joined', room };
  }

  @SubscribeMessage('cursor_move')
  handleCursorMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { projectId: string; cursor: CursorPosition },
  ) {
    const room = `project_${payload.projectId}`;
    client.to(room).emit('cursor_updated', {
      socketId: client.id,
      cursor: payload.cursor,
    });
  }

  @SubscribeMessage('approval_action')
  handleApprovalAction(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { projectId: string; approvalId: string; status: string; actor: string },
  ) {
    const room = `project_${payload.projectId}`;
    this.server.to(room).emit('approval_changed', {
      approvalId: payload.approvalId,
      status: payload.status,
      actor: payload.actor,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Approval ${payload.approvalId} changed to ${payload.status} by ${payload.actor}`);
  }

  /** Server helper to broadcast notification events */
  broadcastToProject(projectId: string, event: string, data: Record<string, unknown>) {
    const room = `project_${projectId}`;
    if (this.server) {
      this.server.to(room).emit(event, { ...data, timestamp: new Date().toISOString() });
    }
  }
}