// Type definitions for MCP Bridge
type Message = {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: number;
  toolCallId?: string;
  toolResult?: any;
};

type ToolResult = {
  tool: string;
  args: any;
  timestamp: number;
  result: any;
  error?: string;
};

type Session = {
  id: string;
  agent: string;
  messages: Message[];
  toolResults: ToolResult[];
  status: "active" | "paused" | "completed";
  createdAt: number;
  lastActivity: number;
};

// Standardized MCP protocol types
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

interface ToolCall {
  tool: string;
  args: any;
  timeout?: number;
}