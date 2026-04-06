// Schema stub - Phase 4 will implement full Drizzle ORM schema

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
