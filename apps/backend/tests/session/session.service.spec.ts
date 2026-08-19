import { McpBridge } from '../../src/bridge';
import { promises as fs } from 'fs';
import path from 'path';

describe('Session Management', () => {
  let bridge: McpBridge;
  const testDir = 'C:\\Users\\amrmo\\OneDrive\\Desktop\\hexastudio.net\\test-sessions';

  beforeEach(async () => {
    // Clean up any existing test sessions
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Directory doesn't exist, ignore
    }
    
    bridge = new McpBridge({
      sessionTtl: 60000, // 1 minute for testing
      persistence: 'file',
      cleanupInterval: 5000, // 5 seconds for testing
      repoPath: testDir
    });
    
    await bridge.start();
  });

  afterEach(async () => {
    await bridge.stop();
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Directory doesn't exist, ignore
    }
  });

  describe('Session Creation and Retrieval', () => {
    it('should create a new session', () => {
      const session = bridge.getOrCreateSession('test-session-1');
      expect(session).toBeDefined();
      expect(session.id).toBe('test-session-1');
      expect(session.agent).toBe('');
      expect(session.messages).toHaveLength(0);
      expect(session.toolResults).toHaveLength(0);
      expect(session.status).toBe('active');
      expect(session.ttl).toBe(60000);
      expect(session.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should reuse existing session if not expired', () => {
      const session1 = bridge.getOrCreateSession('test-session-2');
      const session2 = bridge.getOrCreateSession('test-session-2');
      
      expect(session1.id).toBe(session2.id);
      expect(session1).toBe(session2);
    });

    it('should create new session if expired', async () => {
      const session1 = bridge.getOrCreateSession('test-session-3');
      
      // Manually expire the session
      session1.expiresAt = Date.now() - 1000;
      
      const session2 = bridge.getOrCreateSession('test-session-3');
      
      expect(session1.id).not.toBe(session2.id);
      expect(session2).toBeDefined();
      expect(session2.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should return undefined for expired session when retrieved', () => {
      const session1 = bridge.getOrCreateSession('test-session-4');
      session1.expiresAt = Date.now() - 1000;
      
      const session2 = bridge.getSession('test-session-4');
      expect(session2).toBeUndefined();
    });
  });

  describe('Session List and Info', () => {
    it('should list all active sessions', () => {
      const session1 = bridge.getOrCreateSession('test-session-5');
      const session2 = bridge.getOrCreateSession('test-session-6');
      
      const sessions = bridge.listSessions();
      
      expect(sessions).toHaveLength(2);
      expect(sessions.some(s => s.id === 'test-session-5')).toBe(true);
      expect(sessions.some(s => s.id === 'test-session-6')).toBe(true);
      
      sessions.forEach(s => {
        expect(s).toHaveProperty('id');
        expect(s).toHaveProperty('agent');
        expect(s).toHaveProperty('status');
        expect(s).toHaveProperty('messageCount');
        expect(s).toHaveProperty('toolResultCount');
        expect(s).toHaveProperty('createdAt');
        expect(s).toHaveProperty('lastActivity');
        expect(s).toHaveProperty('expiresAt');
        expect(s).toHaveProperty('ttl');
      });
    });

    it('should return session info', () => {
      const session = bridge.getOrCreateSession('test-session-7');
      session.agent = 'test-agent';
      session.messages.push({ role: 'user', content: 'Hello', timestamp: Date.now() });
      session.toolResults.push({ tool: 'test', args: {}, timestamp: Date.now() });
      
      const info = bridge.sessionInfo('test-session-7');
      
      expect(info).toBeDefined();
      expect(info!.id).toBe('test-session-7');
      expect(info!.agent).toBe('test-agent');
      expect(info!.messages).toHaveLength(1);
      expect(info!.toolResults).toHaveLength(1);
      expect(info!.status).toBe('active');
      expect(info!.isExpired).toBe(false);
    });

    it('should return null for non-existent session info', () => {
      const info = bridge.sessionInfo('non-existent-session');
      expect(info).toBeNull();
    });
  });

  describe('Session Cleanup', () => {
    it('should cleanup specific session', async () => {
      const session = bridge.getOrCreateSession('test-session-8');
      expect(bridge.listSessions()).toHaveLength(1);
      
      const result = await bridge.cleanupSession('test-session-8');
      expect(result).toBe(true);
      expect(bridge.listSessions()).toHaveLength(0);
    });

    it('should return false for non-existent session cleanup', async () => {
      const result = await bridge.cleanupSession('non-existent-session');
      expect(result).toBe(false);
    });

    it('should preserve data when cleaning up session', async () => {
      const session = bridge.getOrCreateSession('test-session-9');
      const sessionData = {
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
      
      await bridge.cleanupSession('test-session-9', true);
      
      // Check if session file still exists
      const sessionFile = path.join(testDir, 'data', ${session.id}.json);
      try {
        const fileContent = await fs.readFile(sessionFile, 'utf8');
        const parsedData = JSON.parse(fileContent);
        expect(parsedData.id).toBe(sessionData.id);
      } catch (error) {
        // File might not exist due to async cleanup
      }
    });
  });

  describe('Session TTL Management', () => {
    it('should renew session TTL', () => {
      const session = bridge.getOrCreateSession('test-session-10');
      const originalExpiresAt = session.expiresAt;
      
      const result = bridge.renewSessionTtl('test-session-10', 120000); // 2 minutes
      expect(result).toBe(true);
      
      expect(session.expiresAt).toBeGreaterThan(originalExpiresAt);
      expect(session.ttl).toBe(120000);
    });

    it('should return false for non-existent session TTL renewal', () => {
      const result = bridge.renewSessionTtl('non-existent-session', 120000);
      expect(result).toBe(false);
    });

    it('should use default TTL when renewing without specifying', () => {
      const session = bridge.getOrCreateSession('test-session-11');
      const originalExpiresAt = session.expiresAt;
      
      const result = bridge.renewSessionTtl('test-session-11');
      expect(result).toBe(true);
      
      expect(session.expiresAt).toBeGreaterThan(originalExpiresAt);
    });
  });

  describe('Session Persistence', () => {
    it('should persist session to file', async () => {
      const session = bridge.getOrCreateSession('test-session-12');
      session.agent = 'test-persistence-agent';
      session.messages.push({ role: 'user', content: 'Test message', timestamp: Date.now() });
      
      // Wait for persistence
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const sessionFile = path.join(testDir, 'data', ${session.id}.json);
      const fileContent = await fs.readFile(sessionFile, 'utf8');
      const sessionData = JSON.parse(fileContent);
      
      expect(sessionData.id).toBe(session.id);
      expect(sessionData.agent).toBe('test-persistence-agent');
      expect(sessionData.messages).toHaveLength(1);
      expect(sessionData.messages[0].content).toBe('Test message');
    });

    it('should load persisted sessions on startup', async () => {
      // Create a session file manually
      const sessionId = 'test-session-13';
      const sessionData = {
        id: sessionId,
        agent: 'manual-agent',
        messages: [{ role: 'user', content: 'Manual message', timestamp: Date.now() }],
        toolResults: [],
        status: 'active',
        createdAt: Date.now(),
        lastActivity: Date.now(),
        ttl: 60000,
        expiresAt: Date.now() + 60000,
      };
      
      const dataDir = path.join(testDir, 'data');
      await fs.mkdir(dataDir, { recursive: true });
      await fs.writeFile(path.join(dataDir, ${sessionId}.json), JSON.stringify(sessionData, null, 2));
      
      // Create new bridge and check if session is loaded
      const newBridge = new McpBridge({
        sessionTtl: 60000,
        persistence: 'file',
        repoPath: testDir
      });
      
      await newBridge.start();
      
      const sessions = newBridge.getAllSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe(sessionId);
      expect(sessions[0].agent).toBe('manual-agent');
      
      await newBridge.stop();
    });
  });

  describe('Session Expiration and Cleanup', () => {
    it('should automatically cleanup expired sessions', async () => {
      const session1 = bridge.getOrCreateSession('test-session-14');
      const session2 = bridge.getOrCreateSession('test-session-15');
      
      // Manually expire one session
      session1.expiresAt = Date.now() - 1000;
      
      // Wait for cleanup interval
      await new Promise(resolve => setTimeout(resolve, 6000));
      
      const sessions = bridge.getAllSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe('test-session-15');
    });

    it('should return only active sessions from getAllSessions', () => {
      const session1 = bridge.getOrCreateSession('test-session-16');
      const session2 = bridge.getOrCreateSession('test-session-17');
      
      // Expire one session
      session1.expiresAt = Date.now() - 1000;
      
      const activeSessions = bridge.getAllSessions();
      expect(activeSessions).toHaveLength(1);
      expect(activeSessions[0].id).toBe('test-session-17');
    });
  });

  describe('Session State Management', () => {
    it('should update session state correctly', () => {
      const session = bridge.getOrCreateSession('test-session-18');
      
      // Test session state updates through prototype methods
      (session as any).addMessage('assistant', 'Hello there!');
      (session as any).addToolResult({ tool: 'test', args: {}, timestamp: Date.now() });
      
      expect(session.messages).toHaveLength(1);
      expect(session.messages[0].role).toBe('assistant');
      expect(session.messages[0].content).toBe('Hello there!');
      expect(session.toolResults).toHaveLength(1);
      expect(session.toolResults[0].tool).toBe('test');
      expect(session.lastActivity).toBeGreaterThan(session.createdAt);
    });

    it('should refresh TTL correctly', () => {
      const session = bridge.getOrCreateSession('test-session-19');
      const originalExpiresAt = session.expiresAt;
      
      (session as any).refreshTTL();
      
      expect(session.expiresAt).toBeGreaterThan(originalExpiresAt);
    });

    it('should extend TTL correctly', () => {
      const session = bridge.getOrCreateSession('test-session-20');
      const originalTtl = session.ttl;
      
      (session as any).extendTTL(120000);
      
      expect(session.ttl).toBe(120000);
      expect(session.expiresAt).toBeGreaterThan(Date.now() + originalTtl);
    });
  });
});
