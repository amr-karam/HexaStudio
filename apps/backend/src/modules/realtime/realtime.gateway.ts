import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

interface AnnotationEvent {
  projectId: string;
  annotation: {
    id: string;
    type: 'text' | 'drawing' | 'pin';
    position: { x: number; y: number; z?: number };
    content: string;
    author: string;
    createdAt: string;
    resolved: boolean;
  };
}

interface ApprovalEvent {
  projectId: string;
  phaseId: string;
  action: 'submit' | 'approve' | 'reject' | 'revision';
  comment?: string;
  userId: string;
}

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/realtime',
})
@Injectable()
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name);
  private clientRooms = new Map<string, Set<string>>();

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    this.clientRooms.set(client.id, new Set());
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.clientRooms.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-project')
  handleJoinProject(client: Socket, projectId: string) {
    const room = `project:${projectId}`;
    client.join(room);
    const rooms = this.clientRooms.get(client.id);
    if (rooms) rooms.add(room);
    this.logger.log(`Client ${client.id} joined ${room}`);
    return { event: 'joined', data: { projectId } };
  }

  @SubscribeMessage('leave-project')
  handleLeaveProject(client: Socket, projectId: string) {
    const room = `project:${projectId}`;
    client.leave(room);
    const rooms = this.clientRooms.get(client.id);
    if (rooms) rooms.delete(room);
    return { event: 'left', data: { projectId } };
  }

  @SubscribeMessage('annotation:add')
  handleAddAnnotation(client: Socket, payload: AnnotationEvent) {
    const room = `project:${payload.projectId}`;
    client.to(room).emit('annotation:added', payload.annotation);
    return { event: 'annotation:added', data: payload.annotation };
  }

  @SubscribeMessage('annotation:resolve')
  handleResolveAnnotation(client: Socket, payload: { projectId: string; annotationId: string }) {
    const room = `project:${payload.projectId}`;
    client.to(room).emit('annotation:resolved', payload);
    return { event: 'annotation:resolved', data: payload };
  }

  @SubscribeMessage('approval:action')
  handleApprovalAction(client: Socket, payload: ApprovalEvent) {
    const room = `project:${payload.projectId}`;
    client.to(room).emit('approval:update', payload);
    return { event: 'approval:update', data: payload };
  }

  @SubscribeMessage('presence:join')
  handlePresenceJoin(client: Socket, payload: { projectId: string; user: string }) {
    const room = `project:${payload.projectId}`;
    client.to(room).emit('presence:joined', { user: payload.user, id: client.id });
    return { event: 'presence:joined', data: { user: payload.user, id: client.id } };
  }

  @SubscribeMessage('presence:leave')
  handlePresenceLeave(client: Socket, payload: { projectId: string }) {
    const room = `project:${payload.projectId}`;
    client.to(room).emit('presence:left', { id: client.id });
  }

  @SubscribeMessage('project:update')
  handleProjectUpdate(client: Socket, payload: { projectId: string; data: unknown }) {
    const room = `project:${payload.projectId}`;
    client.to(room).emit('project:updated', payload.data);
    return { event: 'project:updated', data: payload.data };
  }
}
