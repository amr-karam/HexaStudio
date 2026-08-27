import { timingSafeEqual } from 'crypto';
import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import winston from 'winston';
import express, { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as http from 'http';

interface McpMessage {
  jsonrpc: '2.0';
  id?: string | number;
  method: string;
  params?: any;
}

interface McpResponse {
  jsonrpc: '2.0';
  id?: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

interface ToolCallResult {
  tool: string;
  args: any;
  timestamp: number;
  result?: any;
  error?: string;
}

class Session {
  id: string;
  agent: string;
  messages: Array<{ role: string; content: string; timestamp: number }>;
  toolResults: ToolCallResult[];
  status: 'active' | 'paused' | 'completed';
  createdAt: number;
  lastActivity: number;
  ttl: number;
  expiresAt: number;

  private onChange?: () => void;

  constructor(id: string, ttl: number, onChange?: () => void) {
    this.id = id;
    this.agent = '';
    this.messages = [];
    this.toolResults = [];
    this.status = 'active';
    this.ttl = ttl;
    this.createdAt = Date.now();
    this.lastActivity = this.createdAt;
    this.expiresAt = this.createdAt + ttl;
    this.onChange = onChange;
  }

  isExpired(): boolean {
    return Date.now() > this.expiresAt;
  }

  addMessage(role: string, content: string): void {
    this.messages.push({ role, content, timestamp: Date.now() });
    this.touch();
  }

  addToolResult(toolResult: ToolCallResult): void {
    this.toolResults.push(toolResult);
    this.touch();
  }

  refreshTTL(): void {
    this.expiresAt = Math.max(Date.now() + this.ttl, this.expiresAt + 1);
    this.touch();
  }

  extendTTL(ttlMs: number): void {
    this.ttl = ttlMs;
    this.expiresAt = Math.max(Date.now() + ttlMs, this.expiresAt + 1);
    this.touch();
  }

  pause(): void {
    this.status = 'paused';
  }

  resume(): void {
    this.status = 'active';
    this.touch();
  }

  complete(): void {
    this.status = 'completed';
  }

  private touch(): void {
    this.lastActivity = Date.now();
    this.onChange?.();
  }
}

interface McpBridgeConfig {
  logLevel?: string;
  opencodePath?: string;
  gitPath?: string;
  repoPath?: string;
  webhookPort?: number;
  webhookSecret?: string;
  gitlabUrl?: string;
  gitlabToken?: string;
  sessionTtl?: number;
  persistence?: 'file' | 'memory';
  cleanupInterval?: number;
  maxConcurrentSessions?: number;
  snapshotInterval?: number;
}

export class McpBridge extends EventEmitter {
  private logger: winston.Logger;
  private config: McpBridgeConfig;
  private sessions: Map<string, Session> = new Map();
  private webhookServer?: http.Server;
  private webhookApp?: express.Express;
  private gitlabToken?: string;
  private repoPath: string;
  private sessionTtl: number;
  private persistence: 'file' | 'memory';
  private cleanupInterval: number;
  private maxConcurrentSessions: number;
  private snapshotInterval: number;
