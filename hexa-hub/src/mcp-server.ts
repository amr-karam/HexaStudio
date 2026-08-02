import { Server as MCPServer } from 'mcp-server';
import { StdioServer } from '@mcpserver/stdio';
import { McpBridge } from './bridge';

// Start MCP server
async function start() {
  const bridge = new McpBridge({
    logLevel: 'info',
    opencodePath: process.env.OPENCODE_PATH || '/usr/local/bin/opencode',
    gitPath: process.env.GIT_PATH || 'git',
    repoPath: process.env.REPO_PATH
  });

  // Create MCP server instance
  const server = new MCPServer({ items: { bridge } });

  // Start MCP server
  await server.start();

  // Start stdio transport for external clients
  const stdioServer = new StdioServer();
  stdioServer.registerSFN('', server.getToolMethod);
  
  // Listen on stdio
  stdioServer.listen();
  console.log('MCP server started on stdio');
  
  process.stdin.on('data', (data) => {
    const message = JSON.parse(data.toString());
    server.handleMessage(message);
  });
}

start().catch(console.error);