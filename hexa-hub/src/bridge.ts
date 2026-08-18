import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import winston from 'winston';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as http from 'http';

/* -------------------------------------------------------------------------- */
/*  Types & Interfaces                                                       */
/* -------------------------------------------------------------------------- */
interface Session {
  id: string;
  agent: string;
  messages: Array<{ role: string; content: string; timestamp: number }>;
  toolResults: ToolCallResult[];
  status: 'active' | 'paused' | 'completed';
  createdAt: number;
  lastActivity: number;
  ttl: number;
  expiresAt: number;
}

interface ToolCallResult {
  tool: string;
  args: any;
  timestamp: number;
  result?: any;
  error?: string;
}

interface McpBridgeConfig {
  logLevel?: 'error' | 'warn' | 'info' | 'debug' | 'silly';
  opencodePath?: string;
  gitPath?: string;
  repoPath?: string;
  webhookPort?: number;
  webhookSecret?: string;
  gitlabUrl?: string;
  gitlabToken?: string;
  sessionTtl?: number;
  persistence?: 'file' | 'redis' | 'none';
  cleanupInterval?: number;
}

/* -------------------------------------------------------------------------- */
/*  Logger Setup                                                             */
/* -------------------------------------------------------------------------- */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

/* -------------------------------------------------------------------------- */
/*  Helper Functions                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Safely compare two buffers (used for secret-key validation)
 */
function safeBufferEqual(a: Buffer, b: Buffer): boolean {
  return Buffer.compare(a, b) === 0;
}

/**
 * Validate a webhook token against a secret (constant-time compare)
 */
function isValidWebhookToken(token: string | string[] | undefined, secret: string): boolean {
  if (typeof token !== 'string') return false;
  const tokenBuf = Buffer.from(token);
  const secretBuf = Buffer.from(secret);
  return safeBufferEqual(tokenBuf, secretBuf);
}

/* -------------------------------------------------------------------------- */
/*  Session Management                                                       */
/* -------------------------------------------------------------------------- */
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

  constructor(id: string, agent: string) {
    this.id = id;
    this.agent = agent;
    this.messages = [];
    this.toolResults = [];
    this.status = 'active';
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
    this.ttl = 300000; // default 5 min
    this.expiresAt = Date.now() + this.ttl;
  }

  /** Refresh the TTL without changing the stored session */
  refreshTTL(): void {
    this.expiresAt = Date.now() + this.ttl;
  }

  /** Extend TTL by the given amount (ms) */
  extendTTL(ms: number): void {
    this.ttl = ms;
    this.expiresAt = Date.now() + ms;
  }
}
