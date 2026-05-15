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

// Helper to extract tableName from table string or object
const getTableName = (table: any): string => {
  if (typeof table === 'string') return table;
  return table?._name || 'unknown';
};

// Helper to extract where conditions from Drizzle-like or simple objects
const parseWhere = (where: any): any => {
  if (!where) return {};
  
  // Handle drizzle-orm eq() and other operators
  // These usually have a 'left' and 'right' or similar structure depending on version
  // But for our mock, we'll try to extract common patterns
  if (where.left && where.right) {
    const key = where.left.name || 'id';
    return { [key]: where.right };
  }

  // Handle simple objects { id: 'xxx' }
  return where;
};

// Create a Drizzle-like query interface
const dbQueryInterface = {
  chatSessions: {
    findFirst: async ({ where }: { where: any }) => {
      const condition = parseWhere(where);
      const result = queryOne('SELECT * FROM chat_sessions WHERE id = ?', [condition.id]);
      if (!result) return null;
      return {
        ...result,
        createdAt: new Date(result.created_at as number),
        updatedAt: new Date(result.updated_at as number),
      };
    },
    findMany: async ({ orderBy, limit, offset }: any) => {
      const results = getSessions(limit || 50, offset || 0);
      return results.map((row: any) => ({
        ...row,
        createdAt: new Date(row.created_at as number),
        updatedAt: new Date(row.updated_at as number),
      }));
    },
  },
  messages: {
    findFirst: async ({ where }: { where: any }) => {
      const condition = parseWhere(where);
      const result = queryOne('SELECT * FROM messages WHERE id = ?', [condition.id]);
      if (!result) return null;
      return {
        ...result,
        createdAt: new Date(result.created_at as number),
        toolCalls: result.tool_calls ? JSON.parse(result.tool_calls as string) : undefined,
        toolResults: result.tool_results ? JSON.parse(result.tool_results as string) : undefined,
      };
    },
    findMany: async ({ where, orderBy, limit }: any) => {
      const condition = parseWhere(where);
      if (condition?.sessionId) {
        return getMessagesBySession(condition.sessionId, limit || 50);
      }
      const results = query('SELECT * FROM messages LIMIT ?', [limit || 50]);
      return results;
    },
  },
};

// Insert/delete/update operations
const dbOperations = {
  insert: (table: any) => ({
    values: async (data: any) => {
      const tableName = getTableName(table);
      if (tableName === 'chatSessions') {
        createSession({
          id: data.id,
          title: data.title,
          model: data.model,
        });
      } else if (tableName === 'messages') {
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
  delete: (table: any) => ({
    where: async (where: any) => {
      const tableName = getTableName(table);
      const condition = parseWhere(where);
      if (tableName === 'chatSessions' && condition?.id) {
        deleteSession(condition.id);
      } else if (tableName === 'messages' && condition?.id) {
        deleteMessage(condition.id);
      } else if (tableName === 'messages' && condition?.sessionId) {
        // Special case: delete all messages for a session
        run('DELETE FROM messages WHERE session_id = ?', [condition.sessionId]);
      }
    },
  }),
  update: (table: any) => ({
    set: (data: any) => ({
      where: async (where: any) => {
        const tableName = getTableName(table);
        const condition = parseWhere(where);
        if (tableName === 'chatSessions' && condition?.id) {
          if (data.updatedAt) {
            updateSessionTimestamp(condition.id);
          }
        } else if (tableName === 'messages' && condition?.id) {
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
