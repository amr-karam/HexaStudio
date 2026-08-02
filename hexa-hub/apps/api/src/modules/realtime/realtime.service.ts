import { Injectable, Logger } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';

@Injectable()
export class RealtimeService {
  private logger = new Logger(RealtimeService.name);

  constructor(private readonly gateway: RealtimeGateway) {}

  /** Broadcast typing indicator to a room */
  broadcastTyping(roomId: string, userId: string, isTyping: boolean) {
    this.gateway.broadcastTyping(roomId, userId, isTyping);
  }

  /** Send notification to a user */
sendNotification(userId: string, type: string, data: unknown) {
     this.gateway.sendNotification(userId, type, data);
   }

  /** Join user to a channel */
  joinChannel(userId: string, channelId: string) {
    // In a real implementation, you would track this in the service
    this.logger.log(`User ${userId} joined channel ${channelId}`);
  }

  /** Join user to a thread */
  joinThread(userId: string, threadId: string) {
    this.logger.log(`User ${userId} joined thread ${threadId}`);
  }

  /** Get online users in a workspace */
getOnlineUsers(): string[] {
     // In a real implementation, track this in the gateway
     return [];
   }
}
