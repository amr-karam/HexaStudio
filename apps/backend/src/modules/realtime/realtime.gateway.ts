import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { EventBus } from './event-bus.service';
import { TransformReasoningService } from '../ai/transform-reasoning.service';
import { AuthService } from '../auth/auth.service';
import { ProjectsService } from '../projects/projects.service';
import type { User } from '@hexastudio/types';

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
}

interface ApprovalUpdateEvent extends ApprovalEvent {
  actor: string;
  userId: string;
  timestamp: string;
}

/** Payload for relaying a WebRTC SDP offer. */
interface WebRTCOfferPayload {
  projectId: string;
  sdp: RTCSessionDescriptionInit;
  /** Optional — if omitted, the offer is broadcast to all peers in the room. */
  targetPeerId?: string;
}

/** Payload for relaying a WebRTC SDP answer. */
interface WebRTCAnswerPayload {
  projectId: string;
  sdp: RTCSessionDescriptionInit;
  targetPeerId: string;
}

/** Payload for relaying an ICE candidate (trickle ICE). */
interface WebRTCIceCandidatePayload {
  projectId: string;
  candidate: RTCIceCandidateInit;
  targetPeerId: string;
}

/** Payload for signalling a peer wants to establish WebRTC media. */
interface WebRTCPeerJoinPayload {
  projectId: string;
  mediaType: 'audio' | 'audio-video';
}

/** Payload for signalling a peer is leaving WebRTC media. */
interface WebRTCPeerLeavePayload {
  projectId: string;
}

// Same comma-split, trimmed list logic as main.ts. Wildcard ('*') is NOT used here
// because credentials:true combined with a wildcard origin is invalid and insecure.
// Read directly from process.env (not getEnv()) because decorator arguments are
// evaluated at module load — calling getEnv() here would cache the env snapshot
// before bootstrap/test setup finishes, starving later getEnv() consumers.
const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000,https://hexastudio.net,https://www.hexastudio.net')
  .split(',')
  .map((origin: string) => origin.trim());

@WebSocketGateway({
  cors: {
    origin: corsOrigins,
    credentials: true,
  },
  namespace: '/realtime',
})
@Injectable()
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name);
  private clientRooms = new Map<string, Set<string>>();

  constructor(
    private readonly eventBus: EventBus,
    private readonly transformReasoningService: TransformReasoningService,
    private readonly authService: AuthService,
    private readonly projectsService: ProjectsService,
  ) {}

  @WebSocketServer()
  server!: Server;

  afterInit() {
    this.logger.log('RealtimeGateway initialized — event bus ready');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        this.logger.warn(`Connection rejected: No token provided for socket ${client.id}`);
        client.disconnect();
        return;
      }
      const user = await this.authService.validateToken(token);
      client.data.user = user;
      this.clientRooms.set(client.id, new Set());
      this.logger.log(`Client connected to realtime socket: ${client.id} (User: ${user.username})`);
    } catch {
      this.logger.error(`Connection rejected: Invalid token for socket ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.clientRooms.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitToRoom(room: string, event: string, data: unknown) {
    if (this.server) {
      this.server.to(room).emit(event, data);
    }
  }

  @SubscribeMessage('join-project')
  async handleJoinProject(client: Socket, projectId: string) {
    const user = client.data.user as User | undefined;
    if (!user) throw new UnauthorizedException('Authentication required');

    try {
      await this.projectsService.getProjectBySlug(projectId);
    } catch {
      throw new UnauthorizedException('Project not found or access denied');
    }

    const room = `project:${projectId}`;
    await client.join(room);
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
    const user = client.data.user as User | undefined;
    if (!user) throw new UnauthorizedException('Authentication required');

    // Only staff (admin/editor — the "architect" tier) may perform approval actions.
    if (user.role !== 'admin' && user.role !== 'editor') {
      throw new UnauthorizedException('Only staff can perform approval actions');
    }

    const room = `project:${payload.projectId}`;
    const approvalUpdate: ApprovalUpdateEvent = {
      projectId: payload.projectId,
      phaseId: payload.phaseId,
      action: payload.action,
      comment: payload.comment,
      actor: user.username,
      userId: user.id,
      timestamp: new Date().toISOString(),
    };
    client.to(room).emit('approval:update', approvalUpdate);
    this.eventBus.emit('approval:action', approvalUpdate);
    return { event: 'approval:update', data: approvalUpdate };
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

  @SubscribeMessage('voice-transform')
  async handleVoiceTransform(
    client: Socket,
    payload: { projectId: string; audioData: string; mimeType: string },
  ) {
    try {
      const transform = await this.transformReasoningService.transformVoiceTo3D(
        payload.audioData,
        payload.mimeType,
        payload.projectId,
      );

      const room = `project:${payload.projectId}`;
      client.to(room).emit('3D_TRANSFORM_UPDATE', transform);
      return { event: '3D_TRANSFORM_UPDATE', data: transform };
    } catch (error) {
      this.logger.error(`Voice transform failed: ${(error as Error).message}`);
      return { event: 'error', data: { message: 'Transform processing failed' } };
    }
  }

  // ---------------------------------------------------------------------------
  // WebRTC Signaling Handlers
  // ---------------------------------------------------------------------------

  /**
   * Relays a WebRTC SDP offer from one peer to another (or all peers) in the
   * same project room.
   *
   * When `targetPeerId` is provided the offer is forwarded only to that
   * specific peer.  Otherwise it is broadcast to every other peer in the room.
   *
   * Receiving clients will get a `webrtc:offer` event with
   * `{ sdp: RTCSessionDescriptionInit, peerId: string }`.
   */
  @SubscribeMessage('webrtc:offer')
  handleWebRTCOffer(client: Socket, payload: WebRTCOfferPayload): void {
    const room = `project:${payload.projectId}`;
    const offerData = { sdp: payload.sdp, peerId: client.id };

    if (payload.targetPeerId) {
      client.to(payload.targetPeerId).emit('webrtc:offer', offerData);
      this.logger.debug(
        `WebRTC offer relayed from ${client.id} to target ${payload.targetPeerId}`,
      );
    } else {
      client.to(room).emit('webrtc:offer', offerData);
      this.logger.debug(
        `WebRTC offer broadcast from ${client.id} in room ${room}`,
      );
    }

    this.eventBus.emit('webrtc:offer', {
      projectId: payload.projectId,
      peerId: client.id,
      targetPeerId: payload.targetPeerId ?? null,
    });
  }

  /**
   * Relays a WebRTC SDP answer back to the offerer.
   *
   * The receiving client will get a `webrtc:answer` event with
   * `{ sdp: RTCSessionDescriptionInit, peerId: string }`.
   */
  @SubscribeMessage('webrtc:answer')
  handleWebRTCAnswer(client: Socket, payload: WebRTCAnswerPayload): void {
    client.to(payload.targetPeerId).emit('webrtc:answer', {
      sdp: payload.sdp,
      peerId: client.id,
    });

    this.logger.debug(
      `WebRTC answer relayed from ${client.id} to ${payload.targetPeerId}`,
    );

    this.eventBus.emit('webrtc:answer', {
      projectId: payload.projectId,
      peerId: client.id,
      targetPeerId: payload.targetPeerId,
    });
  }

  /**
   * Relays an ICE candidate between peers (trickle ICE).
   *
   * The receiving client will get a `webrtc:ice-candidate` event with
   * `{ candidate: RTCIceCandidateInit, peerId: string }`.
   */
  @SubscribeMessage('webrtc:ice-candidate')
  handleWebRTCIceCandidate(client: Socket, payload: WebRTCIceCandidatePayload): void {
    client.to(payload.targetPeerId).emit('webrtc:ice-candidate', {
      candidate: payload.candidate,
      peerId: client.id,
    });

    this.logger.debug(
      `WebRTC ICE candidate relayed from ${client.id} to ${payload.targetPeerId}`,
    );

    this.eventBus.emit('webrtc:ice-candidate', {
      projectId: payload.projectId,
      peerId: client.id,
      targetPeerId: payload.targetPeerId,
    });
  }

  /**
   * Signals that a peer wants to establish WebRTC media in the project room.
   *
   * Existing peers (excluding the sender) are notified so they can initiate
   * or accept a peer connection.  Receiving clients get a `webrtc:peer-joined`
   * event with `{ peerId: string, mediaType: 'audio' | 'audio-video' }`.
   */
  @SubscribeMessage('webrtc:peer-join')
  handleWebRTCPeerJoin(client: Socket, payload: WebRTCPeerJoinPayload): void {
    const room = `project:${payload.projectId}`;

    client.to(room).emit('webrtc:peer-joined', {
      peerId: client.id,
      mediaType: payload.mediaType,
    });

    this.logger.debug(
      `WebRTC peer ${client.id} joined (media: ${payload.mediaType}) in room ${room}`,
    );

    this.eventBus.emit('webrtc:peer-join', {
      projectId: payload.projectId,
      peerId: client.id,
      mediaType: payload.mediaType,
    });
  }

  /**
   * Signals that a peer is disconnecting from WebRTC media.
   *
   * Remaining peers in the room (excluding the sender) are notified so they
   * can clean up their RTCPeerConnection.  Receiving clients get a
   * `webrtc:peer-left` event with `{ peerId: string }`.
   */
  @SubscribeMessage('webrtc:peer-leave')
  handleWebRTCPeerLeave(client: Socket, payload: WebRTCPeerLeavePayload): void {
    const room = `project:${payload.projectId}`;

    client.to(room).emit('webrtc:peer-left', {
      peerId: client.id,
    });

    this.logger.debug(
      `WebRTC peer ${client.id} left media in room ${room}`,
    );

    this.eventBus.emit('webrtc:peer-leave', {
      projectId: payload.projectId,
      peerId: client.id,
    });
  }
}
