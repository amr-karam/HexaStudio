import { timingSafeEqual } from 'crypto';
import { EventEmitter } from 'events';
import { spawn, ChildProcess, execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import winston from 'winston';
import express, { Request, Response, NextFunction } from 'express';
import * as http from 'http';

interface ToolCallResult {
  tool: string;
  args: Record<string, unknown>;
  timestamp: number;
  result?: unknown;
  error?: string;
}

interface GitLabPayload {
  object_kind?: string;
  object_attributes?: {
    action?: string;
    iid?: number;
    id?: number;
    title?: string;
    description?: string;
  };
  project?: { id?: number };
  labels?: Array<{ title?: string; name?: string }>;
}

interface ToolResult {
  success: boolean;
  output?: unknown;
  sessionId?: string;
  summary?: string;
  files?: Array<{ status: string; file: string }>;
  clean?: boolean;
  message?: string;
  branch?: string;
  timestamp?: number;
  error?: string;
}

interface MergeRequestResult {
  success: boolean;
  mrId?: number;
  webUrl?: string;
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
    this.lastActivity = Math.max(Date.now(), this.lastActivity + 1);
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
  private sessionDir: string;
  private cleanupTimer?: NodeJS.Timeout;
  private snapshotTimer?: NodeJS.Timeout;

  constructor(config: McpBridgeConfig = {}) {
    super();
    this.config = {
      logLevel: 'info',
      opencodePath: process.env.OPENCODE_PATH || '/usr/local/bin/opencode',
      gitPath: process.env.GIT_PATH || 'git',
      repoPath: process.env.REPO_PATH || process.cwd(),
      webhookPort: parseInt(process.env.WEBHOOK_PORT || '3000', 10),
      webhookSecret: process.env.WEBHOOK_SECRET,
      gitlabUrl: process.env.GITLAB_URL,
      gitlabToken: process.env.GITLAB_TOKEN,
      sessionTtl: 30 * 60 * 1000,
      persistence: 'memory',
      cleanupInterval: 60_000,
      maxConcurrentSessions: 1000,
      snapshotInterval: 1000,
      ...config,
    };

    this.logger = winston.createLogger({
      level: this.config.logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
      ],
    });

    this.repoPath = this.config.repoPath ?? process.cwd();
    this.gitlabToken = this.config.gitlabToken;
    this.sessionTtl = this.config.sessionTtl ?? 30 * 60 * 1000;
    this.persistence = this.config.persistence ?? 'memory';
    this.cleanupInterval = this.config.cleanupInterval ?? 60_000;
    this.maxConcurrentSessions = this.config.maxConcurrentSessions ?? 1000;
    this.snapshotInterval = this.config.snapshotInterval ?? 1000;
    this.sessionDir = path.join(this.repoPath, 'data');
  }

  async start(): Promise<void> {
    this.logger.info('Starting MCP Bridge');
    await this.ensureDirectories();
    await this.loadPersistedSessions();
    this.startTimers();
    await this.startWebhookServer();
    this.emit('started');
  }

  async stop(): Promise<void> {
    this.logger.info('Stopping MCP Bridge');
    this.stopTimers();
    await this.stopWebhookServer();
    await this.persistAllSessions();
    this.emit('stopped');
  }

  private async ensureDirectories(): Promise<void> {
    const dirs = ['logs', 'data'];
    for (const dir of dirs) {
      const fullPath = path.join(this.repoPath, dir);
      try {
        await fs.mkdir(fullPath, { recursive: true });
      } catch (error) {
        this.logger.error(`Failed to create directory ${fullPath}`, error);
      }
    }
  }

  private async startWebhookServer(): Promise<void> {
    this.webhookApp = express();
    this.webhookApp.use(express.json({ limit: '10mb' }));

    this.webhookApp.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
      this.logger.error('Webhook server error', { error: err.message, path: req.path });
      res.status(500).json({ error: 'Internal server error' });
    });

    this.webhookApp.get('/health', (_req: Request, res: Response) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        activeSessions: this.getAllSessions().length,
      });
    });

    this.webhookApp.post('/webhook/gitlab', async (req: Request, res: Response) => {
      try {
        const token = req.headers['x-gitlab-token'];
        if (this.config.webhookSecret && !this.isValidWebhookToken(token, this.config.webhookSecret)) {
          this.logger.warn('Invalid webhook token', { tokenLength: token?.toString().length });
          return res.status(401).json({ error: 'Unauthorized' });
        }

        this.logger.info('GitLab webhook received', { event: req.body.object_kind });
        await this.handleGitLabWebhook(req.body);
        res.status(200).json({ status: 'processed' });
      } catch (error) {
        this.logger.error('Webhook processing failed', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    this.webhookServer = this.webhookApp.listen(this.config.webhookPort, () => {
      this.logger.info(`Webhook server listening on port ${this.config.webhookPort}`);
    });

    this.webhookServer.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        this.logger.warn(`Webhook port ${this.config.webhookPort} already in use; webhook server disabled`);
      } else {
        this.logger.error('Webhook server error', error);
      }
    });
  }

  private async stopWebhookServer(): Promise<void> {
    const server = this.webhookServer;
    if (!server) {
      return;
    }
    return new Promise<void>((resolve) => {
      if (!server.listening) {
        resolve();
        return;
      }
      server.close(() => {
        this.logger.info('Webhook server stopped');
        resolve();
      });
    });
  }

  private isValidWebhookToken(token: string | string[] | undefined, secret: string): boolean {
    if (typeof token !== 'string') {
      return false;
    }

    const tokenBuffer = Buffer.from(token);
    const secretBuffer = Buffer.from(secret);
    if (tokenBuffer.length !== secretBuffer.length) {
      return false;
    }
    return timingSafeEqual(tokenBuffer, secretBuffer);
  }

  private async handleGitLabWebhook(payload: GitLabPayload): Promise<void> {
    const objectKind = payload.object_kind;
    this.logger.info('Processing GitLab webhook', { objectKind });

    if (objectKind === 'issue' && payload.object_attributes?.action === 'open') {
      await this.processIssueEvent(payload);
    } else if (objectKind === 'merge_request' &&
               (payload.object_attributes?.action === 'open' ||
                payload.object_attributes?.action === 'reopen')) {
      await this.processMergeRequestEvent(payload);
    }
  }

  private async processIssueEvent(payload: GitLabPayload): Promise<void> {
    const issue = payload.object_attributes;
    const project = payload.project;

    const labels = payload.labels ?? [];
    const hasAutomationLabel = labels.some((label) =>
      (label.title ?? '').toLowerCase().includes('automation') ||
      (label.title ?? '').toLowerCase().includes('ai-task')
    );

    if (!hasAutomationLabel) {
      this.logger.info('Issue does not have automation label, skipping', { issueId: issue?.id });
      return;
    }

    this.logger.info('Processing issue for automation', {
      issueId: issue?.id,
      title: issue?.title,
      projectId: project?.id,
    });

    const taskPrompt = `
Issue #${issue?.iid}: ${issue?.title}
Description: ${issue?.description}
Labels: ${labels.map((l) => l.title ?? '').join(', ')}

Please analyze this issue and implement the necessary changes.
`;

    try {
      const result = await this.executeOpencodeRun('build', taskPrompt);
      await this.createBranchAndPush(result, `issue-${issue?.iid}`);
      await this.createMergeRequest(project?.id ?? 0, issue?.iid ?? 0, `Fix issue #${issue?.iid}: ${issue?.title}`, result.summary ?? '');
    } catch (error) {
      this.logger.error('Failed to process issue', { issueId: issue?.id, error });
    }
  }

  private async processMergeRequestEvent(payload: GitLabPayload): Promise<void> {
    this.logger.info('Merge request event received', { mrId: payload.object_attributes?.iid });
  }

  async executeOpencodeRun(agent: string, prompt: string, sessionId?: string): Promise<ToolResult> {
    this.logger.info('Executing OpenCode run', { agent, prompt, sessionId });

    const session = this.getOrCreateSession(sessionId);
    session.agent = agent;
    session.addMessage('user', prompt);

    try {
      const args = [
        'run',
        '--agent', agent,
        '--auto',
        '--format', 'json',
        '--', prompt
      ];

      if (sessionId) {
        args.push('--session-id');
        args.push(sessionId);
      }

      const child: ChildProcess = spawn(this.config.opencodePath ?? 'opencode', args, {
        cwd: this.repoPath,
        env: {
          ...process.env,
          FORCE_COLOR: '0',
        },
      });

      let stdoutData = '';
      let stderrData = '';
      let result: unknown = null;

      child.stdout?.on('data', (data) => {
        stdoutData += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderrData += data.toString();
      });

      const timeoutMs = 300000;
      const timeout = setTimeout(() => {
        child.kill();
        throw new Error(`OpenCode command timed out after ${timeoutMs/1000}s`);
      }, timeoutMs);

      const promise = new Promise<string>((resolve, reject) => {
        child.on('close', (code) => {
          clearTimeout(timeout);
          if (code === 0) {
            resolve(stdoutData);
          } else {
            reject(new Error(`OpenCode process exited with code ${code}: ${stderrData}`));
          }
        });

        child.on('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });

      try {
        const output = await promise;
        try {
          result = JSON.parse(output);
        } catch {
          result = { rawOutput: output };
        }

        session.addToolResult({
          tool: 'opencode_run',
          args: { agent, prompt, sessionId },
          timestamp: Date.now(),
          result,
        });

        return {
          success: true,
          output: result,
          sessionId: session.id,
        };
      } catch (error) {
        session.addToolResult({
          tool: 'opencode_run',
          args: { agent, prompt, sessionId },
          timestamp: Date.now(),
          error: error instanceof Error ? error.message : String(error),
        });

        throw error;
      }
    } catch (error) {
      this.logger.error('OpenCode execution failed', error);
      throw error;
    }
  }

  async executeGitStatus(path?: string): Promise<ToolResult> {
    this.logger.info('Executing git status', { path });
    try {
      const args = ['status', '--porcelain'];
      if (path) {
        args.push('--', path);
      }

      const output = execSync(`${this.config.gitPath} ${args.join(' ')}`, {
        cwd: this.repoPath,
        encoding: 'utf8',
      });

      const files = output
        .trim()
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => ({
          status: line.substring(0, 2),
          file: line.substring(3).trim(),
        }));

      return {
        success: true,
        files,
        clean: files.length === 0,
      };
    } catch (error) {
      this.logger.error('Git status failed', error);
      throw error;
    }
  }

  async executeGitCommitPush(message: string, branch?: string, path?: string): Promise<ToolResult> {
    this.logger.info('Executing git commit and push', { message, branch, path });
    try {
      const repoPath = this.repoPath;

      const addArgs = ['add'];
      if (path) {
        addArgs.push('--', path);
      } else {
        addArgs.push('.');
      }
      execSync(`${this.config.gitPath} ${addArgs.join(' ')}`, { cwd: repoPath, stdio: 'ignore' });

      const commitArgs = ['commit', '-m', message];
      execSync(`${this.config.gitPath} ${commitArgs.join(' ')}`, { cwd: repoPath, stdio: 'ignore' });

      const pushArgs = ['push'];
      if (branch) {
        pushArgs.push('origin', branch);
      } else {
        pushArgs.push('origin');
      }
      execSync(`${this.config.gitPath} ${pushArgs.join(' ')}`, { cwd: repoPath, stdio: 'ignore' });

      let currentBranch = branch;
      if (!branch) {
        const branchOutput = execSync(`${this.config.gitPath} rev-parse --abbrev-ref HEAD`, {
          cwd: repoPath,
          encoding: 'utf8',
        });
        currentBranch = branchOutput.trim();
      }

      return {
        success: true,
        message,
        branch: currentBranch,
        timestamp: Date.now(),
      };
    } catch (error) {
      this.logger.error('Git commit/push failed', error);
      throw error;
    }
  }

  private async createBranchAndPush(result: ToolResult, _baseBranch: string): Promise<string> {
    const timestamp = Date.now();
    const branchName = `feature/ai-task-${timestamp}`;

    execSync(`${this.config.gitPath} checkout -b ${branchName}`, {
      cwd: this.repoPath,
      stdio: 'ignore',
    });

    execSync(`${this.config.gitPath} add .`, {
      cwd: this.repoPath,
      stdio: 'ignore',
    });

    const commitMessage = `AI: Implement feature based on analysis\n\n${JSON.stringify(result, null, 2)}`;
    execSync(`${this.config.gitPath} commit -m "${commitMessage.replace(/"/g, '\\"')}"`, {
      cwd: this.repoPath,
      stdio: 'ignore',
    });

    execSync(`${this.config.gitPath} push -u origin ${branchName}`, {
      cwd: this.repoPath,
      stdio: 'ignore',
    });

    return branchName;
  }

  private async createMergeRequest(projectId: number, issueIid: number, title: string, description: string): Promise<MergeRequestResult> {
    if (!this.gitlabToken) {
      this.logger.warn('GitLab token not configured, skipping MR creation');
      return { success: false, error: 'No GitLab token' };
    }

    try {
      const fetch = (await import('node-fetch')).default;
      const url = `${this.config.gitlabUrl || process.env.GITLAB_URL || 'http://gitlab:8929'}/api/v4/projects/${projectId}/merge_requests`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'PRIVATE-TOKEN': this.gitlabToken,
        },
        body: JSON.stringify({
          source_branch: `feature/ai-task-${Date.now()}`,
          target_branch: 'main',
          title,
          description,
          remove_source_branch: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as { iid: number; web_url: string };
      this.logger.info('Merge request created', { mrId: data.iid, webUrl: data.web_url });
      return { success: true, mrId: data.iid, webUrl: data.web_url };
    } catch (error) {
      this.logger.error('Failed to create merge request', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private generateId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  private createSession(id: string): Session {
    const session = new Session(id, this.sessionTtl, () => {
      void this.persistSession(session);
    });
    this.sessions.set(id, session);
    void this.persistSession(session);
    this.logger.info('Created new session', { sessionId: id });
    return session;
  }

  public getOrCreateSession(sessionId?: string): Session {
    const id = sessionId || this.generateId();
    const existing = this.sessions.get(id);
    if (existing) {
      if (existing.isExpired()) {
        this.sessions.delete(id);
        void this.deleteSessionFile(id);
        return this.createSession(this.generateId());
      }
      existing.refreshTTL();
      return existing;
    }
    return this.createSession(id);
  }

  public getSession(sessionId: string): Session | undefined {
    const session = this.sessions.get(sessionId);
    if (session && !session.isExpired()) {
      session.refreshTTL();
      return session;
    }
    return undefined;
  }

  public getAllSessions(): Session[] {
    return Array.from(this.sessions.values()).filter((session) => !session.isExpired());
  }

  public listSessions(): Array<{
    id: string;
    agent: string;
    status: Session['status'];
    messageCount: number;
    toolResultCount: number;
    createdAt: number;
    lastActivity: number;
    expiresAt: number;
    ttl: number;
  }> {
    return Array.from(this.sessions.values())
      .filter((session) => !session.isExpired())
      .map((session) => ({
        id: session.id,
        agent: session.agent,
        status: session.status,
        messageCount: session.messages.length,
        toolResultCount: session.toolResults.length,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        expiresAt: session.expiresAt,
        ttl: session.ttl,
      }));
  }

  public sessionInfo(sessionId: string): {
    id: string;
    agent: string;
    messages: Session['messages'];
    toolResults: Session['toolResults'];
    status: Session['status'];
    isExpired: boolean;
  } | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }
    return {
      id: session.id,
      agent: session.agent,
      messages: [...session.messages],
      toolResults: [...session.toolResults],
      status: session.status,
      isExpired: session.isExpired(),
    };
  }

  public async cleanupSession(sessionId: string, preserve?: boolean): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }
    this.sessions.delete(sessionId);
    if (!preserve) {
      await this.deleteSessionFile(sessionId);
    }
    this.logger.info('Cleaned up session', { sessionId });
    return true;
  }

  public renewSessionTtl(sessionId: string, ttl?: number): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }
    session.extendTTL(ttl ?? this.sessionTtl);
    return true;
  }

  public pauseSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }
    session.pause();
    return true;
  }

  public resumeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }
    session.resume();
    return true;
  }

  public completeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }
    session.complete();
    return true;
  }

  private async persistSession(session: Session): Promise<void> {
    if (this.persistence !== 'file') {
      return;
    }
    try {
      await fs.mkdir(this.sessionDir, { recursive: true });
      const file = path.join(this.sessionDir, `${session.id}.json`);
      const data = {
        id: session.id,
        agent: session.agent,
        messages: session.messages,
        toolResults: session.toolResults,
        status: session.status,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        ttl: session.ttl,
        expiresAt: session.expiresAt,
      };
      await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
      this.logger.debug('Persisted session', { sessionId: session.id });
    } catch (error) {
      this.logger.error('Failed to persist session', { sessionId: session.id, error });
    }
  }

  private async deleteSessionFile(sessionId: string): Promise<void> {
    if (this.persistence !== 'file') {
      return;
    }
    try {
      await fs.unlink(path.join(this.sessionDir, `${sessionId}.json`));
      this.logger.debug('Deleted session file', { sessionId });
    } catch {
      // File may not exist; ignore
    }
  }

  private async loadPersistedSessions(): Promise<void> {
    if (this.persistence !== 'file') {
      return;
    }
    try {
      const files = await fs.readdir(this.sessionDir);
      for (const file of files) {
        if (!file.endsWith('.json')) {
          continue;
        }
        try {
          const raw = await fs.readFile(path.join(this.sessionDir, file), 'utf8');
          const data = JSON.parse(raw);
          if (!data || typeof data.id !== 'string') {
            continue;
          }
          const session = new Session(data.id, data.ttl || this.sessionTtl, () => {
            void this.persistSession(session);
          });
          session.agent = data.agent ?? '';
          session.messages = data.messages ?? [];
          session.toolResults = data.toolResults ?? [];
          session.status = data.status ?? 'active';
          session.createdAt = data.createdAt ?? Date.now();
          session.lastActivity = data.lastActivity ?? Date.now();
          session.expiresAt = data.expiresAt ?? Date.now() + session.ttl;
          if (session.isExpired()) {
            await this.deleteSessionFile(session.id);
            continue;
          }
          this.sessions.set(session.id, session);
          this.logger.debug('Loaded persisted session', { sessionId: session.id });
        } catch (error) {
          this.logger.warn('Failed to load persisted session file', { file, error });
        }
      }
    } catch (error) {
      this.logger.debug('No persisted sessions to load', { error });
    }
  }

  private async persistAllSessions(): Promise<void> {
    for (const session of this.sessions.values()) {
      await this.persistSession(session);
    }
  }

  private startTimers(): void {
    if (this.persistence === 'file' && !this.snapshotTimer) {
      this.snapshotTimer = setInterval(() => {
        void this.persistAllSessions();
      }, this.snapshotInterval);
      this.snapshotTimer.unref();
      this.logger.debug('Started snapshot timer', { interval: this.snapshotInterval });
    }
    if (this.cleanupInterval > 0 && !this.cleanupTimer) {
      this.cleanupTimer = setInterval(() => {
        void this.cleanupExpiredSessions();
      }, this.cleanupInterval);
      this.cleanupTimer.unref();
      this.logger.debug('Started cleanup timer', { interval: this.cleanupInterval });
    }
    this.logger.info('Started background timers');
  }

  private stopTimers(): void {
    if (this.snapshotTimer) {
      clearInterval(this.snapshotTimer);
      this.snapshotTimer = undefined;
    }
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.logger.info('Stopped background timers');
  }

  private async cleanupExpiredSessions(): Promise<void> {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      if (now > session.expiresAt) {
        this.sessions.delete(id);
        await this.deleteSessionFile(id);
        this.logger.info('Cleaned up expired session', { sessionId: id });
      }
    }
  }

  public async executeToolCall(tool: string, args: Record<string, unknown>): Promise<ToolResult> {
    this.logger.info('Executing tool call', { tool, args });

    switch (tool) {
      case 'opencode_run':
        return await this.executeOpencodeRun(args.agent as string, args.prompt as string, args.sessionId as string | undefined);
      case 'git_status':
        return await this.executeGitStatus(args.path as string | undefined);
      case 'git_commit_push':
        return await this.executeGitCommitPush(args.message as string, args.branch as string | undefined, args.path as string | undefined);
      default:
        throw new Error(`Unknown tool: ${tool}`);
    }
  }
}


