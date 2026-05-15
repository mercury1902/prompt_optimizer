/**
 * Database Schema for Chat System
 * Native SQLite with Drizzle ORM-compatible types
 */

// Enums
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

// Tool data types
export interface ToolCallData {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResultData {
  toolCallId: string;
  name: string;
  result: unknown;
  error?: string;
  duration?: number;
}

// Main entity interfaces
export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  model?: string;
}

export interface Message {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
  toolCalls?: ToolCallData[];
  toolResults?: ToolResultData[];
  isComplete?: boolean;
}

// SQLite table definitions (for reference)
export const sqlSchema = `
CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  model TEXT
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  tool_calls TEXT,
  tool_results TEXT,
  is_complete INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON chat_sessions(updated_at DESC);
`;

// Table placeholders for type inference (Drizzle ORM compatible)
export const chatSessions = {
  id: { name: 'id' } as { name: 'id', $type: string },
  title: { name: 'title' } as { name: 'title', $type: string },
  createdAt: { name: 'createdAt' } as { name: 'createdAt', $type: Date },
  updatedAt: { name: 'updatedAt' } as { name: 'updatedAt', $type: Date },
  model: { name: 'model' } as { name: 'model', $type: string | undefined },
  _name: 'chatSessions',
  $inferSelect: {} as ChatSession,
  $inferInsert: {} as Partial<ChatSession>,
};

export const messages = {
  id: { name: 'id' } as { name: 'id', $type: string },
  sessionId: { name: 'sessionId' } as { name: 'sessionId', $type: string },
  role: { name: 'role' } as { name: 'role', $type: MessageRole },
  content: { name: 'content' } as { name: 'content', $type: string },
  createdAt: { name: 'createdAt' } as { name: 'createdAt', $type: Date },
  toolCalls: { name: 'toolCalls' } as { name: 'toolCalls', $type: ToolCallData[] | undefined },
  toolResults: { name: 'toolResults' } as { name: 'toolResults', $type: ToolResultData[] | undefined },
  isComplete: { name: 'isComplete' } as { name: 'isComplete', $type: boolean },
  _name: 'messages',
  $inferSelect: {} as Message,
  $inferInsert: {} as Partial<Message>,
};

// Zod-like validation schemas (placeholders for future use)
export const insertChatSessionSchema = {
  parse: (data: unknown): ChatSession => data as ChatSession,
};

export const selectChatSessionSchema = {
  parse: (data: unknown): ChatSession => data as ChatSession,
};

export const insertMessageSchema = {
  parse: (data: unknown): Message => data as Message,
};

export const selectMessageSchema = {
  parse: (data: unknown): Message => data as Message,
};
