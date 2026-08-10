import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UnauthorizedException, UsePipes } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ValidationPipe } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { ProjectsService } from '../projects/projects.service';
import { RedisService } from '../storage/redis.service';
import { SyncStateDto } from './dto/sync-state.dto';
import type { User } from '@hexastudio/types';

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

  constructor(
    private readonly authService: AuthService,
    private readonly projectsService: ProjectsService,
    private readonly redisService: RedisService,
  ) {}

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
      this.logger.log(`Client connected to portal socket: ${client.id} (User: ${user.username})`);
    } catch {
      this.logger.error(`Connection rejected: Invalid token for socket ${client.id}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user as User | undefined;
    if (user && client.rooms) {
      for (const room of client.rooms) {
        if (room.startsWith('project_')) {
          const projectId = room.replace('project_', '');
          await this.removePresence(projectId, client.id);
        }
      }
    }
    this.logger.log(`Client disconnected from portal socket: ${client.id}`);
  }

  @SubscribeMessage('join_project')
  @UsePipes(new ValidationPipe())
  async handleJoinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { projectId: string },
  ) {
    const user = client.data.user as User | undefined;
    if (!user) throw new UnauthorizedException('Authentication required');

    try {
      await this.projectsService.getProjectBySlug(payload.projectId);
    } catch {
      throw new UnauthorizedException('Project not found or access denied');
    }

    const room = `project_${payload.projectId}`;
    await client.join(room);

    await this.addPresence(payload.projectId, client.id, user);

    this.logger.log(`User ${user.username} (${client.id}) joined room ${room}`);
    
    client.to(room).emit('user_joined', { 
      userName: user.username, 
      userRole: user.role, 
      socketId: client.id 
    });

    const activeUsers = await this.getPresence(payload.projectId);
    return { status: 'joined', room, activeUsers };
  }

  @SubscribeMessage('sync-state')
  @UsePipes(new ValidationPipe())
  handleSyncState(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SyncStateDto,
  ) {
    const user = client.data.user as User | undefined;
    if (!user) throw new UnauthorizedException('Authentication required');

    const room = `project_${payload.projectId}`;
    
    if (user.role === 'admin' || user.role === 'editor') {
      client.to(room).emit('architect_state_updated', {
        socketId: client.id,
        userName: user.username,
        ...payload,
        timestamp: new Date().toISOString(),
      });
    } else {
      client.to(room).emit('user_state_updated', {
        socketId: client.id,
        userName: user.username,
        ...payload,
        timestamp: new Date().toISOString(),
      });
    }
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

  broadcastToProject(projectId: string, event: string, data: Record<string, unknown>) {
    const room = `project_${projectId}`;
    if (this.server) {
      this.server.to(room).emit(event, { ...data, timestamp: new Date().toISOString() });
    }
  }

  private async addPresence(projectId: string, socketId: string, user: User) {
    const key = `presence:project:${projectId}`;
    const presenceData = JSON.stringify({
      socketId,
      userName: user.username,
      userRole: user.role,
      lastSeen: Date.now(),
    });
    await this.redisService.hset(key, socketId, presenceData);
    await this.redisService.expire(key, 3600);
  }

  private async removePresence(projectId: string, socketId: string) {
    const key = `presence:project:${projectId}`;
    await this.redisService.hdel(key, socketId);
  }

  private async getPresence(projectId: string) {
    const key = `presence:project:${projectId}`;
    const data = await this.redisService.hgetall(key);
    return Object.entries(data).map(([socketId, value]) => {
      const parsed = JSON.parse(value as string);
      return { socketId, ...parsed };
    });
  }
}
