// Database layer using native Node.js SQLite (node:sqlite)
// No external dependencies - works with Node.js 22.12.0+

import {
  query,
  queryOne,
  run,
  createSession,
  getSession,
  updateSessionTimestamp,
  deleteSession,
  getSessions,
  createMessage,
  getMessagesBySession,
  updateMessageContent,
  deleteMessage,
  searchMessages,
  closeDatabase,
  isDatabaseAvailable,
  db as nativeDb,
} from './native-sqlite-database-client';

import type { ChatSession, Message, ToolCallData, ToolResultData } from './schema';

// Re-export schema types
export * from './schema';
export type { ChatSession, Message, ToolCallData, ToolResultData };

// Export database availability check
export { isDatabaseAvailable, closeDatabase };

// Create a Drizzle-like query interface
const dbQueryInterface = {
  chatSessions: {
    findFirst: async ({ where }: { where: { id: string } }) => {
      const result = queryOne('SELECT * FROM chat_sessions WHERE id = ?', [where.id]);
      if (!result) return null;
      return {
        ...result,
        createdAt: new Date(result.created_at as number),
        updatedAt: new Date(result.updated_at as number),
      };
    },
    findMany: async ({ orderBy, limit, offset }: any) => {
      // Note: orderBy is simplified - always sorts by updated_at DESC
      const results = getSessions(limit || 20, offset || 0);
      return results.map((row: any) => ({
        ...row,
        createdAt: new Date(row.created_at as number),
        updatedAt: new Date(row.updated_at as number),
      }));
    },
  },
  messages: {
    findFirst: async ({ where }: { where: { id: string } }) => {
      const result = queryOne('SELECT * FROM messages WHERE id = ?', [where.id]);
      if (!result) return null;
      return {
        ...result,
        createdAt: new Date(result.created_at as number),
        toolCalls: result.tool_calls ? JSON.parse(result.tool_calls as string) : undefined,
        toolResults: result.tool_results ? JSON.parse(result.tool_results as string) : undefined,
      };
    },
    findMany: async ({ where, orderBy, limit }: any) => {
      if (where?.sessionId) {
        return getMessagesBySession(where.sessionId, limit || 50);
      }
      // Fallback: return all messages (shouldn't happen in practice)
      const results = query('SELECT * FROM messages LIMIT ?', [limit || 50]);
      return results;
    },
  },
};

// Insert/delete/update operations
const dbOperations = {
  insert: (table: string) => ({
    values: async (data: any) => {
      if (table === 'chatSessions') {
        createSession({
          id: data.id,
          title: data.title,
          model: data.model,
        });
      } else if (table === 'messages') {
        createMessage({
          id: data.id,
          sessionId: data.sessionId,
          role: data.role,
          content: data.content,
          toolCalls: data.toolCalls,
          toolResults: data.toolResults,
          isComplete: data.isComplete,
        });
      }
      return { id: data.id };
    },
  }),
  delete: (table: string) => ({
    where: async (condition: any) => {
      if (table === 'chatSessions' && condition?.id) {
        deleteSession(condition.id);
      } else if (table === 'messages' && condition?.id) {
        deleteMessage(condition.id);
      }
    },
  }),
  update: (table: string) => ({
    set: (data: any) => ({
      where: async (condition: any) => {
        if (table === 'chatSessions' && condition?.id) {
          if (data.updatedAt) {
            updateSessionTimestamp(condition.id);
          }
        } else if (table === 'messages' && condition?.id) {
          if (data.content !== undefined) {
            updateMessageContent(condition.id, data.content);
          }
        }
      },
    }),
  }),
};

// Combined database interface compatible with Drizzle ORM patterns
export const db = isDatabaseAvailable()
  ? {
      query: dbQueryInterface,
      insert: dbOperations.insert,
      delete: dbOperations.delete,
      update: dbOperations.update,
      // Raw SQL access
      rawQuery: query,
      rawQueryOne: queryOne,
      rawRun: run,
    }
  : null;

// Migration client stub (schema is auto-initialized)
export const migrationClient = nativeDb;

// Utility functions for direct database access
export {
  createSession,
  getSession,
  getSessions,
  deleteSession,
  createMessage,
  getMessagesBySession,
  searchMessages,
};
