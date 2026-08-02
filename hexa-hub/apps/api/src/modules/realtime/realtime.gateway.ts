import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

interface UserSession {
  userId: string;
  socketId: string;
  workspaceId?: string;
  roomId?: string;
}

@WebSocketGateway({
  cors: {
    origin: (process.env.CORS_ORIGINS ?? 'http://localhost:3001,http://localhost:3002,https://hexastudio.net').split(',').map((o) => o.trim()),
    credentials: true,
  },
  transports: ['websocket'],
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger(RealtimeGateway.name);
  private sessions = new Map<string, UserSession>();
  private userRooms = new Map<string, Set<string>>(); // userId -> Set<roomId>

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        this.logger.warn(`Socket ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const user = await this.authService.validateToken(token);
      if (!user) {
        this.logger.warn(`Socket ${client.id} connected with invalid token`);
        client.disconnect();
        return;
      }

      const session: UserSession = {
        userId: user.id,
        socketId: client.id,
      };

      this.sessions.set(client.id, session);
      this.logger.log(`Socket ${client.id} connected as user ${user.id}`);

      // Join user's personal room
      client.join(`user:${user.id}`);
      
      // Join default workspace room if available
      if (user.currentWorkspaceId) {
        client.join(`workspace:${user.currentWorkspaceId}`);
      }

      // Notify user's presence to workspace
      if (user.currentWorkspaceId) {
        this.server.to(`workspace:${user.currentWorkspaceId}`).emit('presence:joined', {
          userId: user.id,
          username: user.name || user.email,
          avatar: user.avatar,
          lastSeen: new Date(),
        });
      }

      client.emit('connected', { socketId: client.id });
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const session = this.sessions.get(client.id);
    if (!session) return;

    this.sessions.delete(client.id);
    
    // Notify workspace that user left
    if (session.workspaceId) {
      this.server.to(`workspace:${session.workspaceId}`).emit('presence:left', {
        userId: session.userId,
      });
    }

    this.logger.log(`Socket ${client.id} disconnected`);
  }

  @SubscribeMessage('join:channel')
  async handleJoinChannel(@MessageBody() data: { channelId: string }, @ConnectedSocket() client: Socket) {
    const session = this.sessions.get(client.id);
    if (!session) return;

    session.roomId = `channel:${data.channelId}`;
    client.join(session.roomId);
    
    // Join user's room for this channel
    client.join(`user:${session.userId}:channel:${data.channelId}`);

    // Add to user's room tracking
    if (!this.userRooms.has(session.userId)) {
      this.userRooms.set(session.userId, new Set());
    }
    this.userRooms.get(session.userId)?.add(data.channelId);

    // Notify channel members
    this.server.to(`channel:${data.channelId}`).emit('presence:joined', {
      userId: session.userId,
      socketId: client.id,
    });

    return { status: 'joined', channelId: data.channelId };
  }

  @SubscribeMessage('join:thread')
  async handleJoinThread(@MessageBody() data: { threadId: string }, @ConnectedSocket() client: Socket) {
    const session = this.sessions.get(client.id);
    if (!session) return;

    session.roomId = `thread:${data.threadId}`;
    client.join(session.roomId);
    
    // Join user's room for this thread
    client.join(`user:${session.userId}:thread:${data.threadId}`);

    // Notify thread participants
    this.server.to(`thread:${data.threadId}`).emit('presence:joined', {
      userId: session.userId,
      socketId: client.id,
    });

    return { status: 'joined', threadId: data.threadId };
  }

  @SubscribeMessage('typing')
  handleTyping(@MessageBody() data: { roomId: string; isTyping: boolean }, @ConnectedSocket() client: Socket) {
    const session = this.sessions.get(client.id);
    if (!session) return;

    const room = data.roomId.startsWith('channel:') ? `channel:${data.roomId.split(':')[1]}` : 
                 data.roomId.startsWith('thread:') ? `thread:${data.roomId.split(':')[1]}` : 
                 data.roomId;

    this.server.to(room).emit('typing', {
      userId: session.userId,
      isTyping: data.isTyping,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('message:create')
  async handleMessageCreate(@MessageBody() data: { channelId?: string; threadId?: string; content: string }, @ConnectedSocket() client: Socket) {
    const session = this.sessions.get(client.id);
    if (!session) return;

    // In a real implementation, you would save to database here
    // For now, just broadcast to the room
    const roomId = data.channelId ? `channel:${data.channelId}` : data.threadId ? `thread:${data.threadId}` : null;
    if (!roomId) return;

    const message = {
      id: `msg-${Date.now()}`,
      senderId: session.userId,
      content: data.content,
      timestamp: new Date(),
      reactions: [],
    };

    this.server.to(roomId).emit('message:created', message);

    return message;
  }

  @SubscribeMessage('mention:create')
  async handleMentionCreate(@MessageBody() data: { userId: string; content: string }, @ConnectedSocket() client: Socket) {
    const session = this.sessions.get(client.id);
    if (!session) return;

    // Notify the mentioned user
    this.server.to(`user:${data.userId}`).emit('notification:mention', {
      fromUserId: session.userId,
      content: data.content,
      timestamp: new Date(),
    });

    return { status: 'mention_sent', toUserId: data.userId };
  }

@SubscribeMessage('presence:ping')
   handlePing() {
     return { status: 'pong', timestamp: new Date() };
   }

  // Helper to broadcast typing indicators
  broadcastTyping(roomId: string, userId: string, isTyping: boolean) {
    this.server.to(roomId).emit('typing', { userId, isTyping, timestamp: new Date() });
  }

  // Helper to send notifications
sendNotification(userId: string, type: string, data: unknown) {
     this.server.to(`user:${userId}`).emit('notification', { type, data, timestamp: new Date() });
   }
}
