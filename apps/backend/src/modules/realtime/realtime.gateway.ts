import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { EventBus } from './event-bus.service';

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

  constructor(private readonly eventBus: EventBus) {}

  @WebSocketServer()
  server!: Server;

  afterInit() {
    this.logger.log('RealtimeGateway initialized — event bus ready');
  }

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
    this.eventBus.emit('annotation:add', payload);
    return { event: 'annotation:added', data: payload.annotation };
  }

  @SubscribeMessage('annotation:resolve')
  handleResolveAnnotation(client: Socket, payload: { projectId: string; annotationId: string }) {
    const room = `project:${payload.projectId}`;
    client.to(room).emit('annotation:resolved', payload);
    this.eventBus.emit('annotation:resolve', payload);
    return { event: 'annotation:resolved', data: payload };
  }

  @SubscribeMessage('approval:action')
  handleApprovalAction(client: Socket, payload: ApprovalEvent) {
    const room = `project:${payload.projectId}`;
    client.to(room).emit('approval:update', payload);
    this.eventBus.emit('approval:action', payload);
    return { event: 'approval:update', data: payload };
  }

  @SubscribeMessage('presence:join')
  handlePresenceJoin(client: Socket, payload: { projectId: string; user: string }) {
    const room = `project:${payload.projectId}`;
    client.to(room).emit('presence:joined', { user: payload.user, id: client.id });
    this.eventBus.emit('presence:join', { projectId: payload.projectId, user: payload.user });
    return { event: 'presence:joined', data: { user: payload.user, id: client.id } };
  }

  @SubscribeMessage('presence:leave')
  handlePresenceLeave(client: Socket, payload: { projectId: string }) {
    const room = `project:${payload.projectId}`;
    client.to(room).emit('presence:left', { id: client.id });
    this.eventBus.emit('presence:leave', { projectId: payload.projectId, id: client.id });
  }

  @SubscribeMessage('project:update')
  handleProjectUpdate(client: Socket, payload: { projectId: string; data: unknown }) {
    const room = `project:${payload.projectId}`;
    client.to(room).emit('project:updated', payload.data);
    this.eventBus.emit('project:update', payload);
    return { event: 'project:updated', data: payload.data };
  }

  @SubscribeMessage('collab:join')
  handleCollabJoin(client: Socket, payload: { projectId: string; user: string; mode: 'ar' | 'vr' }) {
    const room = `project:${payload.projectId}`;
    client.to(room).emit('collab:peer-joined', { id: client.id, user: payload.user, mode: payload.mode });
    this.eventBus.emit('collab:join', { projectId: payload.projectId, user: payload.user, id: client.id });
    return { event: 'collab:joined', data: { id: client.id, user: payload.user, mode: payload.mode } };
  }

  @SubscribeMessage('collab:cursor')
  handleCollabCursor(client: Socket, payload: { projectId: string; position: { x: number; y: number; z: number }; rotation?: { x: number; y: number; z: number; w: number } }) {
    const room = `project:${payload.projectId}`;
    client.to(room).emit('collab:peer-cursor', {
      id: client.id,
      position: payload.position,
      rotation: payload.rotation,
    });
  }

  @SubscribeMessage('collab:leave')
  handleCollabLeave(client: Socket, payload: { projectId: string }) {
    const room = `project:${payload.projectId}`;
    client.to(room).emit('collab:peer-left', { id: client.id });
    this.eventBus.emit('collab:leave', { projectId: payload.projectId, id: client.id });
    return { event: 'collab:left', data: { id: client.id } };
  }

  /** Broadcast an event to all clients in a named room. */
  emitToRoom(room: string, event: string, data: unknown) {
    this.server?.to(room).emit(event, data);
  }
}
