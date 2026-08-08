import { timingSafeEqual } from 'crypto';
import { EventEmitter } from 'events';
import { spawn, ChildProcess, execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import winston from 'winston';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as http from 'http';

interface McpMessage {
  jsonrpc: "2.0";
  id?: string | number;
  method: string;
  params?: any;
}

interface McpResponse {
  jsonrpc: "2.0";
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

interface Session {
  id: string;
  agent: string;
  messages: Array<{ role: string; content: string; timestamp: number }>;
  toolResults: ToolCallResult[];
  status: 'active' | 'paused' | 'completed';
  createdAt: number;
  lastActivity: number;
}

interface McpBridgeConfig {
  logLevel?: winston.Level;
  opencodePath?: string;
  gitPath?: string;
  repoPath?: string;
  webhookPort?: number;
  webhookSecret?: string;
  gitlabUrl?: string;
  gitlabToken?: string;
}

export class McpBridge extends EventEmitter {
  private logger: winston.Logger;
  private config: McpBridgeConfig;
  private sessions: Map<string, Session> = new Map();
  private webhookServer?: http.Server;
  private webhookApp?: express.Express;
  private gitlabToken?: string;
  private repoPath: string;

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
      ...config,
    };

    this.logger = winston.createLogger({
      level: this.config.logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
      ],
    });

    this.repoPath = this.config.repoPath;
    this.gitlabToken = this.config.gitlabToken;
  }

  async start(): Promise<void> {
    this.logger.info('Starting MCP Bridge');
    await this.ensureDirectories();
    await this.startWebhookServer();
    this.emit('started');
  }

  async stop(): Promise<void> {
    this.logger.info('Stopping MCP Bridge');
    await this.stopWebhookServer();
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

    // Health endpoint
    this.webhookApp.get('/health', (_req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // GitLab webhook endpoint
    this.webhookApp.post('/webhook/gitlab', async (req, res) => {
      try {
        const token = req.headers['x-gitlab-token'];
        if (this.config.webhookSecret && !this.isValidWebhookToken(token, this.config.webhookSecret)) {
          this.logger.warn('Invalid webhook token');
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
  }

  private async stopWebhookServer(): Promise<void> {
    if (this.webhookServer) {
      return new Promise<void>((resolve) => {
        this.webhookServer!.close(() => {
          this.logger.info('Webhook server stopped');
          resolve();
        });
      });
    }
  }

  private isValidWebhookToken(token: string | string[] | undefined, secret: string): boolean {
    if (typeof token !== 'string') {
      return false;
    }

    const tokenBuffer = Buffer.from(token);
    const secretBuffer = Buffer.from(secret);
    return tokenBuffer.length === secretBuffer.length && timingSafeEqual(tokenBuffer, secretBuffer);
  }

  private async handleGitLabWebhook(payload: any): Promise<void> {
    const objectKind = payload.object_kind;
    this.logger.info('Processing GitLab webhook', { objectKind });

    if (objectKind === 'issue' && payload.object_attributes.action === 'open') {
      await this.processIssueEvent(payload);
    } else if (objectKind === 'merge_request' && 
               (payload.object_attributes.action === 'open' || 
                payload.object_attributes.action === 'reopen')) {
      await this.processMergeRequestEvent(payload);
    }
  }

  private async processIssueEvent(payload: any): Promise<void> {
    const issue = payload.object_attributes;
    const project = payload.project;

    // Check if issue has the right label to trigger automation
    const labels = payload.labels || [];
    const hasAutomationLabel = labels.some((label: any) => 
      label.title.toLowerCase().includes('automation') || 
      label.title.toLowerCase().includes('ai-task')
    );

    if (!hasAutomationLabel) {
      this.logger.info('Issue does not have automation label, skipping');
      return;
    }

    this.logger.info('Processing issue for automation', {
      issueId: issue.id,
      title: issue.title,
      projectId: project.id,
    });

    // Create a task from the issue
    const taskPrompt = `
Issue #${issue.iid}: ${issue.title}
Description: ${issue.description}
Labels: ${labels.map((l: any) => l.title).join(', ')}

Please analyze this issue and implement the necessary changes.
`;

    // Execute the task using the build agent
    try {
      const result = await this.executeOpencodeRun('build', taskPrompt);
      await this.createBranchAndPush(result, `issue-${issue.iid}`);
      await this.createMergeRequest(project.id, issue.iid, `Fix issue #${issue.iid}: ${issue.title}`, result.summary);
    } catch (error) {
      this.logger.error('Failed to process issue', error);
    }
  }

  private async processMergeRequestEvent(payload: any): Promise<void> {
    // Handle MR events if needed
    this.logger.info('Merge request event received', { mrId: payload.object_attributes.iid });
  }

  async executeOpencodeRun(agent: string, prompt: string, sessionId?: string): Promise<any> {
    this.logger.info('Executing OpenCode run', { agent, prompt, sessionId });

    const session = this.getOrCreateSession(sessionId);
    session.agent = agent;
    session.addMessage('user', prompt);

    try {
      // Build the opencode command
      const args = [
        'run',
        '--agent', agent,
        '--auto', // Auto-approve permissions
        '--format', 'json',
        '--', prompt
      ];

      if (sessionId) {
        args.push('--session-id');
        args.push(sessionId);
      }

      // Execute the command
      const child = spawn(this.config.opencodePath, args, {
        cwd: this.repoPath,
        env: {
          ...process.env,
          // Ensure we don't interfere with existing env
          FORCE_COLOR: '0', // Disable colors for easier parsing
        },
      });

      let stdoutData = '';
      let stderrData = '';
      let result: any = null;

      child.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      const timeoutMs = 300000; // 5 minutes timeout
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
        // Try to parse JSON output
        try {
          result = JSON.parse(output);
        } catch (parseError) {
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
          error: error.message,
        });

        throw error;
      }
    } catch (error) {
      this.logger.error('OpenCode execution failed', error);
      throw error;
    }
  }

  async executeGitStatus(path?: string): Promise<any> {
    this.logger.info('Executing git status', { path });
    try {
      const args = ['status', '--porcelain'];
      if (path) {
        args.push('--', path);
      }

      const output = execSync(this.config.gitPath + ' ' + args.join(' '), {
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

  async executeGitCommitPush(message: string, branch?: string, path?: string): Promise<any> {
    this.logger.info('Executing git commit and push', { message, branch, path });
    try {
      // Ensure we're in the repo
      const repoPath = this.repoPath;

      // Add files
      let addArgs = ['add'];
      if (path) {
        addArgs.push('--', path);
      } else {
        addArgs.push('.');
      }
      execSync(this.config.gitPath + ' ' + addArgs.join(' '), { cwd: repoPath, stdio: 'ignore' });

      // Commit
      const commitArgs = ['commit', '-m', message];
      execSync(this.config.gitPath + ' ' + commitArgs.join(' '), { cwd: repoPath, stdio: 'ignore' });

      // Push
      const pushArgs = ['push'];
      if (branch) {
        pushArgs.push('origin', branch);
      } else {
        pushArgs.push('origin');
      }
      execSync(this.config.gitPath + ' ' + pushArgs.join(' '), { cwd: repoPath, stdio: 'ignore' });

      // Get current branch if not specified
      let currentBranch = branch;
      if (!branch) {
        const branchOutput = execSync(this.config.gitPath + ' rev-parse --abbrev-ref HEAD', {
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

  private async createBranchAndPush(result: any, baseBranch: string): Promise<string> {
    const timestamp = Date.now();
    const branchName = `feature/ai-task-${timestamp}`;

    // Create and checkout new branch
    execSync(`${this.config.gitPath} checkout -b ${branchName}`, {
      cwd: this.repoPath,
      stdio: 'ignore',
    });

    // Commit the changes from the AI work
    execSync(`${this.config.gitPath} add .`, {
      cwd: this.repoPath,
      stdio: 'ignore',
    });

    const commitMessage = `AI: Implement feature based on analysis\n\n${JSON.stringify(result, null, 2)}`;
    execSync(`${this.config.gitPath} commit -m "${commitMessage.replace(/"/g, '\\"')}"`, {
      cwd: this.repoPath,
      stdio: 'ignore',
    });

    // Push the branch
    execSync(`${this.config.gitPath} push -u origin ${branchName}`, {
      cwd: this.repoPath,
      stdio: 'ignore',
    });

    return branchName;
  }

  private async createMergeRequest(projectId: number, issueIid: number, title: string, description: string): Promise<any> {
    if (!this.gitlabToken) {
      this.logger.warn('GitLab token not configured, skipping MR creation');
      return { success: false, reason: 'No GitLab token' };
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

      const data = await response.json();
      this.logger.info('Merge request created', { mrId: data.iid, webUrl: data.web_url });
      return { success: true, mrId: data.iid, webUrl: data.web_url };
    } catch (error) {
      this.logger.error('Failed to create merge request', error);
      return { success: false, error: error.message };
    }
  }

  private getOrCreateSession(sessionId?: string): Session {
    if (sessionId && this.sessions.has(sessionId)) {
      return this.sessions.get(sessionId)!;
    }

    const id = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: Session = {
      id,
      agent: '',
      messages: [],
      toolResults: [],
      status: 'active',
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };

    this.sessions.set(id, session);
    return session;
  }

  public getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  public getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  public async executeToolCall(tool: string, args: any): Promise<any> {
    this.logger.info('Executing tool call', { tool, args });

    switch (tool) {
      case 'opencode_run':
        return await this.executeOpencodeRun(args.agent, args.prompt, args.sessionId);
      case 'git_status':
        return await this.executeGitStatus(args.path);
      case 'git_commit_push':
        return await this.executeGitCommitPush(args.message, args.branch, args.path);
      default:
        throw new Error(`Unknown tool: ${tool}`);
    }
  }
}

export { McpBridge };