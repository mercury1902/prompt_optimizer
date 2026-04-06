// Schema stub - Phase 4 will implement full Drizzle ORM schema

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

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  createdAt: Date;
  toolCalls?: ToolCallData[];
  toolResults?: ToolResultData[];
}

// Stub table definitions for compatibility
export const chatSessions = {
  $inferSelect: {} as ChatSession,
  $inferInsert: {} as Partial<ChatSession>,
};

export const messages = {
  $inferSelect: {} as Message,
  $inferInsert: {} as Partial<Message>,
};

// Stub Zod schemas
export const insertChatSessionSchema = {};
export const selectChatSessionSchema = {};
export const insertMessageSchema = {};
export const selectMessageSchema = {};
